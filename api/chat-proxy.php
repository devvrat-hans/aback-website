<?php
// Secure API proxy for Pinecone chatbot
header('Content-Type: application/json');
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

// If not in environment, try server variables
if (!$apiKey && isset($_SERVER['PINECONE_API_KEY'])) {
    $apiKey = $_SERVER['PINECONE_API_KEY'];
}
if (!$assistantName && isset($_SERVER['PINECONE_ASSISTANT_NAME'])) {
    $assistantName = $_SERVER['PINECONE_ASSISTANT_NAME'];
}

// Fallback: load from config file
if (!$apiKey || !$assistantName) {
    $configFile = __DIR__ . '/config.php';
    if (file_exists($configFile)) {
        include $configFile;
        if (defined('PINECONE_API_KEY') && defined('PINECONE_ASSISTANT_NAME')) {
            $apiKey = PINECONE_API_KEY;
            $assistantName = PINECONE_ASSISTANT_NAME;
        }
    }
}

$apiVersion = '2025-04';
$model = 'gpt-4o';

// Check if API credentials are available
if (!$apiKey || !$assistantName) {
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'Server configuration error - API credentials not found'
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

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for cURL errors
if ($error) {
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'Network connection error'
    ]);
    exit();
}

// Check if we got a valid response
if ($httpCode >= 400) {
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'API service temporarily unavailable'
    ]);
    exit();
}

// Parse and validate the response
$responseData = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'Invalid API response format'
    ]);
    exit();
}

// Validate response structure
if (!isset($responseData['message']) || !isset($responseData['message']['content'])) {
    http_response_code(200);
    echo json_encode([
        'error' => true,
        'message' => 'Unexpected API response structure'
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