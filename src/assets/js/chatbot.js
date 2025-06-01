// Chatbot functionality for Aback.ai website
window.initializeChatbot = function() {
    console.log('Attempting to initialize chatbot');
    
    // Check if CHATBOT_CONFIG is available
    if (typeof CHATBOT_CONFIG === 'undefined') {
        console.error('CHATBOT_CONFIG not found. Make sure web-config.js is loaded before chatbot.js');
        // Define fallback config
        window.CHATBOT_CONFIG = {
            proxyUrl: "/api/chat-proxy.php",
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            fallbackMessage: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact our team at contact@aback.ai for immediate assistance."
        };
    }
    
    // Add a counter to prevent infinite retries
    if (!window.chatbotInitAttempts) {
        window.chatbotInitAttempts = 0;
    }
    window.chatbotInitAttempts++;
    
    if (window.chatbotInitAttempts > 10) {
        console.error('Chatbot initialization failed after 10 attempts');
        return;
    }
    
    const chatToggle = document.querySelector('.chat-toggle');
    const chatBox = document.querySelector('.chat-box');
    const closeChat = document.querySelector('.close-chat');
    const sendBtn = document.querySelector('.send-btn');
    const chatInput = document.getElementById('chat-input-field');
    const chatMessages = document.querySelector('.chat-messages');

    console.log('Chat elements found:', {
        chatToggle: !!chatToggle,
        chatBox: !!chatBox,
        closeChat: !!closeChat,
        sendBtn: !!sendBtn,
        chatInput: !!chatInput,
        chatMessages: !!chatMessages
    });

    // If elements are not found, retry after a short delay
    if (!chatToggle || !chatBox) {
        console.log(`Chatbot elements not found (attempt ${window.chatbotInitAttempts}), retrying in 500ms`);
        setTimeout(window.initializeChatbot, 500);
        return;
    }

    console.log('Chatbot elements found, setting up event listeners');
    
    // Check if already initialized to prevent duplicate event listeners
    if (chatToggle.dataset.chatbotInitialized === 'true') {
        console.log('Chatbot already initialized, skipping');
        return;
    }

    // Define common questions and their responses
    const commonResponses = {
        "hi": "Hello! Welcome to Aback.ai. How can I assist you with our automation solutions today?",
        "hello": "Hello! Welcome to Aback.ai. How can I assist you with our automation solutions today?",
        "hey": "Hello! Welcome to Aback.ai. How can I assist you with our automation solutions today?",
        "good morning": "Good morning! Welcome to Aback.ai. How can I help you with your automation needs today?",
        "good afternoon": "Good afternoon! Welcome to Aback.ai. How may I assist you with our intelligent automation services?",
        "good evening": "Good evening! Welcome to Aback.ai. How can I help you find the right automation solution today?",

        "what is aback.ai": "Aback.ai is an intelligent automation agency dedicated to providing cutting-edge automation solutions. We specialize in business process optimization, workflow automation, and custom AI solutions to enhance productivity and efficiency for modern businesses.",
        "who are you": "We are Aback.ai, a leading automation agency specializing in business process optimization, workflow automation, and custom AI solutions to enhance productivity and efficiency for modern businesses.",
        "tell me about aback.ai": "Aback.ai is an intelligent automation agency that delivers cutting-edge solutions to streamline workflows, eliminate repetitive tasks, and maximize efficiency through AI-powered systems tailored to your specific business needs.",
        "company size": "Aback.ai is a dynamic team of automation experts dedicated to helping businesses transform their operations through intelligent automation.",
        "company history": "Aback.ai was founded with a mission to help businesses leverage the power of automation and AI to optimize their operations, reduce manual tasks, and drive operational efficiency.",

        "what services do you offer": "We offer a comprehensive range of automation services including Process Automation, Workflow Optimization, Strategic Consulting, Systems Integration, Customer Support Automation, and Data Analytics & Insights. Visit our Services page to learn more.",
        "what services": "Our core services include Process Automation, Workflow Optimization, Strategic Consulting, Systems Integration, Customer Support Automation, and Data Analytics & Insights. You can explore these in detail on our Services page.",
        "automation solutions": "Our automation solutions help businesses streamline workflows, reduce manual tasks, and increase operational efficiency. We offer specialized solutions for different industries and business needs.",
        "process automation": "Our process automation solutions streamline your workflows and automate repetitive tasks, freeing your team to focus on higher-value activities.",
        "workflow optimization": "From workflow design to implementation, our workflow optimization solutions help enhance operational efficiency and ensure smooth business processes.",
        "consulting services": "Our strategic consulting services help you turn business challenges into opportunities by aligning technology with business goals and implementing innovative digital strategies.",
        "integration services": "Our integration services connect disparate systems and applications for seamless data flow, breaking down silos and creating a unified technology ecosystem.",
        "analytics services": "Our data analytics solutions transform raw data into actionable insights, enabling informed decisions and identifying growth opportunities through data-driven strategies.",

        "business process automation": "Our Business Process Automation solutions transform manual workflows into efficient automated systems. We identify bottlenecks, streamline operations, and reduce human error to improve efficiency.",
        "document automation": "Our Document Automation solutions eliminate manual document handling through intelligent processing. We automatically classify, extract data, and route documents throughout your organization.",
        "rpa solutions": "Our Robotic Process Automation (RPA) solutions automate repetitive, rule-based tasks using software robots that mimic human actions, increasing accuracy and freeing up your team for more strategic work.",
        "systems integration": "Our Systems Integration services connect your disparate systems and applications for seamless data flow, eliminating silos and creating unified platforms that enhance efficiency and decision-making.",
        "api development": "Our API Development services create robust interfaces that allow different applications to communicate and share data effectively, improving system integration and enabling new functionality.",
        "low-code development": "Our Low-Code Development solutions accelerate application creation through visual development interfaces, allowing faster innovation with less coding expertise required.",

        "help": "I can help you learn about Aback.ai's services, automation solutions, or provide information about how we can help your business. What would you like to know about?",
        "faq": "You can find answers to frequently asked questions on our FAQ page. If you don't find what you're looking for, please contact us directly.",
        "technical support": "For technical support regarding our automation solutions, please email support@aback.ai with details about your inquiry. Our technical team will respond promptly.",

        "get a quote": "To request a quote for our services, please fill out the contact form on our website or email us at contact@aback.ai with details about your requirements.",
        "consultation": "We offer free consultations to discuss how our automation solutions can optimize your operations. Contact us today to schedule one.",
        "custom solutions": "We develop custom automation solutions tailored to your specific business needs. Contact us to discuss how we can create a specialized solution for your organization.",

        "contact information": "You can reach us via email at contact@aback.ai. Visit our Contact page to find more ways to get in touch.",
        "how can i contact you": "You can contact us through email at contact@aback.ai or by using the contact form on our Contact page.",
        "website": "You can find more information about our services, solutions, and team on our website: aback.ai"
    };

    // Toggle chat box visibility
    function toggleChatBox() {
        chatBox.classList.toggle('active');
        
        // Show welcome message if this is the first time opening
        if (chatBox.classList.contains('active') && chatMessages.children.length === 0) {
            addBotMessage("Hello! Welcome to Aback.ai. How can I help you with your automation needs today?");
        }
    }

    // Close chat box
    function closeChatBox() {
        chatBox.classList.remove('active');
    }

    // Add a bot message to the chat
    function addBotMessage(text) {
        const message = document.createElement('div');
        message.classList.add('message', 'bot-message');
        message.textContent = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add a user message to the chat
    function addUserMessage(text) {
        const message = document.createElement('div');
        message.classList.add('message', 'user-message');
        message.textContent = text;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const bubble = document.createElement('div');
            bubble.classList.add('typing-bubble');
            indicator.appendChild(bubble);
        }
        
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Process user message and get response
    async function processUserMessage(userInput) {
        // Check for common responses first
        const lowerCaseInput = userInput.toLowerCase().trim();
        
        // Look for exact matches first
        if (commonResponses[lowerCaseInput]) {
            return commonResponses[lowerCaseInput];
        }
        
        // Then check for partial matches
        for (const [key, value] of Object.entries(commonResponses)) {
            if (lowerCaseInput.includes(key)) {
                return value;
            }
        }
        
        // If no match in common responses, call the Pinecone API
        try {
            console.log('No hardcoded response found, calling Pinecone API...');
            const response = await callChatAPI(userInput);
            return response;
        } catch (error) {
            console.error('Error calling Pinecone API:', error);
            
            // Return a user-friendly error message
            if (error.message.includes('timeout') || error.name === 'AbortError') {
                return "I'm taking a bit longer to respond than usual. Please try asking your question again.";
            } else if (error.message.includes('rate limit')) {
                return "I'm receiving a lot of questions right now. Please wait a moment and try again.";
            } else {
                return CHATBOT_CONFIG.fallbackMessage;
            }
        }
    }

    // Call the chat API with retry logic
    async function callChatAPI(message) {
        let lastError;
        
        for (let attempt = 1; attempt <= CHATBOT_CONFIG.maxRetries; attempt++) {
            try {
                console.log(`API call attempt ${attempt} for message: ${message.substring(0, 50)}...`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CHATBOT_CONFIG.timeout);
                
                const response = await fetch(CHATBOT_CONFIG.proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Log response details for debugging
                console.log('Response status:', response.status);
                console.log('Response headers:', [...response.headers.entries()]);

                // Get response text first to handle both JSON and non-JSON responses
                const responseText = await response.text();
                console.log('Raw response:', responseText);

                if (!response.ok) {
                    console.error('API error response:', responseText);
                    let errorData;
                    
                    try {
                        errorData = JSON.parse(responseText);
                    } catch (e) {
                        errorData = { error: `Server returned ${response.status}: ${response.statusText}` };
                    }
                    
                    // Handle specific error codes
                    if (response.status === 429) {
                        return "I'm receiving a lot of questions right now. Please wait a moment and try again.";
                    } else if (response.status >= 500) {
                        // Show more detailed error if available
                        const debugInfo = errorData.debug ? JSON.stringify(errorData.debug) : '';
                        console.error('Server error details:', debugInfo);
                        throw new Error(errorData.error || `Server error: ${response.status}`);
                    } else if (response.status === 400) {
                        return "I'm sorry, I couldn't understand your message. Could you please rephrase it?";
                    } else if (response.status === 404) {
                        return "I'm sorry, the chat service is currently unavailable. Please try again later or contact our team at contact@aback.ai.";
                    }
                    
                    throw new Error(errorData.error || `API responded with status ${response.status}`);
                }

                // Parse JSON response
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse JSON response:', responseText);
                    throw new Error('Invalid response format from server');
                }
                
                console.log('API response data:', data);
                
                if (data.success && data.response) {
                    console.log('API call successful');
                    return data.response;
                } else if (data.response) {
                    // Sometimes success field might be missing
                    console.log('API call completed (no success field)');
                    return data.response;
                } else if (data.error) {
                    throw new Error(data.error);
                } else {
                    console.error('Unexpected response format:', data);
                    throw new Error('Invalid response format from server');
                }
                
            } catch (error) {
                lastError = error;
                console.error(`API call attempt ${attempt} failed:`, error.message);
                
                // Don't retry on certain types of errors
                if (error.name === 'AbortError') {
                    console.error('Request timed out');
                    break;
                } else if (error.message.includes('400') || error.message.includes('rate limit')) {
                    break;
                }
                
                // Wait before retrying (except on last attempt)
                if (attempt < CHATBOT_CONFIG.maxRetries) {
                    console.log(`Waiting ${CHATBOT_CONFIG.retryDelay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, CHATBOT_CONFIG.retryDelay));
                }
            }
        }
        
        // All attempts failed
        console.error('All API attempts failed. Last error:', lastError?.message);
        throw lastError || new Error('Failed to connect to chat service');
    }

    // Handle sending a message
    async function sendMessage() {
        const userInput = chatInput.value.trim();
        
        if (userInput === '') return;
        
        // Clear input field
        chatInput.value = '';
        
        // Add user message to chat
        addUserMessage(userInput);
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process message and get response
        setTimeout(async () => {
            try {
                const response = await processUserMessage(userInput);
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response to chat
                addBotMessage(response);
            } catch (error) {
                hideTypingIndicator();
                addBotMessage("I'm sorry, I encountered an error. Please try again.");
                console.error('Error processing message:', error);
            }
        }, 1000);
    }

    // Event listeners
    if (chatToggle) {
        chatToggle.addEventListener('click', toggleChatBox);
        console.log('Chat toggle click listener added');
    }
    
    if (closeChat) {
        closeChat.addEventListener('click', closeChatBox);
        console.log('Close chat click listener added');
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        console.log('Send button click listener added');
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        console.log('Chat input keypress listener added');
    }

    // Close chat box when clicking outside
    document.addEventListener('click', function(e) {
        if (chatBox && chatBox.classList.contains('active') && 
            !chatBox.contains(e.target) && 
            e.target !== chatToggle) {
            closeChatBox();
        }
    });
    
    // Mark as initialized
    chatToggle.dataset.chatbotInitialized = 'true';
    console.log('Chatbot initialization completed successfully');
}

// Initialize when DOM is loaded or retry if called dynamically
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeChatbot);
} else {
    window.initializeChatbot();
}

// Also initialize when called directly (for hardcoded chatbots)
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(function() {
        if (document.querySelector('.chat-widget') && !document.querySelector('.chat-toggle[data-chatbot-initialized="true"]')) {
            console.log('Initializing hardcoded chatbot');
            window.initializeChatbot();
        }
    }, 100);
});
