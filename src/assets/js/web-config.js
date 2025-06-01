// Chatbot Configuration for Aback.ai
const CHATBOT_CONFIG = {
    proxyUrl: "/api/chat-proxy.php",
    version: "1.1.0", // For cache busting
    apiRetries: 3,
    apiRetryDelay: 1000,
    localModeEnabled: true, // Set to false to use Pinecone API in production
    debugMode: false // Set to true for detailed console logging
};