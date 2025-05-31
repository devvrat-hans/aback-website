<?php
// Chat proxy for Pinecone Assistant API
// This file handles requests to the Pinecone Assistant API for the Aback.ai chatbot

// ===== CONFIGURATION SECTION =====
// IMPORTANT: Replace these values with your actual Pinecone credentials

$config = [
    // Your Pinecone API Key (required)
    'api_key' => 'pc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    
    // Your Pinecone Assistant ID (required)
    'assistant_id' => 'asst-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    
    // Pinecone API Base URL (usually doesn't need to change)
    'api_base_url' => 'https://api.pinecone.io/v1',
    
    // Rate limiting settings
    'rate_limit' => [
        'max_requests_per_minute' => 20,
        'max_requests_per_hour' => 100,
    ],
    
    // Request settings
    'request_timeout' => 30,
    'connection_timeout' => 10,
    
    // Security settings
    'allowed_origins' => [
        'https://aback.ai',
        'https://www.aback.ai',
        'http://localhost:3000', // For local development
        'http://localhost:8000', // For local development
    ],
    
    // Logging settings
    'enable_logging' => true,
    'log_file' => __DIR__ . '/chat_logs.json',
    'max_log_entries' => 1000,
    
    // Response settings
    'max_message_length' => 1000,
    'default_error_message' => 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment or contact our team at contact@aback.ai for assistance.',
];

// ===== END CONFIGURATION SECTION =====

// Set CORS headers for cross-origin requests
$allowedOrigins = $config['allowed_origins'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *'); // Fallback for development
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Extract configuration
$PINECONE_API_KEY = $config['api_key'];
$PINECONE_ASSISTANT_ID = $config['assistant_id'];

// Updated API endpoint for Pinecone Assistant
$PINECONE_API_URL = $config['api_base_url'] . '/assistants/' . $PINECONE_ASSISTANT_ID . '/chat';

// Validate required configuration
if (empty($PINECONE_API_KEY) || $PINECONE_API_KEY === 'pc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    error_log("Pinecone API key not configured");
    http_response_code(500);
    echo json_encode(['error' => $config['default_error_message']]);
    exit();
}

if (empty($PINECONE_ASSISTANT_ID) || $PINECONE_ASSISTANT_ID === 'asst-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx') {
    error_log("Pinecone Assistant ID not configured");
    http_response_code(500);
    echo json_encode(['error' => $config['default_error_message']]);
    exit();
}

// Rate limiting function
function checkRateLimit($clientIP, $rateLimitFile, $maxRequestsPerHour, $maxRequestsPerMinute) {
    $currentTime = time();
    $hourStart = $currentTime - 3600; // 1 hour ago
    $minuteStart = $currentTime - 60; // 1 minute ago
    
    // Read existing rate limit data
    $rateLimitData = [];
    if (file_exists($rateLimitFile)) {
        $content = file_get_contents($rateLimitFile);
        if ($content) {
            $rateLimitData = json_decode($content, true) ?: [];
        }
    }
    
    // Clean old entries (older than 1 hour)
    $rateLimitData = array_filter($rateLimitData, function($timestamp) use ($hourStart) {
        return $timestamp > $hourStart;
    });
    
    // Count requests from this IP in the last hour
    $hourlyRequests = array_filter($rateLimitData, function($timestamp, $key) use ($clientIP, $hourStart) {
        return strpos($key, $clientIP . '_') === 0 && $timestamp > $hourStart;
    }, ARRAY_FILTER_USE_BOTH);
    
    // Count requests from this IP in the last minute
    $minutelyRequests = array_filter($rateLimitData, function($timestamp, $key) use ($clientIP, $minuteStart) {
        return strpos($key, $clientIP . '_') === 0 && $timestamp > $minuteStart;
    }, ARRAY_FILTER_USE_BOTH);
    
    if (count($hourlyRequests) >= $maxRequestsPerHour) {
        return ['allowed' => false, 'reason' => 'hourly_limit'];
    }
    
    if (count($minutelyRequests) >= $maxRequestsPerMinute) {
        return ['allowed' => false, 'reason' => 'minute_limit'];
    }
    
    // Add current request
    $rateLimitData[$clientIP . '_' . $currentTime] = $currentTime;
    
    // Save updated data
    file_put_contents($rateLimitFile, json_encode($rateLimitData));
    
    return ['allowed' => true];
}

// Get client IP
$clientIP = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_CLIENT_IP'] ?? 'unknown';
$clientIP = filter_var($clientIP, FILTER_VALIDATE_IP) ? $clientIP : 'unknown';

// Check rate limit
$rateLimitFile = __DIR__ . '/rate_limit.json';
$maxRequestsPerHour = $config['rate_limit']['max_requests_per_hour'];
$maxRequestsPerMinute = $config['rate_limit']['max_requests_per_minute'];

$rateLimitResult = checkRateLimit($clientIP, $rateLimitFile, $maxRequestsPerHour, $maxRequestsPerMinute);
if (!$rateLimitResult['allowed']) {
    $message = $rateLimitResult['reason'] === 'minute_limit' 
        ? 'Too many requests in a short time. Please wait a moment and try again.'
        : 'Too many requests. Please try again later.';
    
    http_response_code(429);
    echo json_encode(['error' => $message]);
    exit();
}

// Get the JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log the received data for debugging
error_log("Received data: " . json_encode($data));

// Validate input
if (!$data || !isset($data['message']) || empty(trim($data['message']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input. Message is required.']);
    exit();
}

$userMessage = trim($data['message']);

// Sanitize input (basic validation)
if (strlen($userMessage) > $config['max_message_length']) {
    http_response_code(400);
    echo json_encode(['error' => 'Message too long. Maximum ' . $config['max_message_length'] . ' characters allowed.']);
    exit();
}

// Basic content filtering
$suspiciousPatterns = [
    '/(<script|<\/script)/i',
    '/(javascript:|data:)/i',
    '/(eval\(|setTimeout\(|setInterval\()/i'
];

foreach ($suspiciousPatterns as $pattern) {
    if (preg_match($pattern, $userMessage)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid message content.']);
        exit();
    }
}

// Prepare the request to Pinecone - Updated format for Pinecone Assistant API
$requestData = [
    'messages' => [
        [
            'role' => 'user',
            'content' => $userMessage
        ]
    ],
    'stream' => false,
    'model' => 'gpt-3.5-turbo' // You may need to adjust this based on your Pinecone setup
];

// Log the request for debugging
error_log("Sending to Pinecone: " . json_encode($requestData));
error_log("Pinecone URL: " . $PINECONE_API_URL);

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $PINECONE_API_URL,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($requestData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $PINECONE_API_KEY,
        'User-Agent: Aback.ai-Chatbot/1.0'
    ],
    CURLOPT_TIMEOUT => $config['request_timeout'],
    CURLOPT_CONNECTTIMEOUT => $config['connection_timeout'],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_ENCODING => '', // Enable compression
    CURLOPT_VERBOSE => true, // Enable verbose output for debugging
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

// Log response for debugging
error_log("Pinecone response code: " . $httpCode);
error_log("Pinecone response: " . $response);

curl_close($ch);

// Handle cURL errors
if ($curlError) {
    error_log("cURL Error: " . $curlError);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to connect to assistant service.']);
    exit();
}

// Handle HTTP errors
if ($httpCode !== 200) {
    error_log("Pinecone API Error: HTTP " . $httpCode . " - " . $response);
    
    // Parse error response if possible
    $errorData = json_decode($response, true);
    $errorMessage = 'Assistant service unavailable.';
    
    if ($errorData && isset($errorData['error'])) {
        error_log("Pinecone error details: " . json_encode($errorData));
        // Don't expose internal API errors to users
        $errorMessage = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
    }
    
    http_response_code(500);
    echo json_encode(['error' => $errorMessage]);
    exit();
}

// Parse the response
$responseData = json_decode($response, true);

if (!$responseData) {
    error_log("Invalid JSON response from Pinecone: " . $response);
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response from assistant service.']);
    exit();
}

// Log parsed response for debugging
error_log("Parsed Pinecone response: " . json_encode($responseData));

// Extract the assistant's response - Updated for correct Pinecone format
$assistantResponse = '';

if (isset($responseData['choices'][0]['message']['content'])) {
    // OpenAI-style response format
    $assistantResponse = $responseData['choices'][0]['message']['content'];
} elseif (isset($responseData['message'])) {
    // Simple message format
    $assistantResponse = $responseData['message'];
} elseif (isset($responseData['response'])) {
    // Response field format
    $assistantResponse = $responseData['response'];
} elseif (isset($responseData['content'])) {
    // Content field format
    $assistantResponse = $responseData['content'];
} elseif (isset($responseData['text'])) {
    // Text field format
    $assistantResponse = $responseData['text'];
} else {
    error_log("Unexpected response format from Pinecone: " . json_encode($responseData));
    $assistantResponse = "I'm sorry, I couldn't generate a proper response. Please try rephrasing your question.";
}

// Sanitize the response
$assistantResponse = trim($assistantResponse);

if (empty($assistantResponse)) {
    $assistantResponse = $config['default_error_message'];
}

// Log successful interactions (if enabled)
if ($config['enable_logging']) {
    $logData = [
        'timestamp' => date('c'),
        'client_ip' => $clientIP,
        'user_message' => substr($userMessage, 0, 100), // Log only first 100 chars for privacy
        'response_length' => strlen($assistantResponse),
        'success' => true,
        'processing_time' => microtime(true) - ($_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true))
    ];
    
    // Manage log file size
    $existingLogs = [];
    if (file_exists($config['log_file'])) {
        $logContent = file_get_contents($config['log_file']);
        if ($logContent) {
            $existingLogs = array_filter(explode("\n", $logContent));
        }
    }
    
    // Keep only the most recent entries
    if (count($existingLogs) >= $config['max_log_entries']) {
        $existingLogs = array_slice($existingLogs, -($config['max_log_entries'] - 1));
    }
    
    // Add new log entry
    $existingLogs[] = json_encode($logData);
    
    // Write back to file
    file_put_contents($config['log_file'], implode("\n", $existingLogs) . "\n", LOCK_EX);
}

// Return the response
echo json_encode([
    'response' => $assistantResponse,
    'timestamp' => date('c'),
    'success' => true
]);
?>