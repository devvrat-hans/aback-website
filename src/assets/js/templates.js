document.addEventListener("DOMContentLoaded", function () {
  console.log("Loading templates...");
  
  // Load navbar
  fetch("../templates/shared/navbar.html")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load navbar: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      console.log("Navbar template loaded successfully");
      document.getElementById("navbar-container").innerHTML = html;
      
      // Initialize navbar functionality after it's loaded
      initNavbar();
    })
    .catch(error => {
      console.error("Error loading navbar:", error);
    });

  // Load footer
  fetch("../templates/shared/footer.html")
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load footer: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      console.log("Footer template loaded successfully");
      document.getElementById("footer-container").innerHTML = html;
    })
    .catch(error => {
      console.error("Error loading footer:", error);
    });
});

// Initialize navbar functionality
function initNavbar() {
  const navbar = document.querySelector('.modern-navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.createElement('div');
  mobileMenu.classList.add('mobile-menu');
  
  // Create mobile menu content
  mobileMenu.innerHTML = createMobileMenuContent();
  document.body.appendChild(mobileMenu);
  
  // Handle menu toggle
  if (menuToggle) {
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
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Set active link based on current page
  setActiveNavLink();
  
  // Close mobile menu on window resize (if desktop size)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Create mobile menu content by copying from navbar
function createMobileMenuContent() {
  const navLinks = document.querySelector('.nav-links');
  const linksHTML = navLinks ? Array.from(navLinks.querySelectorAll('.nav-link')).map(link => {
    const icon = link.querySelector('.nav-link-icon') ? link.querySelector('.nav-link-icon').innerHTML : '';
    const text = link.querySelector('.nav-link-text').textContent;
    const href = link.getAttribute('href');
    
    return `
      <a href="${href}" class="mobile-nav-link">
        <div class="mobile-nav-icon">
          ${icon || ''}
        </div>
        <span>${text}</span>
      </a>
    `;
  }).join('') : '';
  
  return `
    <div class="mobile-nav-links">
      ${linksHTML}
    </div>
    <div class="mobile-auth-buttons">
      <a href="login.html" class="mobile-button mobile-login">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
        Login
      </a>
      <a href="signup.html" class="mobile-button mobile-signup">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
        Sign Up
      </a>
    </div>
  `;
}

// Set active nav link based on current page
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const currentPageName = currentPath.split('/').pop() || 'index.html';
  
  console.log("Current page:", currentPageName);
  
  // Desktop nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkPageName = linkHref.split('/').pop(); // Get just the filename from the href
    
    // Check if current page matches the link's target page
    if (linkPageName === currentPageName || 
        (currentPageName === 'index.html' && (linkPageName === '' || linkHref.endsWith('index.html')))) {
      link.classList.add('active');
      console.log("Set active:", linkHref);
    } else {
      link.classList.remove('active');
    }
  });
  
  // Mobile nav links (after they're created)
  setTimeout(() => {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      const linkPageName = linkHref.split('/').pop();
      
      if (linkPageName === currentPageName || 
          (currentPageName === 'index.html' && (linkPageName === '' || linkHref.endsWith('index.html')))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, 100);
}