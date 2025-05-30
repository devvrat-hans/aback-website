/**
 * Navbar interactions and animations
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait a moment to make sure the navbar is loaded
  setTimeout(() => {
    // Get navbar elements
    const navbar = document.querySelector('.modern-navbar');
    const navbarContainer = document.getElementById('navbar-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (navbar) {
      // Show the navbar
      navbar.style.opacity = '1';
      navbar.style.transform = 'translateX(-50%) translateY(0)';
      
      // Handle scrolling effect
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
          navbarContainer?.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
          navbarContainer?.classList.remove('scrolled');
        }
      });
    } else {
      console.error('Navbar not found in the DOM');
    }
  }, 200);
  
  // Handle menu toggle on mobile
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      const mobileMenu = document.querySelector('.mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.toggle('active');
      }
    });
  }
  
  // Add active class based on current page
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Get the page name from the current path
      const currentPagePath = currentPath.split('/').pop() || 'index.html';
      const currentPageClean = currentPagePath.replace('.html', '');
      
      // Get the page name from the href
      const hrefPagePath = href.split('/').pop();
      const hrefPageClean = hrefPagePath.replace('.html', '');
      
      // Check if we're on the homepage (handle both /index and / and /index.html)
      const isHomePage = currentPath === '/' || 
                         currentPath === '/index' ||
                         currentPath.endsWith('index.html') ||
                         currentPath.endsWith('/index');
      const isHomeLink = href.endsWith('index.html');
      
      // Enhanced matching logic for both clean URLs and .html URLs
      let isMatch = false;
      
      // Special handling for home page
      if (isHomePage && isHomeLink) {
        isMatch = true;
      } 
      // Exact match with .html extension
      else if (hrefPagePath === currentPagePath) {
        isMatch = true;
      }
      // Clean URL match (without .html)
      else if (hrefPageClean === currentPageClean && currentPageClean !== '') {
        isMatch = true;
      }
      // Check if this is a page in the pages directory
      else if (currentPath.includes('/pages/') && href.includes('/pages/') && 
              href.split('/pages/')[1] === currentPath.split('/pages/')[1]) {
        isMatch = true;
      }
      // Handle clean URLs from .htaccess rewriting
      else if (currentPath.includes('/' + hrefPageClean) && hrefPageClean !== 'index') {
        isMatch = true;
      }
      
      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Also handle mobile links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (mobileLinks.length) {
      const currentPagePath = currentPath.split('/').pop() || 'index.html';
      const currentPageClean = currentPagePath.replace('.html', '');
      
      mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        const hrefPagePath = href.split('/').pop();
        const hrefPageClean = hrefPagePath.replace('.html', '');
        
        // Enhanced matching logic for mobile links
        let isMatch = false;
        
        // Home page check
        if ((currentPagePath === 'index.html' || currentPath === '/' || currentPath === '/index') && href.endsWith('index.html')) {
          isMatch = true;
        } 
        // Exact match with .html
        else if (hrefPagePath === currentPagePath) {
          isMatch = true;
        }
        // Clean URL match (without .html)
        else if (hrefPageClean === currentPageClean && currentPageClean !== '') {
          isMatch = true;
        }
        // Pages directory check
        else if (currentPath.includes('/pages/') && href.includes('/pages/') && 
                 href.split('/pages/')[1] === currentPath.split('/pages/')[1]) {
          isMatch = true;
        }
        // Handle clean URLs from .htaccess rewriting
        else if (currentPath.includes('/' + hrefPageClean) && hrefPageClean !== 'index') {
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
  
  // Initialize active link - use robust function from main.js if available
  if (typeof setActiveNavigation === 'function') {
    setActiveNavigation();
  } else {
    setActiveNavLink();
  }
  
  // Add smooth appearance animation on page load
  setTimeout(() => {
    navbar.style.opacity = '1';
    navbar.style.transform = 'translateX(-50%) translateY(0)';
  }, 300);
});
