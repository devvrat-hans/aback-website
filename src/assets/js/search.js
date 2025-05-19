document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.querySelector('.hero-search-input');
  const searchButton = document.querySelector('.hero-search-button');
  const suggestions = document.querySelectorAll('.suggestion');
  
  // Handle search button click
  searchButton.addEventListener('click', function() {
    performSearch(searchInput.value);
  });
  
  // Handle enter key press in search input
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });
  
  // Handle suggestion clicks
  suggestions.forEach(suggestion => {
    suggestion.addEventListener('click', function() {
      searchInput.value = this.textContent;
      performSearch(this.textContent);
    });
  });
  
  // Add hover effect to search button
  searchButton.addEventListener('mouseover', function() {
    this.style.transform = 'translateY(-50%) scale(1.05)';
  });
  
  searchButton.addEventListener('mouseout', function() {
    this.style.transform = 'translateY(-50%)';
  });
  
  // Search function (replace with actual search implementation)
  function performSearch(query) {
    if (!query.trim()) return;
    
    console.log("Searching for:", query);
    // Here you would implement actual search functionality
    // For example, redirect to search results page:
    // window.location.href = `/search?q=${encodeURIComponent(query)}`;
    
    // For now, show an alert
    alert(`Searching for "${query}" - This would navigate to search results in a production site.`);
  }
});