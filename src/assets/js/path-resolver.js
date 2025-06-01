/**
 * Path Resolver - Handles correct path resolution based on current page location
 * 
 * This script detects if a page is running from the main domain root or from
 * the /src/pages/ directory and adjusts API paths accordingly.
 */

// Self-executing function to avoid polluting global scope
(function() {
    // Get the current path to determine if we're in a subdirectory
    const currentPath = window.location.pathname;
    
    // Add path resolver to the global CHATBOT_CONFIG object
    if (typeof CHATBOT_CONFIG !== 'undefined') {
        // Determine if we're in /src/pages/ directory
        const isInPagesDir = currentPath.includes('/src/pages/');
        
        // Set the correct proxy URL based on the current path
        if (isInPagesDir) {
            console.log('Path resolver: Running from /src/pages/, using relative proxy path');
            CHATBOT_CONFIG.proxyUrl = "../../src/api/chat-proxy.php";
        } else {
            console.log('Path resolver: Running from root, using absolute proxy path');
            // Keep the default proxy URL which is "/api/chat-proxy.php"
        }
    } else {
        console.error('Path resolver: CHATBOT_CONFIG not found!');
    }
})();
