/**
 * FAQ Section Functionality
 * Handles expanding and collapsing FAQ items
 */
document.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  // Set up click handlers for FAQ items
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Check if this item is already active
      const isActive = item.classList.contains('active');
      
      // Close all other FAQ items first
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // If there are FAQ items, open the first one by default
  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
  }
  
  // Animate FAQ items when they come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-fade-in');
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  // Observe each FAQ item for scroll animation
  faqItems.forEach((item, index) => {
    setTimeout(() => {
      observer.observe(item);
    }, 100 * index);
  });
});
