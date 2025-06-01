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
        // Create mailto link and open email client
        openEmailClient({
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
  
  // Open email client function
  function openEmailClient(formData) {
    const submitButton = contactForm.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    
    // Create email body
    const emailBody = `Hi Aback.ai Team,

${formData.message}

---
Best regards,
${formData.name}
${formData.email}`;

    // Create mailto URL
    const mailtoUrl = `mailto:contact@aback.ai?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Show loading state briefly
    submitButton.disabled = true;
    submitButton.innerHTML = 'Opening Email...';
    
    // Open email client
    window.location.href = mailtoUrl;
    
    // Reset button and show success message after a short delay
    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Email Opened!';
      showNotification('Your email client has been opened with the pre-filled message. Please send the email from your email client.', 'success');
      
      // Reset form and button after showing success
      setTimeout(() => {
        contactForm.reset();
        submitButton.innerHTML = originalText;
      }, 3000);
    }, 1000);
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
    
    // Auto-hide after 8 seconds (longer for the mailto instruction)
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 8000);
    
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
