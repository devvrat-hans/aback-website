// Terms of Service Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for table of contents links
  const tocLinks = document.querySelectorAll('.toc-list a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Scroll to the target element with smooth behavior
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for fixed header
          behavior: 'smooth'
        });
        
        // Update URL without causing page reload
        history.pushState(null, null, targetId);
      }
    });
  });

  // Highlight current section in TOC
  const highlightCurrentSection = () => {
    const sections = document.querySelectorAll('.terms-section');
    const scrollPosition = window.scrollY;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        const currentId = section.getAttribute('id');
        
        // Remove active class from all links
        tocLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current link
        const activeLink = document.querySelector(`.toc-list a[href="#${currentId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  };
  
  // Initialize active section highlight
  highlightCurrentSection();
  
  // Update on scroll
  window.addEventListener('scroll', highlightCurrentSection);
  
  // Add CSS for active link
  const style = document.createElement('style');
  style.textContent = `
    .toc-list a.active {
      color: var(--primary-color);
      background: rgba(0, 102, 204, 0.05);
      padding-left: 0.5rem;
      font-weight: 500;
      border-left: 3px solid var(--primary-color);
    }
  `;
  document.head.appendChild(style);
  
  // Initialize CTA animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  const ctaContent = document.querySelector('.cta-content');
  if (ctaContent) {
    observer.observe(ctaContent);
  }
});