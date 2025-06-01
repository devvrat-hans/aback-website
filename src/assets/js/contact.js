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
        // Submit form via AJAX
        submitContactForm({
          name: name.value.trim(),
          email: email.value.trim(),
          subject: subject.value.trim(),
          message: message.value.trim()
        });
      }
    });
  }
  
  // Email validation helper
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // Submit form function
  function submitContactForm(formData) {
    const submitButton = contactForm.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending...';
    
    // Send AJAX request
    fetch('/api/contact-form.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Success
        contactForm.reset();
        submitButton.innerHTML = 'Message Sent!';
        showNotification(data.message, 'success');
        
        // Reset button after 3 seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }, 3000);
      } else {
        // Error
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        showNotification(data.message, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
      showNotification('Sorry, there was an error sending your message. Please try again later.', 'error');
    });
  }
  
  // Show notification function
  function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }
  
  // Clear error styling when user begins typing
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('error');
    });
  });
});
