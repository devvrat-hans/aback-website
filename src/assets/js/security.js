// Security Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for TOC links
  const tocLinks = document.querySelectorAll('.toc-list a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Smooth scroll to the target section
        window.scrollTo({
          top: targetElement.offsetTop - 100, // Offset for header/navbar
          behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
  
  // Highlight current section in TOC based on scroll position
  const securitySections = document.querySelectorAll('.security-section');
  
  function highlightCurrentSection() {
    let currentSectionId = '';
    
    securitySections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = '#' + section.id;
      }
    });
    
    // Update active class in TOC
    tocLinks.forEach(link => {
      if (link.getAttribute('href') === currentSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Initial highlight check
  highlightCurrentSection();
  
  // Update highlight on scroll
  window.addEventListener('scroll', highlightCurrentSection);
  
  // Animate content elements when they come into view
  const animateOnScroll = function() {
    const sections = document.querySelectorAll('.security-section, .security-mission, .security-note');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
      observer.observe(section);
    });
  };
  
  // Initialize animations
  animateOnScroll();
  
  // Make TOC sticky on scroll
  const tocElement = document.querySelector('.security-toc');
  const contentSection = document.querySelector('.security-content');
  
  if (tocElement && contentSection) {
    const tocOffsetTop = tocElement.offsetTop;
    
    function updateTocPosition() {
      const scrollPosition = window.scrollY;
      const contentBottom = contentSection.offsetTop + contentSection.offsetHeight;
      
      if (scrollPosition > tocOffsetTop - 100) {
        tocElement.classList.add('sticky');
        
        // Prevent TOC from going beyond the content section
        if (scrollPosition + tocElement.offsetHeight + 100 > contentBottom) {
          tocElement.style.top = (contentBottom - tocElement.offsetHeight - scrollPosition) + 'px';
        } else {
          tocElement.style.top = '100px';
        }
      } else {
        tocElement.classList.remove('sticky');
        tocElement.style.top = 'auto';
      }
    }
    
    // Initial position check
    updateTocPosition();
    
    // Update position on scroll
    window.addEventListener('scroll', updateTocPosition);
  }
});