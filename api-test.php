<?php
// Test script to check Pinecone API response format
header('Content-Type: application/json');

// Load API credentials
require_once 'api/config.php';

$apiUrl = "https://prod-1-data.ke.pinecone.io/assistant/chat/" . PINECONE_ASSISTANT_NAME;

$headers = [
    'Content-Type: application/json',
    'Api-Key: ' . PINECONE_API_KEY
];

$postData = [
    'messages' => [
        [
            'role' => 'user',
            'content' => 'Hello, test message'
        ]
    ],
    'stream' => false,
    'model' => 'gpt-4o'
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "cURL Error: " . $error . "\n";
echo "Response: " . $response . "\n";

if ($response) {
    $data = json_decode($response, true);
    echo "\nParsed Data Structure:\n";
    print_r($data);
    
    echo "\nMessage Content Check:\n";
    if (isset($data['message']['content'])) {
        echo "Found in data.message.content: " . $data['message']['content'] . "\n";
    } else {
        echo "data.message.content not found\n";
    }
}
?>
