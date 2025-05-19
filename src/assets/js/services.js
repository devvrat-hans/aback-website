document.addEventListener("DOMContentLoaded", function() {
  // Reference to all service solution cards
  const agentCards = document.querySelectorAll('.agent-card');
  const agentCountDisplay = document.getElementById('agent-count-display');
  const searchInput = document.querySelector('.agents-search-input');
  const searchButton = document.querySelector('.agents-search-button');
  const sectionHeaders = document.querySelectorAll('.section-header');
  const ctaContent = document.querySelector('.cta-content');
  
  // Set initial agent count
  if (agentCountDisplay) {
    agentCountDisplay.textContent = agentCards.length;
  }
  
  // Create a no-results message element if it doesn't already exist
  let noResults = document.querySelector('.no-results');
  if (!noResults) {
    noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No automation solutions found matching your search. Try different keywords.';
    document.querySelector('.agents-grid')?.appendChild(noResults);
  }
  
  // Initialize section animations
  function initAnimations() {
    // Animate section headers
    sectionHeaders.forEach(header => {
      header.classList.add('animate-fade-in');
    });
    
    // Animate agent cards with staggered delay
    agentCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
      }, 100 * index);
    });
    
    // Animate CTA section
    if (ctaContent) {
      setTimeout(() => {
        ctaContent.classList.add('animate-fade-in');
      }, 300);
    }
  }
  
  // Call animation initialization
  initAnimations();
  
  // Search functionality
  function searchAgents(query) {
    query = query.toLowerCase().trim();
    let matchCount = 0;
    
    agentCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      const features = Array.from(card.querySelectorAll('.agent-features li'))
                           .map(li => li.textContent.toLowerCase())
                           .join(' ');
      const category = card.getAttribute('data-category').toLowerCase();
      
      if (title.includes(query) || description.includes(query) || features.includes(query) || category.includes(query)) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
        matchCount++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
    
    // Show no results message if needed
    if (matchCount === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
    
    // Update count display
    if (agentCountDisplay) {
      agentCountDisplay.textContent = matchCount;
    }
    
    // Reset category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
  }
  
  // Search event listeners
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      searchAgents(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchAgents(this.value);
      }
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('input', function() {
      if (this.value === '') {
        document.querySelector('.filter-btn[data-category="all"]').click();
      }
    });
  }
  
  // Filter functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Initialize filter
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      let visibleCount = 0;
      
      // Filter the agent cards
      agentCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || category === cardCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
          visibleCount++;
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
      
      // Update count display
      if (agentCountDisplay) {
        agentCountDisplay.textContent = visibleCount;
      }
      
      // Show/hide no results message
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    });
  });
  
  // Enhanced hover effect for agent cards
  agentCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
  
  // Handle hash links for direct category filtering
  function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    if (hash) {
      const categoryButton = document.querySelector(`.filter-btn[data-category="${hash}"]`);
      if (categoryButton) {
        categoryButton.click();
      }
    }
  }
  
  // Run on page load
  handleHashChange();
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);
});