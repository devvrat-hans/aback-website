// Careers Page Script
document.addEventListener('DOMContentLoaded', function() {
  // Show animations when content is loaded
  showAnimations();
  
  // Setup filter functionality for departments
  setupPositionFilters();
});

// Function to show animations with slight delay
function showAnimations() {
  // Animate hero content
  setTimeout(() => {
    document.querySelector('.careers-hero-content').classList.add('animate-fade-in');
  }, 100);
  
  // Animate benefit cards with staggered delay
  const benefitCards = document.querySelectorAll('.benefit-card');
  benefitCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = 1;
    }, 300 + (index * 100));
  });
  
  // Animate position cards with staggered delay
  const positionCards = document.querySelectorAll('.position-card');
  positionCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = 1;
    }, 500 + (index * 100));
  });
  
  // Initialize scroll animations
  initScrollAnimations();
}

// Function to set up position filters by department
function setupPositionFilters() {
  const filterButtons = document.querySelectorAll('.positions-filters .filter-btn');
  const positions = document.querySelectorAll('.position-card');
  const noJobsMessage = document.querySelector('.no-jobs-message');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Get selected department
      const selectedDepartment = this.getAttribute('data-department');
      
      // Count visible positions
      let visibleCount = 0;
      
      // Filter positions
      positions.forEach(position => {
        const positionDepartment = position.getAttribute('data-department');
        
        if (selectedDepartment === 'all' || selectedDepartment === positionDepartment) {
          position.style.display = 'flex';
          visibleCount++;
        } else {
          position.style.display = 'none';
        }
      });
      
      // Show "no jobs" message if no positions are visible
      if (noJobsMessage) {
        if (visibleCount === 0) {
          noJobsMessage.style.display = 'block';
        } else {
          noJobsMessage.style.display = 'none';
        }
      }
    });
  });
}

// Function to initialize scroll animations
function initScrollAnimations() {
  // Create an intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  
  // Observe elements that should animate on scroll
  document.querySelectorAll('.section-header').forEach(el => {
    observer.observe(el);
  });
  
  document.querySelectorAll('.cta-content').forEach(el => {
    observer.observe(el);
  });
}