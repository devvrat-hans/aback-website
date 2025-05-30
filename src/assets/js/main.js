// Modern Main JavaScript for Aback.ai website
document.addEventListener("DOMContentLoaded", function() {
  console.log("Main script loaded");

  // Note: templates.js handles loading shared components (navbar, footer, chatbot)
  // We only initialize the main functionality here
  
  // Initialize features after a slight delay to ensure DOM is ready
  setTimeout(() => {
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Set active navigation after navbar is loaded
    setTimeout(() => {
      setActiveNavigation();
    }, 200);
  }, 100);

  // Initialize feature box animations
  initSectionAnimations();

  // Initialize smooth scroll if available
  initSmoothScroll();
});

// Robust function to set active navigation for any hosting environment
function setActiveNavigation() {
  console.log('Setting active navigation...');
  
  // Get current page information
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const currentHash = window.location.hash;
  
  console.log('Current path:', currentPath);
  console.log('Current search:', currentSearch);
  console.log('Current hash:', currentHash);
  
  // Extract the page name from the current URL
  let currentPage = '';
  let currentPageClean = ''; // Clean version without .html
  
  // Check if we're on the home page (multiple variations)
  const isHomePage = currentPath === '/' || 
                     currentPath === '/index' ||
                     currentPath === '/index.html' || 
                     currentPath.endsWith('/index.html') ||
                     currentPath.endsWith('/') ||
                     currentPath.includes('index.html');
  
  if (isHomePage) {
    currentPage = 'index.html';
    currentPageClean = 'index';
  } else {
    // Extract page name from path
    const pathParts = currentPath.split('/');
    const pathPage = pathParts[pathParts.length - 1] || 'index.html';
    
    // Handle cases where path doesn't end with .html (clean URLs from .htaccess)
    if (!pathPage.includes('.html')) {
      currentPageClean = pathPage;
      currentPage = pathPage + '.html';
    } else {
      currentPage = pathPage;
      currentPageClean = pathPage.replace('.html', '');
    }
    
    // Double-check if it matches any of our known pages
    const knownPages = ['services', 'whyus', 'about', 'careers', 'contact', 'privacy', 'terms', 'security', 'ethics-charter'];
    const matchedPage = knownPages.find(page => currentPath.includes(page));
    if (matchedPage) {
      currentPageClean = matchedPage;
      currentPage = matchedPage + '.html';
    }
  }
  
  console.log('Detected current page:', currentPage);
  console.log('Detected current page clean:', currentPageClean);
  
  // Clear all active states first
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  allNavLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Set active states for desktop nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const linkPage = href.split('/').pop() || 'index.html';
    const linkPageClean = linkPage.replace('.html', '');
    
    console.log('Checking link:', href, 'Link page:', linkPage, 'Link page clean:', linkPageClean);
    
    // Enhanced match logic to handle both clean URLs and .html URLs
    let isMatch = false;
    
    // Check for home page matches
    if ((currentPage === 'index.html' || currentPageClean === 'index') && 
        (linkPage === 'index.html' || href.includes('index.html'))) {
      isMatch = true;
    }
    // Check for exact matches (with .html)
    else if (currentPage !== 'index.html' && linkPage === currentPage) {
      isMatch = true;
    }
    // Check for clean URL matches (without .html)
    else if (currentPageClean !== 'index' && linkPageClean === currentPageClean) {
      isMatch = true;
    }
    // Check if current clean page matches link clean page
    else if (currentPageClean && linkPageClean && currentPageClean === linkPageClean) {
      isMatch = true;
    }
    
    if (isMatch) {
      link.classList.add('active');
      console.log('Set active for desktop link:', href);
    }
  });
  
  // Set active states for mobile nav links
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    const linkPage = href.split('/').pop() || 'index.html';
    const linkPageClean = linkPage.replace('.html', '');
    
    // Enhanced match logic to handle both clean URLs and .html URLs
    let isMatch = false;
    
    // Check for home page matches
    if ((currentPage === 'index.html' || currentPageClean === 'index') && 
        (linkPage === 'index.html' || href.includes('index.html'))) {
      isMatch = true;
    }
    // Check for exact matches (with .html)
    else if (currentPage !== 'index.html' && linkPage === currentPage) {
      isMatch = true;
    }
    // Check for clean URL matches (without .html)
    else if (currentPageClean !== 'index' && linkPageClean === currentPageClean) {
      isMatch = true;
    }
    // Check if current clean page matches link clean page
    else if (currentPageClean && linkPageClean && currentPageClean === linkPageClean) {
      isMatch = true;
    }
    
    if (isMatch) {
      link.classList.add('active');
      console.log('Set active for mobile link:', href);
    }
  });
}

// Make the function globally available
window.setActiveNavigation = setActiveNavigation;

// Update navigation when the page changes (for SPAs or hash changes)
window.addEventListener('popstate', function() {
  setTimeout(() => {
    setActiveNavigation();
  }, 100);
});

// Also update when hash changes
window.addEventListener('hashchange', function() {
  setTimeout(() => {
    setActiveNavigation();
  }, 100);
});

// Also run on window load as a fallback
window.addEventListener('load', function() {
  setTimeout(() => {
    console.log('Window loaded, ensuring navigation is set...');
    setActiveNavigation();
  }, 500);
});

// Additional fallback that runs periodically until navigation is properly set
let navigationCheckAttempts = 0;
const maxNavigationCheckAttempts = 10;

function ensureNavigationIsSet() {
  navigationCheckAttempts++;
  
  const activeLinks = document.querySelectorAll('.nav-link.active, .mobile-nav-link.active');
  
  if (activeLinks.length === 0 && navigationCheckAttempts < maxNavigationCheckAttempts) {
    console.log(`Navigation check attempt ${navigationCheckAttempts}: No active links found, retrying...`);
    setActiveNavigation();
    setTimeout(ensureNavigationIsSet, 1000);
  } else if (activeLinks.length > 0) {
    console.log(`Navigation successfully set on attempt ${navigationCheckAttempts}`);
  } else {
    console.log(`Navigation check stopped after ${maxNavigationCheckAttempts} attempts`);
  }
}

// Start the navigation check after DOM is ready
setTimeout(ensureNavigationIsSet, 2000);

// Initialize scroll animations using Intersection Observer API
function initScrollAnimations() {
  // Check if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    // Select all elements with data-animation attribute
    const animatedElements = document.querySelectorAll("[data-animation='fade-in']");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target); // Stop observing once animation is triggered
          }
        });
      },
      {
        root: null, // viewport
        threshold: 0.15, // trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Slightly earlier trigger
      }
    );
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll("[data-animation='fade-in']").forEach(el => {
      el.classList.add("animate-fade-in");
    });
  }
}

// Initialize navbar scroll effect
function initNavbarScroll() {
  const navbar = document.querySelector(".modern-navbar");
  
  // Apply scrolled class on initial load if needed
  if (window.scrollY > 20 && navbar) {
    navbar.classList.add("scrolled");
  }
  
  // Handle scroll events
  window.addEventListener("scroll", function() {
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMiddle = document.querySelector(".nav-middle");
  
  if (menuToggle && navMiddle) {
    menuToggle.addEventListener("click", function(e) {
      e.stopPropagation(); // Prevent event from bubbling up
      navMiddle.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", function(event) {
      if (
        navMiddle.classList.contains("active") &&
        !navMiddle.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        navMiddle.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    });
    
    // Close menu when clicking on nav links on mobile
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", function() {
        if (window.innerWidth < 992) { // Only on mobile
          navMiddle.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      });
    });
  }
}

// Add smooth scroll animation to anchor links
document.addEventListener("click", function(event) {
  const target = event.target.closest('a'); // Support for nested elements inside links
  
  if (target && target.getAttribute("href") && target.getAttribute("href").startsWith("#")) {
    const targetId = target.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      event.preventDefault();
      
      // Calculate offset based on navbar height
      const navbar = document.querySelector(".modern-navbar");
      const offset = navbar ? navbar.offsetHeight + 20 : 80;
      
      window.scrollTo({
        top: targetElement.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: "smooth"
      });
    }
  }
});

// Handle form submissions with improved feedback
const forms = document.querySelectorAll("form");
forms.forEach(form => {
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Simple form validation
    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("error");
        
        // Add error message if it doesn't exist
        let errorMsg = field.parentNode.querySelector(".error-message");
        if (!errorMsg) {
          errorMsg = document.createElement("div");
          errorMsg.className = "error-message";
          errorMsg.textContent = "This field is required";
          field.parentNode.appendChild(errorMsg);
        }
      } else {
        field.classList.remove("error");
        const errorMsg = field.parentNode.querySelector(".error-message");
        if (errorMsg) {
          errorMsg.remove();
        }
      }
    });
    
    if (!isValid) return;
    
    // Collect form data
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    
    console.log("Form submitted with values:", formValues);
    
    // Show submission feedback
    const submitButton = form.querySelector("[type='submit']");
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    
    // Simulate form submission
    setTimeout(() => {
      submitButton.innerHTML = '✓ Success!';
      submitButton.classList.add("success");
      
      // Reset form after delay
      setTimeout(() => {
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.classList.remove("success");
      }, 2000);
    }, 1500);
  });
});

// Remove error styling when user begins typing
document.addEventListener('input', function(event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
    event.target.classList.remove('error');
    const errorMsg = event.target.parentNode.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }
});

// Add parallax effect to hero section for enhanced visual appeal
function initParallax() {
  const hero = document.querySelector('.hero');
  
  if (hero && window.innerWidth > 768) { // Only on desktop
    window.addEventListener('scroll', function() {
      const scrollPosition = window.pageYOffset;
      const speed = 0.5;
      
      // Apply parallax effect to hero background
      hero.style.backgroundPosition = `50% ${scrollPosition * speed}px`;
    });
  }
}

// Initialize parallax effect
initParallax();

// Initialize animations for all sections
function initSectionAnimations() {
  // Initialize section headers visibility
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(header => {
    header.style.opacity = '1';
    header.style.visibility = 'visible';
    header.style.display = 'block';
  });
  
  // Add animation class to feature boxes with delay
  const featureBoxes = document.querySelectorAll('.feature-box');
  featureBoxes.forEach((box, index) => {
    setTimeout(() => {
      box.classList.add('animate-fade-in');
    }, 100 + (index * 100)); // Staggered timing
  });

  // Agent card animations removed

  // Add animation to CTA content
  const ctaContent = document.querySelector('.cta-content');
  if (ctaContent) {
    setTimeout(() => {
      ctaContent.classList.add('animate-fade-in');
    }, 300);
  }
}

// Initialize smooth scrolling
function initSmoothScroll() {
  // Check if LocomotiveScroll is available
  if (typeof LocomotiveScroll !== 'undefined') {
    const scroll = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true,
      smoothMobile: false,
      inertia: 0.7
    });

    // Store scroll instance globally
    window.scroll = scroll;

    // Update scroll on window resize
    window.addEventListener('resize', () => {
      scroll.update();
    });

    // Handle smooth scroll to section when clicking anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          scroll.scrollTo(targetElement);
        }
      });
    });
  } else {
    // Fallback to basic smooth scroll if library isn't available
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}