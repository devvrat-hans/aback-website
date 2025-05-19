// Animate sections on scroll for Aback.ai About page
document.addEventListener('DOMContentLoaded', function() {
  // Observe elements for animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all section headers, stat cards and value items
  document.querySelectorAll('.section-header, .stat-card, .team-member, .value-item, .about-text').forEach(el => {
    observer.observe(el);
  });
  
  // Initialize CTA animation
  setTimeout(() => {
    document.querySelector('.cta-content').classList.add('animate-fade-in');
  }, 300);
  
  // Add counter animation for stat values
  document.querySelectorAll('.stat-value').forEach(stat => {
    const targetValue = stat.innerText;
    
    // Check if the text contains a numeric component
    if (/[\d.]+/.test(targetValue)) {
      let value;
      let prefix = '';
      let suffix = '';
      
      // Handle different formats ($XXX, XX%, etc.)
      if (targetValue.includes('%')) {
        value = parseFloat(targetValue);
        suffix = '%';
      } else if (targetValue.includes('$')) {
        value = parseFloat(targetValue.replace('$', '').replace(/,/g, ''));
        prefix = '$';
      } else if (targetValue.includes('M')) {
        value = parseFloat(targetValue.replace('M', ''));
        suffix = 'M+';
      } else if (targetValue.includes('+')) {
        value = parseFloat(targetValue);
        suffix = '+';
      } else {
        value = parseFloat(targetValue);
      }
      
      // Observe the stat card to start animation when visible
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Start at 0 and increment to the target value
            let startValue = 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            function updateCounter(timestamp) {
              const elapsedTime = timestamp - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              
              // Apply easing for smoother animation
              const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing
              
              // Calculate current value based on progress
              const currentValue = Math.floor(easedProgress * value);
              
              // Format the value appropriately
              let displayValue = prefix + currentValue.toLocaleString() + suffix;
              
              // Update the stat value
              stat.innerText = displayValue;
              
              // Continue animation until complete
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                // Ensure the final value matches exactly
                stat.innerText = targetValue;
                counterObserver.unobserve(entry.target);
              }
            }
            
            requestAnimationFrame(updateCounter);
          }
        });
      }, { threshold: 0.5 });
      
      // Start observing the parent stat card
      counterObserver.observe(stat.closest('.stat-card'));
    }
  });
});