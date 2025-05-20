// filepath: /Users/devvrathans/aback.ai/aback-website/src/assets/js/templates.js
document.addEventListener("DOMContentLoaded", function () {
  console.log("Loading templates...");
  
  // Determine if we are at root level (index.html) or in a subdirectory (pages)
  const isRootLevel = window.location.pathname === '/' || 
                     window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/');
  
  // Set the correct paths based on current location
  const navbarPath = isRootLevel ? "/src/templates/shared/navbar.html" : "../templates/shared/navbar.html";
  const footerPath = isRootLevel ? "/src/templates/shared/footer.html" : "../templates/shared/footer.html";
  
  console.log("Using navbar path:", navbarPath);
  
  // Load navbar
  fetch(navbarPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load navbar: " + response.status + " " + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      console.log("Navbar template loaded successfully");
      const navContainer = document.getElementById("navbar-container");
      if (navContainer) {
        navContainer.innerHTML = html;
        // Initialize navbar functionality after it's loaded
        initNavbar();
      } else {
        console.error("Navbar container not found in the DOM");
      }
    })
    .catch(error => {
      console.error("Error loading navbar:", error);
    });

  // Load footer
  fetch(footerPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to load footer: " + response.status + " " + response.statusText);
      }
      return response.text();
    })
    .then(html => {
      console.log("Footer template loaded successfully");
      const footerContainer = document.getElementById("footer-container");
      if (footerContainer) {
        footerContainer.innerHTML = html;
      } else {
        console.error("Footer container not found in the DOM");
      }
    })
    .catch(error => {
      console.error("Error loading footer:", error);
    });
});

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
  
  // Set active link based on current page
  setActiveNavLink();
  
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
  const currentPageName = currentPath.split('/').pop() || 'index.html';
  
  console.log("Current page:", currentPageName);
  
  // Desktop nav links
  const navLinks = document.querySelectorAll('.nav-link');
  if (navLinks.length) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Extract page name from href
      const hrefPageName = href.split('/').pop();
      
      // Check for home page special case
      const isHomePage = currentPath === '/' || 
                       currentPath.endsWith('index.html') || 
                       currentPath.endsWith('/');
      
      // Mark active state
      if (isHomePage && (hrefPageName === 'index.html' || href === '/' || href.endsWith('/'))) {
        link.classList.add('active');
      } else if (hrefPageName === currentPageName) {
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
      const hrefPageName = href.split('/').pop();
      
      // Check for home page special case
      const isHomePage = currentPath === '/' || 
                       currentPath.endsWith('index.html') || 
                       currentPath.endsWith('/');
      
      // Mark active state
      if (isHomePage && (hrefPageName === 'index.html' || href === '/' || href.endsWith('/'))) {
        link.classList.add('active');
      } else if (hrefPageName === currentPageName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
