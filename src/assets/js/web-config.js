// Chatbot Configuration - Pinecone API Proxy
const CHATBOT_CONFIG = {
  proxyUrl: "/api/chat-proxy.php",
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  fallbackMessage: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact our team at contact@aback.ai for immediate assistance."
};
