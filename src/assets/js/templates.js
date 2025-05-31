document.addEventListener("DOMContentLoaded", function () {
  console.log("Loading templates...");
  console.log("Current pathname:", window.location.pathname);
  console.log("Current location:", window.location.href);
  console.log("Current hostname:", window.location.hostname);
  
  // Determine environment based on hostname
  const isLocalDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '' ||
                    window.location.hostname.includes('localhost');
  
  const isProduction = window.location.hostname === 'aback.ai' || 
                      window.location.hostname === 'www.aback.ai';
  
  console.log("Is local development:", isLocalDev);
  console.log("Is production:", isProduction);
  
  // Set template paths - always use absolute paths for consistency
  let navbarPath = "/src/templates/shared/navbar.html";
  let footerPath = "/src/templates/shared/footer.html";
  let chatbotPath = "/src/templates/shared/chatbot.html";
  
  console.log("Using navbar path:", navbarPath);
  console.log("Using footer path:", footerPath);
  
  // Check if containers exist
  const navContainer = document.getElementById("navbar-container");
  const footerContainer = document.getElementById("footer-container");
  const chatbotContainer = document.getElementById("chatbot-container");
  
  console.log("Navbar container found:", !!navContainer);
  console.log("Footer container found:", !!footerContainer);
  console.log("Chatbot container found:", !!chatbotContainer);
  
  // Load navbar
  if (navContainer) {
    console.log("Loading navbar...");
    loadTemplate(navbarPath, navContainer, 'navbar', () => {
      console.log("Navbar loaded, fixing URLs for environment...");
      fixNavbarUrls();
      console.log("Navbar URLs fixed, initializing...");
      setTimeout(() => {
        initNavbar();
        if (typeof setActiveNavigation === 'function') {
          setActiveNavigation();
        }
      }, 100);
    });
  } else {
    console.error("Navbar container not found!");
  }

  // Load footer
  if (footerContainer) {
    console.log("Loading footer...");
    loadTemplate(footerPath, footerContainer, 'footer', () => {
      console.log("Footer loaded, fixing URLs for environment...");
      fixFooterUrls();
    });
  } else {
    console.error("Footer container not found!");
  }

  // Load chatbot - create container if it doesn't exist
  if (!chatbotContainer) {
    console.log("Creating chatbot container...");
    const newChatbotContainer = document.createElement('div');
    newChatbotContainer.id = 'chatbot-container';
    document.body.appendChild(newChatbotContainer);
    
    loadTemplate(chatbotPath, newChatbotContainer, 'chatbot', () => {
      console.log("Chatbot loaded, initializing scripts...");
      loadChatbotScripts();
    });
  } else {
    loadTemplate(chatbotPath, chatbotContainer, 'chatbot', () => {
      console.log("Chatbot loaded, initializing scripts...");
      loadChatbotScripts();
    });
  }
});

// Generic template loader function
function loadTemplate(path, container, templateName, callback) {
  console.log(`Attempting to load ${templateName} from:`, path);
  
  fetch(path)
    .then(response => {
      console.log(`${templateName} response status:`, response.status);
      if (!response.ok) {
        throw new Error(`Failed to load ${templateName}: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      console.log(`${templateName} loaded successfully, length:`, html.length);
      container.innerHTML = html;
      console.log(`${templateName} HTML inserted into container`);
      
      if (typeof callback === 'function') {
        callback();
      }
    })
    .catch(error => {
      console.error(`Error loading ${templateName}:`, error);
      // Try fallback paths
      const fallbackPaths = [
        `/src/templates/shared/${templateName}.html`,
        `../templates/shared/${templateName}.html`,
        `../../templates/shared/${templateName}.html`
      ];
      
      tryFallbackPaths(fallbackPaths, container, templateName, callback);
    });
}

// Try fallback paths
function tryFallbackPaths(paths, container, templateName, callback) {
  if (paths.length === 0) {
    console.error(`All fallback paths failed for ${templateName}`);
    return;
  }
  
  const currentPath = paths.shift();
  console.log(`Trying fallback path for ${templateName}:`, currentPath);
  
  fetch(currentPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fallback failed: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      console.log(`${templateName} loaded successfully with fallback:`, currentPath);
      container.innerHTML = html;
      
      if (typeof callback === 'function') {
        callback();
      }
    })
    .catch(error => {
      console.error(`Fallback path failed for ${templateName}:`, currentPath, error);
      tryFallbackPaths(paths, container, templateName, callback);
    });
}

// Load chatbot scripts
function loadChatbotScripts() {
  const chatbotScriptPath = '/src/assets/js/chatbot.js';
  const configScriptPath = '/src/assets/js/web-config.js';
  
  loadScript(configScriptPath, (configError) => {
    if (configError) {
      console.log("Config script failed to load, proceeding anyway");
    }
    
    loadScript(chatbotScriptPath, (chatbotError) => {
      if (!chatbotError) {
        setTimeout(() => {
          if (typeof window.initializeChatbot === 'function') {
            window.initializeChatbot();
          }
        }, 100);
      }
    });
  });
}

// Fix navbar URLs based on environment
function fixNavbarUrls() {
  const isLocalDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '' ||
                    window.location.hostname.includes('localhost');
  
  if (isLocalDev) {
    console.log("Fixing navbar URLs for local development...");
    
    // URL mapping for local development
    const urlMap = {
      '/services': '/src/pages/services.html',
      '/whyus': '/src/pages/whyus.html',
      '/about': '/src/pages/about.html',
      '/careers': '/src/pages/careers.html',
      '/blog': '/src/pages/blog.html',
      '/contact': '/src/pages/contact.html'
    };
    
    // Fix desktop nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (urlMap[href]) {
        link.setAttribute('href', urlMap[href]);
        console.log(`Updated nav link: ${href} -> ${urlMap[href]}`);
      }
    });
    
    // Fix mobile nav links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (urlMap[href]) {
        link.setAttribute('href', urlMap[href]);
        console.log(`Updated mobile nav link: ${href} -> ${urlMap[href]}`);
      }
    });
    
    // Fix contact button
    const contactButtons = document.querySelectorAll('.contact-button, .mobile-button');
    contactButtons.forEach(button => {
      const href = button.getAttribute('href');
      if (href === '/contact') {
        button.setAttribute('href', '/src/pages/contact.html');
        console.log(`Updated contact button: ${href} -> /src/pages/contact.html`);
      }
    });
  }
}

// Fix footer URLs based on environment
function fixFooterUrls() {
  const isProduction = window.location.hostname === 'aback.ai' || 
                      window.location.hostname === 'www.aback.ai';
  
  if (isProduction) {
    console.log("Fixing footer URLs for production...");
    
    // URL mapping for production (clean URLs)
    const urlMap = {
      '/src/pages/about.html': '/about',
      '/src/pages/services.html': '/services',
      '/src/pages/blog.html': '/blog',
      '/src/pages/careers.html': '/careers',
      '/src/pages/contact.html': '/contact',
      '/src/pages/privacy.html': '/privacy',
      '/src/pages/terms.html': '/terms',
      '/src/pages/ethics-charter.html': '/ethics-charter'
    };
    
    // Fix footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (urlMap[href]) {
        link.setAttribute('href', urlMap[href]);
        console.log(`Updated footer link: ${href} -> ${urlMap[href]}`);
      }
    });
  }
}

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
    if (navbar) {
      navbar.style.opacity = '1';
      navbar.style.transform = 'translateX(-50%) translateY(0)';
      navbar.style.visibility = 'visible';
      navbar.style.display = 'block';
      console.log("Navbar made visible");
    }
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
