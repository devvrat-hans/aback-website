// Chatbot functionality for Aback.ai website
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

    debug("Attempting to initialize chatbot");

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

        "what is aback.ai": "Aback.ai is India's leading AI automation agency specializing in custom automation solutions, AI chatbots, workflow optimization, and intelligent business process automation. We help businesses scale efficiently by implementing cutting-edge AI technologies.",
        "who are you": "We are Aback.ai, a premier AI automation agency dedicated to revolutionizing businesses through intelligent automation solutions. We specialize in custom AI implementations, chatbots, and workflow optimization.",
        "tell me about aback.ai": "Aback.ai is a cutting-edge AI automation agency founded to transform how businesses operate. We specialize in custom automation solutions, AI chatbots, intelligent workflows, and business process optimization to help companies achieve unprecedented efficiency and growth.",
        "when was aback.ai founded": "Aback.ai was founded in 2024 with a mission to democratize AI automation and help businesses harness the power of artificial intelligence for operational excellence.",
        "company size": "Aback.ai is a dynamic team of AI specialists, automation engineers, and business strategists dedicated to delivering world-class automation solutions.",
        "company mission": "Our mission is to revolutionize business operations through intelligent automation, making AI accessible and practical for businesses of all sizes.",

        "what services do you offer": "We offer comprehensive AI automation services including: Custom AI Chatbots, Workflow Automation, Business Process Optimization, AI Integration Solutions, Customer Service Automation, and Strategic AI Consulting. Visit our Services page for detailed information.",
        "what services": "Our core services include AI Chatbots, Workflow Automation, Process Optimization, AI Integration, Customer Service Automation, and Strategic Consulting. Check our Services page for more details.",
        "ai chatbot services": "We develop intelligent chatbots powered by advanced AI models like GPT-4, capable of handling customer inquiries, lead generation, appointment scheduling, and complex business workflows with natural language understanding.",
        "automation solutions": "Our automation solutions include workflow optimization, document processing, data analysis automation, customer service automation, and custom AI implementations tailored to your specific business needs.",
        "ai integration": "We help businesses seamlessly integrate AI into their existing systems, whether it's CRM automation, customer support enhancement, or intelligent data processing solutions.",
        "workflow optimization": "Our workflow optimization services streamline your business processes using AI, reducing manual work, eliminating bottlenecks, and increasing operational efficiency by up to 80%.",

        "why choose aback.ai": "Choose Aback.ai for our expertise in cutting-edge AI technologies, proven track record of successful implementations, custom-tailored solutions, ongoing support, and commitment to delivering measurable ROI through intelligent automation.",
        "competitive advantage": "Our competitive advantage lies in our deep AI expertise, ability to create custom solutions rather than one-size-fits-all products, focus on measurable business outcomes, and comprehensive post-implementation support.",
        "success stories": "We've helped numerous businesses achieve significant improvements in efficiency, cost reduction, and customer satisfaction through our AI automation solutions. Contact us to learn about specific case studies relevant to your industry.",
        "roi benefits": "Our clients typically see 60-80% reduction in manual tasks, 50% faster response times, significant cost savings, and improved customer satisfaction scores within 3-6 months of implementation.",

        "industries you serve": "We serve various industries including healthcare, finance, e-commerce, manufacturing, education, real estate, legal services, and technology companies, adapting our solutions to meet specific industry requirements.",
        "healthcare automation": "For healthcare, we provide patient communication automation, appointment scheduling systems, medical record processing, and compliance-focused AI solutions that improve patient care while reducing administrative burden.",
        "finance automation": "Our finance automation solutions include customer onboarding, fraud detection, document processing, compliance monitoring, and intelligent customer service for banks and financial institutions.",
        "ecommerce automation": "We help e-commerce businesses with automated customer support, inventory management, order processing, personalized recommendations, and customer journey optimization.",
        "manufacturing automation": "Our manufacturing solutions include quality control automation, supply chain optimization, predictive maintenance, and intelligent production planning systems.",

        "how does ai automation work": "AI automation works by using machine learning algorithms to understand patterns, make decisions, and execute tasks that traditionally required human intervention, resulting in faster, more accurate, and consistent business processes.",
        "implementation process": "Our implementation process includes: 1) Business Analysis & Strategy, 2) Custom Solution Design, 3) Development & Integration, 4) Testing & Optimization, 5) Deployment & Training, 6) Ongoing Support & Monitoring.",
        "timeline for implementation": "Implementation timelines vary based on complexity, typically ranging from 2-8 weeks for chatbot solutions to 3-6 months for comprehensive automation systems. We provide detailed timelines during the consultation phase.",
        "technology stack": "We use cutting-edge technologies including GPT-4, Claude, custom machine learning models, Python, Node.js, React, cloud platforms (AWS, Azure, GCP), and various AI/ML frameworks for optimal performance.",

        "pricing": "Our pricing is customized based on your specific requirements, scope, and complexity. We offer flexible packages starting from basic chatbot implementations to comprehensive enterprise automation solutions. Contact us for a personalized quote.",
        "get a quote": "To get a customized quote, please visit our Contact page or email us at contact@aback.ai with your requirements. We'll schedule a consultation to understand your needs and provide a detailed proposal.",
        "pricing models": "We offer various pricing models including one-time implementation fees, subscription-based models for ongoing services, and hybrid approaches. The best model depends on your specific needs and preferences.",
        "budget planning": "We work with businesses of all sizes and can tailor solutions to fit various budget ranges. During our consultation, we'll discuss options that align with your budget while maximizing value.",

        "contact information": "You can reach us at contact@aback.ai, visit our Contact page for detailed information, or schedule a consultation directly through our website. We're here to help you transform your business with AI automation.",
        "how can i contact you": "Contact us via email at contact@aback.ai, through our website's contact form, or schedule a consultation call. We respond to all inquiries within 24 hours during business days.",
        "schedule consultation": "To schedule a consultation, visit our Contact page or email contact@aback.ai with your preferred time. We offer free initial consultations to discuss your automation needs.",
        "office hours": "We're available Monday through Friday, 9:00 AM to 6:00 PM IST. For urgent matters, you can email us anytime and we'll respond as soon as possible.",

        "founders": "Aback.ai was founded by Devvrat Hans, an experienced web developer, open-source enthusiast, and competitive programmer with a vision to make advanced AI accessible to businesses worldwide.",
        "team": "Our team consists of AI specialists, automation engineers, business analysts, and customer success managers, all dedicated to delivering exceptional automation solutions.",
        "expertise": "Our core expertise includes artificial intelligence, machine learning, natural language processing, business process automation, software development, and strategic technology consulting.",
        "leadership": "Our leadership team combines deep technical expertise in AI and automation with extensive business experience, ensuring solutions that are both technically advanced and commercially viable.",

        "case studies": "We have successful case studies across various industries showing significant improvements in efficiency, cost reduction, and customer satisfaction. Contact us to learn about cases relevant to your specific industry or use case.",
        "client testimonials": "Our clients consistently report high satisfaction with our solutions, citing improved efficiency, cost savings, and excellent support. Visit our website or contact us for detailed testimonials.",
        "success metrics": "Our solutions typically deliver 60-80% reduction in manual work, 50% faster response times, 40% cost savings, and significant improvements in customer satisfaction scores.",
        "portfolio": "Our portfolio includes diverse automation projects from simple chatbot implementations to complex enterprise-wide automation systems across multiple industries.",

        "support": "We provide comprehensive support including initial training, documentation, ongoing maintenance, updates, and 24/7 technical support for critical systems. Our support ensures your automation continues to deliver value.",
        "training": "We provide complete training for your team on using and managing the automation solutions, including documentation, video tutorials, and hands-on training sessions.",
        "maintenance": "Our maintenance services include regular updates, performance monitoring, optimization, and proactive issue resolution to ensure your automation systems run smoothly.",
        "updates": "We provide regular updates to keep your automation solutions current with the latest AI technologies and ensure optimal performance and security.",

        "security": "We implement enterprise-grade security measures including data encryption, secure API access, compliance with industry standards, and regular security audits to protect your business data.",
        "data privacy": "We are committed to data privacy and comply with all relevant regulations including GDPR. Your data is secure and used only for the intended automation purposes.",
        "compliance": "Our solutions are designed to meet industry compliance requirements including healthcare HIPAA, financial regulations, and data protection standards.",
        "reliability": "Our automation solutions are built for high reliability with 99.9% uptime, redundant systems, and proactive monitoring to ensure consistent performance.",

        "scalability": "Our solutions are designed to scale with your business, from handling hundreds to millions of interactions, and can be easily expanded as your needs grow.",
        "customization": "Every solution is customized to your specific business needs, workflows, and requirements. We don't believe in one-size-fits-all approaches.",
        "integration": "We seamlessly integrate with your existing systems including CRMs, ERPs, databases, and third-party applications to ensure smooth workflow continuity.",
        "api access": "We provide API access for advanced users who want to integrate our automation solutions with their custom applications or systems.",

        "artificial intelligence": "We leverage the latest AI technologies including large language models, machine learning, natural language processing, and computer vision to create intelligent automation solutions.",
        "machine learning": "Our machine learning capabilities enable systems that learn and improve over time, providing increasingly better performance and more accurate results.",
        "natural language processing": "Our NLP expertise allows us to create chatbots and automation systems that understand and respond to human language naturally and contextually.",
        "gpt integration": "We integrate advanced language models like GPT-4 to create highly intelligent conversational AI and automation systems capable of complex reasoning and responses.",

        "business transformation": "We help businesses transform their operations through intelligent automation, enabling them to focus on strategic activities while AI handles routine tasks.",
        "digital transformation": "Our AI automation solutions are key components of digital transformation, helping businesses modernize their operations and stay competitive in the digital age.",
        "operational efficiency": "Our solutions significantly improve operational efficiency by automating repetitive tasks, reducing errors, and streamlining business processes.",
        "cost reduction": "Businesses typically achieve 40-60% cost reduction in automated processes while improving quality and speed of operations.",

        "future of automation": "The future of automation lies in intelligent, adaptive systems that can handle complex tasks, learn from experience, and integrate seamlessly with human workflows - exactly what we're building at Aback.ai.",
        "ai trends": "We stay at the forefront of AI trends including generative AI, autonomous agents, multimodal AI, and edge computing to ensure our clients benefit from the latest technological advances.",
        "innovation": "Innovation is at our core - we continuously research and implement cutting-edge AI technologies to provide our clients with competitive advantages through automation.",

        "getting started": "Getting started is easy! Contact us at contact@aback.ai or schedule a free consultation through our website. We'll assess your needs and propose the best automation solution for your business.",
        "next steps": "The next step is to schedule a consultation where we'll discuss your specific needs, assess your current processes, and design a custom automation solution that delivers maximum value for your business.",
        "free consultation": "Yes, we offer free initial consultations to understand your automation needs and explore how Aback.ai can help transform your business operations.",

        "help": "I can help you learn about Aback.ai's services, automation solutions, implementation process, pricing, or any other questions about AI automation. What would you like to know?",
        "more information": "For more detailed information about our services, case studies, or to discuss your specific needs, please visit our website or contact us at contact@aback.ai. We're here to help!",

        "thank you": "You're welcome! If you have any more questions about AI automation or how Aback.ai can help your business, feel free to ask or contact us at contact@aback.ai.",
        "thanks": "You're welcome! Feel free to reach out anytime if you need more information about our automation solutions or want to discuss your specific requirements."
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
    // This ensures consistent behavior across all pages including homepage
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
        
        // Try multiple times if configured
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            debug(`API call attempt ${attempt} for message: ${message}...`);
            
            try {
                // Prepare messages array with conversation history
                const allMessages = [...chatHistory.slice(0, -1)]; // Include previous history except current message
                
                // Send request to our proxy endpoint
                const response = await fetch(CHATBOT_CONFIG.proxyUrl, {
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