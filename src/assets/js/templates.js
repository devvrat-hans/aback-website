document.addEventListener("DOMContentLoaded", function () {
  console.log("Loading templates...");
  console.log("Current pathname:", window.location.pathname);
  console.log("Current location:", window.location.href);
  
  // Determine if we are at root level or in a subdirectory
  const isRootLevel = window.location.pathname === '/' || 
                     window.location.pathname.endsWith('index') || 
                     window.location.pathname === '/index';
  
  // Check if we're in local development with pages subdirectory
  const isLocalDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';
  
  // Check if we're in a pages subdirectory (for local development)
  const isInPagesDir = window.location.pathname.includes('/src/pages/') || 
                      window.location.pathname.includes('/pages/');
  
  // For production clean URLs (aback.ai domain structure)
  const cleanURLPages = ['services', 'whyus', 'about', 'careers', 'contact', 'privacy', 'terms', 'security', 'ethics-charter'];
  const currentPage = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const isCleanURL = cleanURLPages.includes(currentPage);
  
  // Determine if we're in production environment
  const isProduction = window.location.hostname === 'aback.ai' || 
                      window.location.hostname === 'www.aback.ai' ||
                      (!isLocalDev && !isInPagesDir);
  
  console.log("Is root level:", isRootLevel);
  console.log("Is local development:", isLocalDev);
  console.log("Is in pages directory:", isInPagesDir);
  console.log("Is clean URL:", isCleanURL);
  console.log("Is production:", isProduction);
  console.log("Current page:", currentPage);
  
  // Set the correct paths based on current location
  let navbarPath, footerPath, chatbotPath;
  
  if (isProduction || isCleanURL) {
    // Production environment with clean URLs (aback.ai/services, etc.)
    navbarPath = "/src/templates/shared/navbar";
    footerPath = "/src/templates/shared/footer";
    chatbotPath = "/src/templates/shared/chatbot";
  } else if (isLocalDev && isInPagesDir) {
    // Local development with src/pages/ directory structure
    navbarPath = "/src/templates/shared/navbar";
    footerPath = "/src/templates/shared/footer";
    chatbotPath = "/src/templates/shared/chatbot";
  } else if (isLocalDev && isRootLevel) {
    // Local development at root level
    navbarPath = "/src/templates/shared/navbar";
    footerPath = "/src/templates/shared/footer";
    chatbotPath = "/src/templates/shared/chatbot";
  } else {
    // Fallback - use absolute paths
    navbarPath = "/src/templates/shared/navbar";
    footerPath = "/src/templates/shared/footer";
    chatbotPath = "/src/templates/shared/chatbot";
  }
  
  console.log("Using navbar path:", navbarPath);
  console.log("Using footer path:", footerPath);
  
  // Check if containers exist and are empty
  const navContainer = document.getElementById("navbar-container");
  const footerContainer = document.getElementById("footer-container");
  
  console.log("Navbar container found:", !!navContainer);
  console.log("Footer container found:", !!footerContainer);
  console.log("Navbar container is empty:", navContainer && navContainer.children.length === 0);
  console.log("Footer container is empty:", footerContainer && footerContainer.children.length === 0);
  
  // Only load navbar if container is empty (not already populated)
  if (navContainer && navContainer.children.length === 0) {
    console.log("Starting navbar fetch...");
    fetch(navbarPath)
      .then(response => {
        console.log("Navbar response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to load navbar: " + response.status + " " + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        console.log("Navbar template loaded successfully, length:", html.length);
        navContainer.innerHTML = html;
        console.log("Navbar HTML inserted into container");
        // Initialize navbar functionality after it's loaded
        setTimeout(() => {
          initNavbar();
          // Set active navigation using the robust function from main.js
          if (typeof setActiveNavigation === 'function') {
            setActiveNavigation();
          }
        }, 100);
      })
      .catch(error => {
        console.error("Error loading navbar:", error);
      });
  } else if (navContainer) {
    console.log("Navbar already exists, initializing...");
    // Initialize navbar functionality for existing content
    setTimeout(() => {
      initNavbar();
      // Set active navigation using the robust function from main.js
      if (typeof setActiveNavigation === 'function') {
        setActiveNavigation();
      }
    }, 100);
  }

  // Only load footer if container is empty (not already populated)
  if (footerContainer && footerContainer.children.length === 0) {
    console.log("Starting footer fetch...");
    fetch(footerPath)
      .then(response => {
        console.log("Footer response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to load footer: " + response.status + " " + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        console.log("Footer template loaded successfully, length:", html.length);
        footerContainer.innerHTML = html;
        console.log("Footer HTML inserted into container");
      })
      .catch(error => {
        console.error("Error loading footer:", error);
      });
  } else if (footerContainer) {
    console.log("Footer already exists, skipping load");
  }
    
  // Load chatbot
  fetch(chatbotPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load chatbot: " + response.status + " " + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      console.log("Chatbot template loaded successfully");
      const chatbotContainer = document.createElement('div');
      chatbotContainer.id = 'chatbot-container';
      chatbotContainer.innerHTML = html;
      document.body.appendChild(chatbotContainer);
      console.log("Chatbot HTML inserted into DOM");        // Load chatbot script after HTML is inserted with a small delay
        setTimeout(() => {
          console.log("Loading chatbot scripts...");
          // Use absolute paths for all environments
          const chatbotScriptPath = '/src/assets/js/chatbot.js';
          const configScriptPath = '/src/assets/js/web-config.js';
        
        // Try to load config first, but don't block chatbot if it fails
        loadScript(configScriptPath, (configError) => {
          if (configError) {
            console.log("Config script failed to load, proceeding with chatbot script anyway");
          } else {
            console.log("Config script loaded successfully");
          }
          
          // Load chatbot script regardless of config script status
          loadScript(chatbotScriptPath, (chatbotError) => {
            if (chatbotError) {
              console.error("Failed to load chatbot script:", chatbotError);
              return;
            }
            
            console.log("Chatbot script loaded, initializing...");
            // Force initialization if the chatbot hasn't initialized yet
            setTimeout(() => {
              if (typeof window.initializeChatbot === 'function') {
                console.log("Calling initializeChatbot function");
                window.initializeChatbot();
              } else {
                console.error("initializeChatbot function not found");
              }
            }, 100);
          });
        });
      }, 100);
    })
    .catch(error => {
      console.error("Error loading chatbot:", error);
    });
});

// Function to dynamically load scripts
function loadScript(src, callback) {
  console.log("Loading script:", src);
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = function() {
    console.log("Script loaded successfully:", src);
    if (typeof callback === 'function') {
      callback();
    }
  };
  script.onerror = function() {
    console.error("Failed to load script:", src);
    if (typeof callback === 'function') {
      callback(new Error('Failed to load script: ' + src));
    }
  };
  document.head.appendChild(script);
}

// Initialize navbar functionality
function initNavbar() {
  const navbar = document.querySelector('.modern-navbar');
  const navbarContainer = document.getElementById('navbar-container');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!navbar) {
    console.error('Navbar not found!');
    return;
  }
  
  // Handle menu toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      
      // Prevent body scrolling when menu is open
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  // Add scroll effects
  window.addEventListener('scroll', function() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
      if (navbarContainer) navbarContainer.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
      if (navbarContainer) navbarContainer.classList.remove('scrolled');
    }
  });
  
  // Set active link based on current page - use robust function from main.js if available
  if (typeof setActiveNavigation === 'function') {
    setActiveNavigation();
  } else {
    setActiveNavLink();
  }
  
  // Close mobile menu on window resize (if desktop size)
  if (mobileMenu && menuToggle) {
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  // Show the navbar with animation
  setTimeout(() => {
    navbar.style.opacity = '1';
    navbar.style.transform = 'translateX(-50%) translateY(0)';
  }, 100);
}

// Set active nav link based on current page
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  let currentPageName = currentPath.replace(/^\//, '') || 'home'; // Remove leading slash
  
  // Handle clean URLs in production (aback.ai/services -> services)
  if (currentPath === '/') {
    currentPageName = 'home';
  }
  
  console.log("Current path:", currentPath);
  console.log("Current page name:", currentPageName);
  
  // Desktop nav links
  const navLinks = document.querySelectorAll('.nav-link');
  if (navLinks.length) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      let hrefPageName;
      
      // Extract page name from href
      if (href === '/' || href.includes('index')) {
        hrefPageName = 'home';
      } else if (href.includes('/src/pages/')) {
        // Local development structure: /src/pages/services -> services
        hrefPageName = href.split('/').pop().replace('', '');
      } else {
        // Clean URL structure: /services -> services or absolute paths
        hrefPageName = href.replace(/^\//, '').replace('', '') || 'home';
        // Handle absolute paths
        if (hrefPageName.includes('/')) {
          hrefPageName = hrefPageName.split('/').pop().replace('', '');
        }
      }
      
      // Check for home page special case
      const isHomePage = currentPageName === 'home' || currentPageName === '';
      
      // Enhanced match logic
      let isMatch = false;
      
      // Home page matches
      if (isHomePage && hrefPageName === 'home') {
        isMatch = true;
      } 
      // Exact match for other pages
      else if (hrefPageName === currentPageName && currentPageName !== '' && currentPageName !== 'home') {
        isMatch = true;
      }
      
      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Mobile nav links 
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (mobileLinks.length) {
    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      let hrefPageName;
      
      // Extract page name from href
      if (href === '/' || href.includes('index')) {
        hrefPageName = 'home';
      } else if (href.includes('/src/pages/')) {
        // Local development structure: /src/pages/services -> services
        hrefPageName = href.split('/').pop().replace('', '');
      } else {
        // Clean URL structure: /services -> services or absolute paths
        hrefPageName = href.replace(/^\//, '').replace('', '') || 'home';
        // Handle absolute paths
        if (hrefPageName.includes('/')) {
          hrefPageName = hrefPageName.split('/').pop().replace('', '');
        }
      }
      
      // Check for home page special case
      const isHomePage = currentPageName === 'home' || currentPageName === '';
      
      // Enhanced match logic for mobile
      let isMatch = false;
      
      // Home page matches
      if (isHomePage && hrefPageName === 'home') {
        isMatch = true;
      } 
      // Exact match for other pages
      else if (hrefPageName === currentPageName && currentPageName !== '' && currentPageName !== 'home') {
        isMatch = true;
      }
      
      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
