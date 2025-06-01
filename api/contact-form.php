<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'subject', 'message'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Missing required fields: ' . implode(', ', $missing_fields)
    ]);
    exit();
}

// Sanitize input data
$name = trim(strip_tags($input['name']));
$email = trim(strip_tags($input['email']));
$subject = trim(strip_tags($input['subject']));
$message = trim(strip_tags($input['message']));

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Email configuration
$to = 'contact@aback.ai';
$email_subject = '[Contact Form] ' . $subject;
$from_email = 'noreply@aback.ai'; // Use your domain's email
$reply_to = $email;

// Create email body
$email_body = "
New contact form submission from aback.ai website:

Name: {$name}
Email: {$email}
Subject: {$subject}

Message:
{$message}

---
This message was sent from the contact form on aback.ai
Sender IP: {$_SERVER['REMOTE_ADDR']}
Timestamp: " . date('Y-m-d H:i:s T');

// Email headers
$headers = [
    'From: ' . $from_email,
    'Reply-To: ' . $reply_to,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
];

// Send email
$mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

if ($mail_sent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Thank you for your message. We will get back to you soon!'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Sorry, there was an error sending your message. Please try again later.'
    ]);
}
?>
