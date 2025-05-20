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
      const currentPageDir = currentPath.split('/').slice(-2, -1)[0] || '';
      
      // Get the page name from the href
      const hrefPagePath = href.split('/').pop();
      
      // Check if we're on the homepage
      const isHomePage = currentPath === '/' || currentPath.endsWith('index.html');
      const isHomeLink = href.endsWith('index.html');
      
      // Special handling for pages in folders
      if (isHomePage && isHomeLink) {
        link.classList.add('active');
      } 
      // If the href ends with the current page name
      else if (hrefPagePath === currentPagePath) {
        link.classList.add('active');
      }
      // Check if this is a page in the pages directory
      else if (currentPath.includes('/pages/') && href.includes('/pages/') && 
              href.split('/pages/')[1] === currentPath.split('/pages/')[1]) {
        link.classList.add('active');
      }
      else {
        link.classList.remove('active');
      }
    });
    
    // Also handle mobile links
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    if (mobileLinks.length) {
      const currentPagePath = currentPath.split('/').pop() || 'index.html';
      
      mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        const hrefPagePath = href.split('/').pop();
        
        if ((currentPagePath === 'index.html' || currentPath === '/') && href.endsWith('index.html')) {
          link.classList.add('active');
        } else if (hrefPagePath === currentPagePath) {
          link.classList.add('active');
        } else if (currentPath.includes('/pages/') && href.includes('/pages/') && 
                 href.split('/pages/')[1] === currentPath.split('/pages/')[1]) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
  
  // Initialize active link
  setActiveNavLink();
  
  // Add smooth appearance animation on page load
  setTimeout(() => {
    navbar.style.opacity = '1';
    navbar.style.transform = 'translateX(-50%) translateY(0)';
  }, 300);
});
