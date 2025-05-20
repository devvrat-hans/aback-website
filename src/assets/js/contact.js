// Contact page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log("Contact page script loaded");
  
  // Animate sections on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  // Observe these elements for animation
  document.querySelectorAll('.section-header, .contact-method, .contact-form-container, .map-container').forEach(el => {
    observer.observe(el);
  });
  
  // Initialize CTA animation
  setTimeout(() => {
    document.querySelector('.cta-content').classList.add('animate-fade-in');
  }, 300);
  
  // Form validation and submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple validation
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const subject = document.getElementById('subject');
      const message = document.getElementById('message');
      let isValid = true;
      
      // Basic validation
      if (!name.value.trim()) {
        isValid = false;
        name.classList.add('error');
      } else {
        name.classList.remove('error');
      }
      
      if (!email.value.trim() || !isValidEmail(email.value)) {
        isValid = false;
        email.classList.add('error');
      } else {
        email.classList.remove('error');
      }
      
      if (!subject.value.trim()) {
        isValid = false;
        subject.classList.add('error');
      } else {
        subject.classList.remove('error');
      }
      
      if (!message.value.trim()) {
        isValid = false;
        message.classList.add('error');
      } else {
        message.classList.remove('error');
      }
      
      if (isValid) {
        // Submission logic would go here - for now, just show a success message
        const submitButton = contactForm.querySelector('.submit-button');
        const originalText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        // Simulate sending (in a real app, this would be an actual API call)
        setTimeout(() => {
          contactForm.reset();
          submitButton.innerHTML = 'Message Sent!';
          
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }, 3000);
        }, 1500);
      }
    });
  }
  
  // Email validation helper
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Clear error styling when user begins typing
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('error');
    });
  });
});
