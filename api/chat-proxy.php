<?php
// Secure API proxy for Pinecone chatbot
header('Content-Type: application/json');

// CORS headers - update with your actual domain in production
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get request body
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

// Validate request data
if (!$requestData || !isset($requestData['message']) || empty($requestData['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit();
}

// Load API credentials from environment variables
$apiKey = getenv('PINECONE_API_KEY');
$assistantName = getenv('PINECONE_ASSISTANT_NAME');
$apiVersion = '2025-01';
$model = 'gpt-4o';

// Check if API credentials are available
if (!$apiKey || !$assistantName) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

// Set up the API request
$apiUrl = "https://prod-1-data.ke.pinecone.io/assistant/chat/{$assistantName}";

$headers = [
    'Content-Type: application/json',
    'Api-Key: ' . $apiKey,
    'X-Pinecone-API-Version: ' . $apiVersion
];

$postData = [
    'messages' => [
        [
            'role' => 'user',
            'content' => $requestData['message']
        ]
    ],
    'stream' => false,
    'model' => $model
];

// Initialize cURL session
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for cURL errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to connect to API service']);
    exit();
}

// Return the API response with the same status code
http_response_code($httpCode);
echo $response;
?>