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

// Load API credentials from environment variables or .htaccess
$apiKey = getenv('PINECONE_API_KEY');
$assistantName = getenv('PINECONE_ASSISTANT_NAME');

// If not in environment, try to get from server variables (set by .htaccess)
if (!$apiKey && isset($_SERVER['PINECONE_API_KEY'])) {
    $apiKey = $_SERVER['PINECONE_API_KEY'];
}
if (!$assistantName && isset($_SERVER['PINECONE_ASSISTANT_NAME'])) {
    $assistantName = $_SERVER['PINECONE_ASSISTANT_NAME'];
}

$apiVersion = '2025-04';
$model = 'gpt-4o';

// Check if API credentials are available
if (!$apiKey || !$assistantName) {
    // Log debugging info (remove in production)
    error_log("Pinecone API Key present: " . (!empty($apiKey) ? "Yes" : "No"));
    error_log("Assistant Name present: " . (!empty($assistantName) ? "Yes" : "No"));
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Server configuration error',
        'debug' => [
            'api_key_set' => !empty($apiKey),
            'assistant_name_set' => !empty($assistantName)
        ]
    ]);
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
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_VERBOSE, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

// Log the request for debugging
error_log("Sending request to Pinecone API: " . $apiUrl);
error_log("Request headers: " . json_encode($headers));
error_log("Request body: " . json_encode($postData));

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log response for debugging (remove in production)
error_log("Pinecone API Response Code: " . $httpCode);
error_log("Pinecone API Response Body (first 1000 chars): " . substr($response, 0, 1000) . "...");

// Check for cURL errors
if ($error) {
    error_log("cURL Error: " . $error);
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to connect to API service',
        'debug' => ['curl_error' => $error]
    ]);
    exit();
}

// Check if we got a valid response
if ($httpCode >= 400) {
    error_log("Pinecone API Error - HTTP " . $httpCode . ": " . $response);
    
    // Return a more user-friendly error response for client-side handling
    http_response_code(200); // Return 200 to prevent JS errors
    echo json_encode([
        'error' => true,
        'message' => "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact our team at contact@aback.ai for immediate assistance.",
        'debug' => [
            'api_status' => $httpCode,
            'api_response' => substr($response, 0, 200)
        ]
    ]);
    exit();
}

// Parse and validate the response
$responseData = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Invalid JSON response from Pinecone API: " . $response);
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => "I'm sorry, I'm having trouble processing the response. Please try again.",
        'debug' => ['json_error' => json_last_error_msg(), 'raw_response' => substr($response, 0, 200)]
    ]);
    exit();
}

// Log the parsed response structure for debugging
error_log("Parsed response structure: " . json_encode(array_keys($responseData)));
error_log("Full response data: " . json_encode($responseData));

// Validate that we have the expected Pinecone response structure
if (!isset($responseData['message']) || !isset($responseData['message']['content'])) {
    error_log("Invalid Pinecone API response structure - missing message.content");
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => "I'm sorry, I received an invalid response format. Please try again.",
        'debug' => ['response_keys' => array_keys($responseData)]
    ]);
    exit();
}

// Return the parsed response
http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => $responseData
]);
?>