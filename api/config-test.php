<?php
// Configuration Test for Pinecone Assistant
// This file helps test your Pinecone configuration before deployment

echo "<h2>Pinecone Configuration Test</h2>";
echo "<p>Run this locally to verify your configuration before uploading to production.</p>";

// Include the configuration from chat-proxy.php
require_once 'chat-proxy.php';

// Check if running locally
if ($_SERVER['HTTP_HOST'] !== 'localhost' && $_SERVER['HTTP_HOST'] !== '127.0.0.1') {
    die("<p style='color: red;'>ERROR: This test file should only be run locally!</p>");
}

echo "<h3>Configuration Check:</h3>";
echo "<ul>";
echo "<li>API Key: " . (strlen($PINECONE_API_KEY) > 10 ? "Configured (" . strlen($PINECONE_API_KEY) . " chars)" : "<span style='color: red;'>NOT CONFIGURED</span>") . "</li>";
echo "<li>Assistant ID: " . ($PINECONE_ASSISTANT_ID !== 'aback-chatbot' ? "<span style='color: red;'>NOT CONFIGURED</span>" : "aback-chatbot") . "</li>";
echo "<li>API URL: " . $PINECONE_API_URL . "</li>";
echo "</ul>";

echo "<h3>Test Message:</h3>";
if ($_POST['test_message']) {
    $testMessage = $_POST['test_message'];
    
    // Test the API call
    $requestData = [
        'message' => $testMessage,
        'stream' => false
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $PINECONE_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($requestData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $PINECONE_API_KEY,
            'User-Agent: Aback.ai-Chatbot-Test/1.0'
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    echo "<p><strong>Request:</strong> " . htmlspecialchars($testMessage) . "</p>";
    echo "<p><strong>HTTP Code:</strong> " . $httpCode . "</p>";
    
    if ($curlError) {
        echo "<p style='color: red;'><strong>cURL Error:</strong> " . htmlspecialchars($curlError) . "</p>";
    } else {
        echo "<p><strong>Response:</strong></p>";
        echo "<pre>" . htmlspecialchars($response) . "</pre>";
    }
}
?>

<form method="POST">
    <input type="text" name="test_message" placeholder="Enter test message" value="<?= htmlspecialchars($_POST['test_message'] ?? 'Hello, what services does Aback.ai offer?') ?>" style="width: 300px;">
    <button type="submit">Test</button>
</form>

<p><strong>Instructions:</strong></p>
<ol>
    <li>Replace 'YOUR_ACTUAL_PINECONE_API_KEY_HERE' in chat-proxy.php with your real API key</li>
    <li>Test this configuration locally</li>
    <li>Once working, upload chat-proxy.php to production (DO NOT upload this test file)</li>
</ol>
