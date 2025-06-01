// Chatbot functionality for Aback.ai website - Special version for pages in src/pages directory
document.addEventListener('DOMContentLoaded', function () {
    // Debug log helper
    function debug(message, data = null) {
        if (typeof CHATBOT_CONFIG !== 'undefined' && CHATBOT_CONFIG.debugMode) {
            if (data) {
                console.log(`Chatbot: ${message}`, data);
            } else {
                console.log(`Chatbot: ${message}`);
            }
        }
    }

    debug("Attempting to initialize chatbot for pages");

    // Check if chat elements exist
    const chatToggle = document.querySelector('.chat-toggle');
    const chatBox = document.querySelector('.chat-box');
    const closeChat = document.querySelector('.close-chat');
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.getElementById('chat-input-field');
    const chatMessages = document.querySelector('.chat-messages');
    
    // If any essential elements are missing, log error and exit
    if (!chatToggle || !chatBox || !closeChat || !sendBtn || !chatInput || !chatMessages) {
        console.error("Chatbot: Missing required DOM elements. Chatbot initialization failed.");
        return;
    }
    
    debug("Chat elements found:", { 
        toggle: !!chatToggle, 
        box: !!chatBox, 
        close: !!closeChat, 
        send: !!sendBtn, 
        input: !!chatInput, 
        messages: !!chatMessages 
    });
    
    // Chat history array to store conversation for context
    let chatHistory = [];
    
    // Flag to indicate if a request is in progress
    let isRequestInProgress = false;
    
    // Define welcome message - ensuring consistency across all pages
    const welcomeMessage = "Hello! Welcome to Aback.ai. How can I help you with your automation needs today?";
    
    // Check if web-config.js is loaded
    const useLocalMode = (typeof CHATBOT_CONFIG !== 'undefined' && 
                          typeof CHATBOT_CONFIG.localModeEnabled !== 'undefined') ? 
                          CHATBOT_CONFIG.localModeEnabled : true;
    
    debug("Chatbot elements found, setting up event listeners");
    
    // Define common questions and their responses for Aback.ai (used in local mode)
    const commonResponses = {
        "hi": "Hello! Welcome to Aback.ai - Your Automation Revolution Partner. How may I assist you today?",
        "hello": "Hello! Welcome to Aback.ai - Your Automation Revolution Partner. How may I assist you today?",
        "hey": "Hello! Welcome to Aback.ai - Your Automation Revolution Partner. How may I assist you today?",
        "good morning": "Good morning! Welcome to Aback.ai. How can I help you revolutionize your business with AI automation today?",
        "good afternoon": "Good afternoon! Welcome to Aback.ai. How may I assist you with your automation needs?",
        "good evening": "Good evening! Welcome to Aback.ai. How can I help you transform your business today?",

        // Additional common responses can be found in the main chatbot.js file
        // They are excluded here for brevity but work the same way

        // Add page-specific responses here if needed
        "services": "Aback.ai offers a wide range of automation services including AI Chatbots, Workflow Automation, Business Process Optimization, and more. Would you like more specific information about any of these services?",
        "about": "Aback.ai is India's leading AI automation agency, founded in 2024 with a mission to help businesses achieve operational excellence through intelligent automation.",
        "whyus": "Aback.ai stands out due to our expertise in cutting-edge AI, custom tailored solutions, measurable business outcomes, and comprehensive support throughout your automation journey.",
        "careers": "We're always looking for talented individuals passionate about AI and automation. Check our Careers page for current openings or send your resume to careers@aback.ai.",
        "contact": "You can reach us at contact@aback.ai or through our contact form. We respond to all inquiries within 24 hours during business days.",
        "privacy": "Aback.ai takes your privacy seriously. Our privacy policy outlines how we collect, use, and protect your data in compliance with all relevant regulations.",
        "terms": "Our terms of service outline the rules and guidelines for using Aback.ai's services. They're designed to protect both you and our company.",
        "ethics": "Aback.ai is committed to the ethical development and deployment of AI technologies. Our ethics charter outlines our principles and commitments."
    };

    // Function to check if user message matches any common questions
    function getCommonResponse(message) {
        const normalizedMessage = message.toLowerCase().trim();

        // Check for exact matches
        if (commonResponses[normalizedMessage]) {
            return commonResponses[normalizedMessage];
        }

        // Check for partial matches - if the user's message contains a key phrase
        for (const [key, response] of Object.entries(commonResponses)) {
            if (normalizedMessage.includes(key)) {
                return response;
            }
        }

        // No match found
        return null;
    }

    // Open chat box when chat toggle is clicked
    chatToggle.addEventListener('click', () => {
        debug("Chat toggle clicked");
        chatBox.classList.add('active');
        
        // Check if welcome message exists - if not, add it (ensures it's only added once)
        if (chatMessages.children.length === 0) {
            debug("Adding welcome message");
            addMessage(welcomeMessage, 'bot');
        }
        
        // Focus on input field when chat is opened
        setTimeout(() => chatInput.focus(), 300);
    });
    debug("Chat toggle click listener added");

    // Close chat box when close button is clicked
    closeChat.addEventListener('click', () => {
        debug("Close chat clicked");
        chatBox.classList.remove('active');
    });
    debug("Close chat click listener added");

    // Send message when send button is clicked or Enter key is pressed
    sendBtn.addEventListener('click', sendMessage);
    debug("Send button click listener added");
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    debug("Chat input keypress listener added");

    // Initialize the chat - but don't add welcome message until chat is opened
    // This ensures consistent behavior across all pages
    function initializeChat() {
        debug("Initializing chat");
        // Clear any existing chat messages (helps with potential duplicates)
        while (chatMessages.firstChild) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
        
        // Reset chat history
        chatHistory = [];
    }
    
    // Initialize chat on page load
    initializeChat();
    debug("Chatbot initialization completed successfully");

    async function sendMessage() {
        if (isRequestInProgress) {
            debug("Request in progress, ignoring send");
            return;
        }

        const message = chatInput.value.trim();

        // Don't send empty messages
        if (message === '') return;

        debug("Processing user message:", message);
        
        // Add user message to chat
        addMessage(message, 'user');

        // Add message to chat history
        chatHistory.push({
            role: 'user',
            content: message
        });

        // Clear input field
        chatInput.value = '';
        
        // Disable send button during processing
        sendBtn.disabled = true;
        isRequestInProgress = true;

        try {
            await processUserMessage(message);
        } catch (error) {
            console.error("Chatbot: Error processing message:", error);
            // Show error message to user
            addMessage("Sorry, I'm having trouble connecting right now. Please try again later or contact us at contact@aback.ai for immediate assistance.", 'bot');
        } finally {
            // Re-enable send button
            sendBtn.disabled = false;
            isRequestInProgress = false;
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    async function processUserMessage(message) {
        // First check if we're in local mode and if we have a pre-defined response
        const commonResponse = useLocalMode ? getCommonResponse(message) : null;

        if (commonResponse) {
            debug("Found hardcoded response for:", message);
            
            // Use the pre-defined response without making an API call
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to simulate thinking
            
            addMessage(commonResponse, 'bot');
            
            // Add bot response to chat history
            chatHistory.push({
                role: 'assistant',
                content: commonResponse
            });
        } else {
            // No pre-defined response or not in local mode, use the Pinecone API
            debug("No hardcoded response found, calling Pinecone API...");
            showTypingIndicator();

            try {
                const botResponse = await callChatAPI(message);
                
                // Remove typing indicator
                removeTypingIndicator();

                // Add bot message to chat
                addMessage(botResponse, 'bot');
                
                // Add bot response to chat history
                chatHistory.push({
                    role: 'assistant',
                    content: botResponse
                });
                
                // Keep chat history limited to last 10 messages (5 exchanges)
                if (chatHistory.length > 10) {
                    chatHistory = chatHistory.slice(chatHistory.length - 10);
                }
            } catch (error) {
                // Remove typing indicator
                removeTypingIndicator();
                
                // Show error message
                addMessage("Sorry, I'm having trouble connecting right now. Please try again later or contact us at contact@aback.ai for immediate assistance.", 'bot');
                console.error("Error calling Pinecone API:", error);
            }
        }
    }

    async function callChatAPI(message) {
        // Check if config is available
        if (typeof CHATBOT_CONFIG === 'undefined') {
            console.error("Chatbot configuration not found!");
            throw new Error("Chatbot configuration not found");
        }

        const maxRetries = CHATBOT_CONFIG.apiRetries || 3;
        const retryDelay = CHATBOT_CONFIG.apiRetryDelay || 1000;
        let lastError = null;
        
        // Get the proxy URL from the CHATBOT_CONFIG
        // This is now handled by path-resolver.js
        const proxyUrl = CHATBOT_CONFIG.proxyUrl;
        debug(`Using proxy URL: ${proxyUrl}`);
        
        // Try multiple times if configured
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            debug(`API call attempt ${attempt} for message: ${message}...`);
            
            try {
                // Prepare messages array with conversation history
                const allMessages = [...chatHistory.slice(0, -1)]; // Include previous history except current message
                
                // Send request to our proxy endpoint with the correct path
                const response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify({
                        messages: [{ role: 'user', content: message }],
                        chatHistory: allMessages // Send all previous chat history except the current message
                    })
                });

                debug("Response status:", response.status);
                debug("Response headers:", response.headers);
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                debug("API response data:", data);

                // Try to extract the content based on different response formats
                let content = null;
                
                // Handle Pinecone response format
                if (data && data.message && data.message.content) {
                    content = data.message.content;
                }
                // Handle if message is directly in the response
                else if (data && data.content) {
                    content = data.content;
                }
                // Handle if response is in OpenAI format
                else if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
                    content = data.choices[0].message.content;
                }
                
                // Check if we found a valid content
                if (content) {
                    return formatBotResponse(content);
                } else {
                    lastError = new Error("Invalid response format from server");
                    debug(`API call attempt ${attempt} failed:`, lastError.message);
                    
                    if (attempt < maxRetries) {
                        debug(`Waiting ${retryDelay}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
            } catch (error) {
                lastError = error;
                debug(`API call attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    debug(`Waiting ${retryDelay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        
        debug("All API attempts failed. Last error:", lastError?.message);
        throw lastError || new Error("Failed to get response from server");
    }

    // Format bot's response by converting markdown-style formatting to HTML
    function formatBotResponse(text) {
        if (!text) return '';

        // Remove any citation brackets like [1, pp. 5]
        text = text.replace(/\[\d+(?:,\s*pp\.\s*\d+)?\]/g, '');
        
        // Temporarily replace line breaks to prevent interference with list processing
        text = text.replace(/\n/g, '{{NEWLINE}}');
        
        // Process ordered lists - match entire list blocks
        let listPattern = /(\d+\.\s+.+?)((?=\n\n)|$)/g;
        text = text.replace(listPattern, function(match) {
            // Process each list item
            const listItems = match.split(/\n\d+\.\s+/);
            let listHTML = '<ol>';
            
            // First item (remove the leading number)
            let firstItem = listItems[0].replace(/^\d+\.\s+/, '');
            listHTML += '<li>' + firstItem + '</li>';
            
            // Remaining items
            for (let i = 1; i < listItems.length; i++) {
                if (listItems[i].trim()) {
                    listHTML += '<li>' + listItems[i] + '</li>';
                }
            }
            
            listHTML += '</ol>';
            return listHTML;
        });
        
        // Process unordered lists with * bullet points
        text = text.replace(/(\*\s+.+?{{NEWLINE}})+/g, function(match) {
            const listItems = match.split(/\*\s+/);
            let listHTML = '<ul>';
            
            for (let i = 1; i < listItems.length; i++) { // Start from 1 to skip empty first item
                if (listItems[i].trim()) {
                    // Remove newline marker at the end of item
                    let item = listItems[i].replace(/{{NEWLINE}}$/, '');
                    listHTML += '<li>' + item + '</li>';
                }
            }
            
            listHTML += '</ul>';
            return listHTML;
        });

        // Process unordered lists with - bullet points 
        text = text.replace(/(\-\s+.+?{{NEWLINE}})+/g, function(match) {
            const listItems = match.split(/\-\s+/);
            let listHTML = '<ul>';
            
            for (let i = 1; i < listItems.length; i++) {
                if (listItems[i].trim()) {
                    let item = listItems[i].replace(/{{NEWLINE}}$/, '');
                    listHTML += '<li>' + item + '</li>';
                }
            }
            
            listHTML += '</ul>';
            return listHTML;
        });

        // Handle remaining bullet points not caught by the block pattern
        text = text.replace(/\*\s+(.*?){{NEWLINE}}/g, '• $1<br>');
        text = text.replace(/\-\s+(.*?){{NEWLINE}}/g, '• $1<br>');

        // Restore line breaks
        text = text.replace(/{{NEWLINE}}/g, '<br>');

        // Handle bold text (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Handle italic text (*text*)
        text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

        // Handle links [text](url)
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Handle headers
        text = text.replace(/###\s(.*?)(?:<br>|$)/g, '<h3>$1</h3>');
        text = text.replace(/##\s(.*?)(?:<br>|$)/g, '<h2>$1</h2>');
        text = text.replace(/#\s(.*?)(?:<br>|$)/g, '<h1>$1</h1>');

        // Handle code blocks with backticks
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Ensure proper paragraph spacing
        text = text.replace(/<br><br>/g, '</p><p>');
        
        // Wrap everything in paragraphs if not already wrapped
        if (!text.startsWith('<')) {
            text = '<p>' + text + '</p>';
        }

        return text;
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

        // Use innerHTML for bot messages to allow HTML formatting
        // Use textContent for user messages for security
        if (sender === 'bot') {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');

        for (let i = 0; i < 3; i++) {
            const typingBubble = document.createElement('div');
            typingBubble.classList.add('typing-bubble');
            typingIndicator.appendChild(typingBubble);
        }

        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
});

// Add "active" class to body when document is fully loaded
window.addEventListener('load', function () {
    document.body.classList.add('loaded');
});
