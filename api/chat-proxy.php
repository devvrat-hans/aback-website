<?php
// Aback.ai - Pinecone Assistant API Proxy
// This script acts as a proxy between the frontend and the Pinecone Assistant API

// Define security flag to allow safe inclusion of config.php
define('INCLUDED_FROM_PROXY', true);

// Include configuration
require_once('config.php');

// Set headers for JSON response
header('Content-Type: application/json');

// Handle preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request data
$requestData = json_decode(file_get_contents('php://input'), true);

// Validate input
if ((!isset($requestData['messages']) || !is_array($requestData['messages'])) &&
    (!isset($requestData['message']) || empty($requestData['message']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// Handle both formats: either 'messages' array or single 'message'
if (isset($requestData['message']) && !isset($requestData['messages'])) {
    $requestData['messages'] = [
        [
            'role' => 'user',
            'content' => $requestData['message']
        ]
    ];
}

// Log requests for debugging (optional, remove in production)
error_log('Chat request: ' . json_encode($requestData));

// Prepare the request to Pinecone API
$pineconeEndpoint = "https://prod-1-data.ke.pinecone.io/assistant/chat/" . PINECONE_ASSISTANT_NAME;

// Prepare headers for Pinecone API
$headers = [
    'Api-Key: ' . PINECONE_API_KEY,
    'X-Pinecone-API-Version: ' . PINECONE_API_VERSION,
    'Content-Type: application/json'
];

// Build full messages array including chat history
$messages = $requestData['messages'];
if (isset($requestData['chatHistory']) && is_array($requestData['chatHistory'])) {
    $messages = array_merge($requestData['chatHistory'], $messages);
}

// Prepare request payload
$payload = [
    'messages' => $messages,
    'model' => PINECONE_MODEL,
    'stream' => false // Using non-streaming response for simplicity
];

// Make the request to Pinecone API
$ch = curl_init($pineconeEndpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log the response for debugging (optional, remove in production)
error_log('Pinecone response code: ' . $httpCode);
error_log('Pinecone response: ' . $response);

// Handle errors
if ($error) {
    error_log("cURL Error: " . $error);
    http_response_code(500);
    echo json_encode([
        'error' => 'Error communicating with Pinecone API',
        'message' => $error
    ]);
    exit;
}

// Handle non-200 responses from Pinecone
if ($httpCode !== 200) {
    error_log("Pinecone API error with status code: " . $httpCode);
    error_log("Response: " . $response);
    
    http_response_code($httpCode);
    
    // Try to parse the error response
    $responseData = json_decode($response, true);
    if ($responseData) {
        echo json_encode([
            'error' => 'Pinecone API error',
            'status' => $httpCode,
            'message' => isset($responseData['error']) ? $responseData['error'] : 'Unknown error'
        ]);
    } else {
        echo json_encode([
            'error' => 'Pinecone API error',
            'status' => $httpCode,
            'message' => 'Invalid response from Pinecone API'
        ]);
    }
    exit;
}

// Return the response from Pinecone
echo $response;
?>