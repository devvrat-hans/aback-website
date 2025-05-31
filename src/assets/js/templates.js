/**
 * Templates.js - Production Template Loader for Aback.ai
 * Loads navbar, footer, and chatbot templates for pages in /src/pages/ directory
 * Optimized for production environment with error handling and caching
 */

(function() {
    'use strict';

    // Configuration
    const TEMPLATE_CONFIG = {
        basePath: '/src/templates/shared/',
        templates: {
            navbar: 'navbar.html',
            footer: 'footer.html',
            chatbot: 'chatbot.html'
        },
        containers: {
            navbar: 'navbar-container',
            footer: 'footer-container',
            chatbot: 'chatbot-container'
        },
        cache: new Map(), // Template cache for performance
        timeout: 5000 // Request timeout in milliseconds
    };

    // Pages that should load templates (based on sitemap and pages directory)
    const TEMPLATE_PAGES = [
        '/services',
        '/whyus', 
        '/about',
        '/careers',
        '/contact',
        '/privacy',
        '/terms',
        '/blog',
        '/ethics-charter'
    ];

    /**
     * Check if current page should load templates
     * @returns {boolean}
     */
    function shouldLoadTemplates() {
        const currentPath = window.location.pathname;
        
        // Always load for pages in the TEMPLATE_PAGES array
        if (TEMPLATE_PAGES.includes(currentPath)) {
            return true;
        }
        
        // Handle blog post pages and other dynamic routes
        if (currentPath.startsWith('/blog/') || currentPath.includes('blog-')) {
            return true;
        }
        
        // Don't load for root path and other paths
        return false;
    }

    /**
     * Create a fetch request with timeout
     * @param {string} url 
     * @param {number} timeout 
     * @returns {Promise}
     */
    function fetchWithTimeout(url, timeout = TEMPLATE_CONFIG.timeout) {
        return Promise.race([
            fetch(url, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);
    }

    /**
     * Load template with caching and error handling
     * @param {string} templateName 
     * @returns {Promise<string>}
     */
    async function loadTemplate(templateName) {
        // Check cache first
        if (TEMPLATE_CONFIG.cache.has(templateName)) {
            return TEMPLATE_CONFIG.cache.get(templateName);
        }

        const templateUrl = TEMPLATE_CONFIG.basePath + TEMPLATE_CONFIG.templates[templateName];
        
        try {
            const response = await fetchWithTimeout(templateUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const templateHTML = await response.text();
            
            // Cache the template
            TEMPLATE_CONFIG.cache.set(templateName, templateHTML);
            
            return templateHTML;
        } catch (error) {
            console.error(`Failed to load template '${templateName}':`, error);
            return `<!-- Template '${templateName}' failed to load: ${error.message} -->`;
        }
    }

    /**
     * Insert template into container
     * @param {string} templateName 
     * @param {string} templateHTML 
     */
    function insertTemplate(templateName, templateHTML) {
        const containerId = TEMPLATE_CONFIG.containers[templateName];
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.warn(`Container '${containerId}' not found for template '${templateName}'`);
            return;
        }
        
        try {
            container.innerHTML = templateHTML;
            
            // Dispatch custom event for template loaded
            const event = new CustomEvent('templateLoaded', {
                detail: { templateName, containerId }
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error(`Failed to insert template '${templateName}':`, error);
            container.innerHTML = `<!-- Error loading ${templateName} template -->`;
        }
    }

    /**
     * Load all templates
     * @returns {Promise<void>}
     */
    async function loadAllTemplates() {
        if (!shouldLoadTemplates()) {
            return;
        }

        const loadingPromises = Object.keys(TEMPLATE_CONFIG.templates).map(async (templateName) => {
            try {
                const templateHTML = await loadTemplate(templateName);
                insertTemplate(templateName, templateHTML);
            } catch (error) {
                console.error(`Error processing template '${templateName}':`, error);
            }
        });

        try {
            await Promise.allSettled(loadingPromises);
            
            // Dispatch event when all templates are loaded
            const allLoadedEvent = new CustomEvent('allTemplatesLoaded');
            document.dispatchEvent(allLoadedEvent);
            
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    /**
     * Initialize navbar active state based on current page
     */
    function initializeNavigation() {
        document.addEventListener('templateLoaded', function(event) {
            if (event.detail.templateName === 'navbar') {
                setActiveNavLink();
            }
        });
    }

    /**
     * Set active navigation link based on current path
     */
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Initialize chatbot functionality after template is loaded
     */
    function initializeChatbot() {
        document.addEventListener('templateLoaded', function(event) {
            if (event.detail.templateName === 'chatbot') {
                // Initialize chatbot if chatbot.js is available
                if (typeof window.initializeChatbot === 'function') {
                    window.initializeChatbot();
                }
            }
        });
    }

    /**
     * Handle template loading errors gracefully
     */
    function handleTemplateErrors() {
        window.addEventListener('error', function(event) {
            if (event.filename && event.filename.includes('/src/templates/')) {
                console.error('Template loading error:', event.error);
            }
        });
    }

    /**
     * Performance monitoring for template loading
     */
    function monitorPerformance() {
        if (window.performance && window.performance.mark) {
            window.performance.mark('templates-start');
            
            document.addEventListener('allTemplatesLoaded', function() {
                window.performance.mark('templates-end');
                window.performance.measure('templates-load-time', 'templates-start', 'templates-end');
                
                const measure = window.performance.getEntriesByName('templates-load-time')[0];
                if (measure) {
                    console.log(`Templates loaded in ${measure.duration.toFixed(2)}ms`);
                }
            });
        }
    }

    /**
     * Initialize the template loader
     */
    function initialize() {
        // Start performance monitoring
        monitorPerformance();
        
        // Set up error handling
        handleTemplateErrors();
        
        // Initialize navigation handling
        initializeNavigation();
        
        // Initialize chatbot handling
        initializeChatbot();
        
        // Load templates
        loadAllTemplates().catch(error => {
            console.error('Critical error loading templates:', error);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        initialize();
    }

    // Expose public API for debugging (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.TemplateLoader = {
            config: TEMPLATE_CONFIG,
            loadTemplate,
            shouldLoadTemplates,
            cache: TEMPLATE_CONFIG.cache
        };
    }

})();