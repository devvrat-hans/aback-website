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
  const cleanURLPages = ['services', 'whyus', 'about', 'careers', 'contact', 'privacy', 'terms', 'ethics-charter'];
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
  
  // Force template loading - always try to load regardless of environment detection
  console.log("Force loading templates regardless of environment...");
  
  // Set primary paths - prioritize absolute paths for production  
  let navbarPath = "/src/templates/shared/navbar.html";
  let footerPath = "/src/templates/shared/footer.html";
  let chatbotPath = "/src/templates/shared/chatbot.html";
  
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
    
    // Try to load navbar, with fallback to multiple paths if needed
    function loadNavbar(path, isFirstAttempt = true) {
      console.log("Attempting to load navbar from:", path);
      fetch(path)
        .then(response => {
          console.log("Navbar response status:", response.status, "for path:", path);
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
          console.error("Error loading navbar with path:", path, error);
          // Try alternative paths systematically
          if (isFirstAttempt) {
            console.log("Trying alternative paths for navbar...");
            // Try multiple fallback paths in order of likelihood
            const fallbackPaths = [
              "/src/templates/shared/navbar.html", // Absolute path (most likely to work)
              "../templates/shared/navbar.html",  // Relative from pages directory
              "../../templates/shared/navbar.html" // Relative from deeper directories
            ];
            
            let currentFallback = 0;
            function tryNextFallback() {
              if (currentFallback < fallbackPaths.length) {
                const fallbackPath = fallbackPaths[currentFallback];
                currentFallback++;
                console.log("Trying fallback path:", fallbackPath);
                
                fetch(fallbackPath)
                  .then(response => {
                    if (!response.ok) {
                      throw new Error("Fallback failed: " + response.status);
                    }
                    return response.text();
                  })
                  .then(html => {
                    console.log("Navbar loaded successfully with fallback path:", fallbackPath);
                    navContainer.innerHTML = html;
                    setTimeout(() => {
                      initNavbar();
                      if (typeof setActiveNavigation === 'function') {
                        setActiveNavigation();
                      }
                    }, 100);
                  })
                  .catch(error => {
                    console.error("Fallback path failed:", fallbackPath, error);
                    tryNextFallback();
                  });
              } else {
                console.error("All navbar fallback paths failed");
              }
            }
            tryNextFallback();
          }
        });
    }
    
    loadNavbar(navbarPath);
  } else if (navContainer) {
    console.log("Navbar container found but may be empty, attempting to load...");
    // If navbar container exists but is empty, try to load it anyway
    if (navContainer.children.length === 0) {
      console.log("Navbar container is empty, loading navbar...");
      function loadNavbar(path, isFirstAttempt = true) {
        console.log("Attempting to load navbar from:", path);
        fetch(path)
          .then(response => {
            console.log("Navbar response status:", response.status, "for path:", path);
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
            console.error("Error loading navbar with path:", path, error);
            // Try alternative paths systematically
            if (isFirstAttempt) {
              console.log("Trying alternative paths for navbar...");
              // Try multiple fallback paths in order of likelihood  
              const fallbackPaths = [
                "/src/templates/shared/navbar.html", // Absolute path (most likely to work)
                "../templates/shared/navbar.html",  // Relative from pages directory
                "../../templates/shared/navbar.html" // Relative from deeper directories
              ];
              
              let currentFallback = 0;
              function tryNextFallback() {
                if (currentFallback < fallbackPaths.length) {
                  const fallbackPath = fallbackPaths[currentFallback];
                  currentFallback++;
                  console.log("Trying fallback path:", fallbackPath);
                  
                  fetch(fallbackPath)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error("Fallback failed: " + response.status);
                      }
                      return response.text();
                    })
                    .then(html => {
                      console.log("Navbar loaded successfully with fallback path:", fallbackPath);
                      navContainer.innerHTML = html;
                      setTimeout(() => {
                        initNavbar();
                        if (typeof setActiveNavigation === 'function') {
                          setActiveNavigation();
                        }
                      }, 100);
                    })
                    .catch(error => {
                      console.error("Fallback path failed:", fallbackPath, error);
                      tryNextFallback();
                    });
                } else {
                  console.error("All navbar fallback paths failed");
                }
              }
              tryNextFallback();
            }
          });
      }
      loadNavbar(navbarPath);
    } else {
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
  } else {
    console.log("No navbar container found in DOM");
  }

  // Only load footer if container is empty (not already populated)
  if (footerContainer && footerContainer.children.length === 0) {
    console.log("Starting footer fetch...");
    
    // Try to load footer, with fallback to multiple paths if needed
    function loadFooter(path, isFirstAttempt = true) {
      console.log("Attempting to load footer from:", path);
      fetch(path)
        .then(response => {
          console.log("Footer response status:", response.status, "for path:", path);
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
          console.error("Error loading footer with path:", path, error);
          // Try alternative paths systematically
          if (isFirstAttempt) {
            console.log("Trying alternative paths for footer...");
            // Try multiple fallback paths
            const fallbackPaths = [
              "/src/templates/shared/footer.html", // Absolute path (most likely to work)                "../templates/shared/footer.html",  // Relative from pages directory
                "../../templates/shared/footer.html" // Relative from deeper directories
              ];
            
            let currentFallback = 0;
            function tryNextFallback() {
              if (currentFallback < fallbackPaths.length) {
                const fallbackPath = fallbackPaths[currentFallback];
                currentFallback++;
                console.log("Trying footer fallback path:", fallbackPath);
                
                fetch(fallbackPath)
                  .then(response => {
                    if (!response.ok) {
                      throw new Error("Footer fallback failed: " + response.status);
                    }
                    return response.text();
                  })
                  .then(html => {
                    console.log("Footer loaded successfully with fallback path:", fallbackPath);
                    footerContainer.innerHTML = html;
                  })
                  .catch(error => {
                    console.error("Footer fallback path failed:", fallbackPath, error);
                    tryNextFallback();
                  });
              } else {
                console.error("All footer fallback paths failed");
              }
            }
            tryNextFallback();
          }
        });
    }
    
    loadFooter(footerPath);
  } else if (footerContainer) {
    console.log("Footer container found but may be empty, attempting to load...");
    // If footer container exists but is empty, try to load it anyway
    if (footerContainer.children.length === 0) {
      console.log("Footer container is empty, loading footer...");
      function loadFooter(path, isFirstAttempt = true) {
        console.log("Attempting to load footer from:", path);
        fetch(path)
          .then(response => {
            console.log("Footer response status:", response.status, "for path:", path);
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
            console.error("Error loading footer with path:", path, error);
            // Try alternative paths systematically
            if (isFirstAttempt) {
              console.log("Trying alternative paths for footer...");
              // Try multiple fallback paths
              const fallbackPaths = [
                "/src/templates/shared/footer.html", // Absolute path (most likely to work)
                "../templates/shared/footer.html",  // Relative from pages directory
                "../../templates/shared/footer.html" // Relative from deeper directories
              ];
              
              let currentFallback = 0;
              function tryNextFallback() {
                if (currentFallback < fallbackPaths.length) {
                  const fallbackPath = fallbackPaths[currentFallback];
                  currentFallback++;
                  console.log("Trying footer fallback path:", fallbackPath);
                  
                  fetch(fallbackPath)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error("Footer fallback failed: " + response.status);
                      }
                      return response.text();
                    })
                    .then(html => {
                      console.log("Footer loaded successfully with fallback path:", fallbackPath);
                      footerContainer.innerHTML = html;
                    })
                    .catch(error => {
                      console.error("Footer fallback path failed:", fallbackPath, error);
                      tryNextFallback();
                    });
                } else {
                  console.error("All footer fallback paths failed");
                }
              }
              tryNextFallback();
            }
          });
      }
      loadFooter(footerPath);
    } else {
      console.log("Footer already exists, skipping load");
    }
  } else {
    console.log("No footer container found in DOM");
  }
    
  // Load chatbot
  function loadChatbot(path, isFirstAttempt = true) {
    fetch(path)
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
        console.log("Chatbot HTML inserted into DOM");
        
        // Load chatbot script after HTML is inserted with a small delay
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
        // Try alternative paths for chatbot with same fallback logic
        if (isFirstAttempt) {
          console.log("Trying alternative paths for chatbot...");
          const fallbackPaths = [
            "/src/templates/shared/chatbot.html",
            "../templates/shared/chatbot.html",
            "../../templates/shared/chatbot.html"
          ];
          
          let currentFallback = 0;
          function tryNextChatbotFallback() {
            if (currentFallback < fallbackPaths.length) {
              const fallbackPath = fallbackPaths[currentFallback];
              currentFallback++;
              console.log("Trying chatbot fallback path:", fallbackPath);
              
              fetch(fallbackPath)
                .then(response => {
                  if (!response.ok) {
                    throw new Error("Chatbot fallback failed: " + response.status);
                  }
                  return response.text();
                })
                .then(html => {
                  console.log("Chatbot loaded successfully with fallback path:", fallbackPath);
                  const chatbotContainer = document.createElement('div');
                  chatbotContainer.id = 'chatbot-container';
                  chatbotContainer.innerHTML = html;
                  document.body.appendChild(chatbotContainer);
                  
                  setTimeout(() => {
                    const chatbotScriptPath = '/src/assets/js/chatbot.js';
                    const configScriptPath = '/src/assets/js/web-config.js';
                    
                    loadScript(configScriptPath, (configError) => {
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
                  }, 100);
                })
                .catch(error => {
                  console.error("Chatbot fallback path failed:", fallbackPath, error);
                  tryNextChatbotFallback();
                });
            } else {
              console.log("All chatbot fallback paths failed, continuing without chatbot");
            }
          }
          tryNextChatbotFallback();
        }
      });
  }
  
  loadChatbot(chatbotPath);
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
