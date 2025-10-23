// Portfolio page functionality for Aback.ai
document.addEventListener('DOMContentLoaded', function() {
  
  // Portfolio data
  const portfolioData = [
    {
      id: 1,
      title: "Zero Waste Gujarat",
      category: "business",
      description: "Clean, eco-centric website design emphasizing sustainability and government alignment with AI-based static chatbot for FAQ handling.",
      url: "zerowastegujarat.com",
      image: "/src/assets/images/portfolio/zerowastegujarat.png",
      tags: ["Website", "Chatbot"],
      caseStudyUrl: "#",
      demoUrl: "https://zerowastegujarat.com"
    },
    {
      id: 2,
      title: "CurlSek",
      category: "cybersecurity",
      description: "AI-driven cybersecurity platform offering Penetration Testing as a Service (PTaaS) with corporate-grade website, email automation, and automated database handling for B2B client management.",
      url: "curlsek.netlify.app",
      image: "/src/assets/images/portfolio/curlsek.png",
      tags: ["Website", "Email Automation", "Database Management"],
      caseStudyUrl: "#",
      demoUrl: "https://curlsek.netlify.app"
    },
    {
      id: 3,
      title: "IIT Gandhinagar Research Park",
      category: "education",
      description: "Official institutional platform connecting startups, academia, and industries with professional UI/UX layout, real-time metrics, and partnership stories.",
      url: "iitgnrp-website.netlify.app",
      image: "/src/assets/images/portfolio/iitgn-research-park.png",
      tags: ["Website", "Real-time Metrics", "Collaboration Platform"],
      caseStudyUrl: "#",
      demoUrl: "https://iitgnrp-website.netlify.app"
    },
    {
      id: 4,
      title: "CYGNUS A.D. Management Consulting LLP",
      category: "consulting",
      description: "AI-powered recruitment and communication automation portal with profile matching using ML models, WhatsApp and Email broadcast automation, and resume parsing.",
      url: null,
      image: "/src/assets/images/portfolio/automation-portal.png",
      confidential: true,
      tags: ["Automation Portal", "WhatsApp Automation", "Email Automation", "AI Recruitment"],
      caseStudyUrl: "#",
      demoUrl: "#"
    },
    {
      id: 5,
      title: "Aback Terminal",
      category: "finance",
      description: "Professional financial analytics platform combining finance data analytics and AI for stock analysis, sector exploration, market-impact news curation, and AI-driven sentiment analysis.",
      url: null,
      image: "/src/assets/images/portfolio/aback-terminal.png",
      confidential: true,
      tags: ["Financial Platform", "Stock Analysis", "AI Analytics", "Market Intelligence"],
      caseStudyUrl: "#",
      demoUrl: "#"
    },
    {
      id: 6,
      title: "Fintell Suite (Adani Project)",
      category: "finance",
      description: "AI-based invoice automation with invoice parsing using CV and NLP models, auto-fetch from email, price comparison, and natural language querying capabilities.",
      url: null,
      image: "/src/assets/images/portfolio/fintell-suite.png",
      confidential: true,
      tags: ["Invoice Automation", "AI Parsing", "Email Integration", "Price Comparison"],
      caseStudyUrl: "#",
      demoUrl: "#"
    },
    {
      id: 7,
      title: "Sumacom Consultancy",
      category: "consulting",
      description: "Research consultancy automation platform with website development, email pipeline automation, AI-driven correspondence classification, HR automation, and chemical property analysis AI models.",
      url: "sumacomconsultancy.com",
      image: "/src/assets/images/portfolio/sumacomconsultancy.png",
      tags: ["Website", "Email Automation", "AI Classification", "HR Automation"],
      caseStudyUrl: "#",
      demoUrl: "https://sumacomconsultancy.com"
    },
    {
      id: 8,
      title: "Aback.ai",
      category: "automation",
      description: "Official corporate site featuring AI chatbot integration for lead engagement, workflow management automation, and automated client follow-ups with internal team management dashboard.",
      url: "aback.ai",
      image: "/src/assets/images/portfolio/aback.png",
      tags: ["Website", "AI Chatbot", "Workflow Automation", "Team Dashboard"],
      caseStudyUrl: "#",
      demoUrl: "https://aback.ai"
    },
    {
      id: 9,
      title: "Vardhaman Agencies",
      category: "business",
      description: "Static business website with catalog presentation, static chatbot for customer queries, and optimized layout for offline access and rapid loading.",
      url: "vardhamanagencies.in",
      image: "/src/assets/images/portfolio/vardhamanagencies.png",
      tags: ["Website", "Chatbot", "Optimized Performance"],
      caseStudyUrl: "#",
      demoUrl: "https://vardhamanagencies.in"
    }
  ];

  // DOM elements
  const portfolioGrid = document.querySelector('.portfolio-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const noResults = document.querySelector('.no-results');
  
  // Initialize portfolio
  function initPortfolio() {
    renderPortfolioCards(portfolioData);
    initAnimations();
    initFilterButtons();
    updateFilterCounts();
  }

  // Update filter button counts
  function updateFilterCounts() {
    const tagCounts = {};
    
    // Count projects for each tag
    portfolioData.forEach(project => {
      project.tags.forEach(tag => {
        // Check if tag contains any of our filter keywords
        filterButtons.forEach(button => {
          const filterTag = button.getAttribute('data-filter');
          if (filterTag !== 'all' && tag.includes(filterTag)) {
            tagCounts[filterTag] = (tagCounts[filterTag] || 0) + 1;
          }
        });
      });
    });
    
    // Update filter buttons with counts
    filterButtons.forEach(button => {
      const filterTag = button.getAttribute('data-filter');
      const count = filterTag === 'all' ? portfolioData.length : (tagCounts[filterTag] || 0);
      
      // Add count badge if it doesn't exist
      let countBadge = button.querySelector('.count-badge');
      if (!countBadge) {
        countBadge = document.createElement('span');
        countBadge.className = 'count-badge';
        button.appendChild(countBadge);
      }
      
      countBadge.textContent = count;
    });
  }

  // Render portfolio cards
  function renderPortfolioCards(projects) {
    if (!portfolioGrid) return;
    
    // Add loading state
    portfolioGrid.classList.add('loading');
    
    // Fade out existing cards
    const existingCards = portfolioGrid.querySelectorAll('.portfolio-card');
    existingCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
      }, index * 50);
    });
    
    setTimeout(() => {
      portfolioGrid.innerHTML = '';
      
      if (projects.length === 0) {
        showNoResults();
        portfolioGrid.classList.remove('loading');
        return;
      }
      
      hideNoResults();
      
      projects.forEach((project, index) => {
        const card = createPortfolioCard(project);
        portfolioGrid.appendChild(card);
        
        // Stagger animation with improved timing
        setTimeout(() => {
          card.classList.add('animate-fade-in');
        }, 100 + (50 * index));
      });
      
      portfolioGrid.classList.remove('loading');
    }, 400);
  }

  // Create portfolio card element
  function createPortfolioCard(project) {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.setAttribute('data-category', project.category);
    
    card.innerHTML = `
      <div class="portfolio-image">
        ${project.image ? `<img src="${project.image}" alt="${project.title}" />` : '<div class="portfolio-icon"></div>'}
      </div>
      <div class="portfolio-content">
        <div class="portfolio-category">${getCategoryName(project.category)}</div>
        <h3 class="portfolio-title-card">${project.title}</h3>
        <p class="portfolio-description">${project.description}</p>
        
        <div class="portfolio-tags">
          ${project.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
        </div>
        
        ${project.confidential ? `
        <div class="portfolio-confidential">
          <p>Live demo unavailable due to confidentiality agreements</p>
        </div>
        ` : (project.url || (project.demoUrl && project.demoUrl !== '#') ? `
        <div class="portfolio-cta">
          ${project.url ? `<a href="https://${project.url}" target="_blank" rel="noopener noreferrer" class="view-demo-btn">Live Demo</a>` : (project.demoUrl && project.demoUrl !== '#' ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="view-demo-btn">Live Demo</a>` : '')}
        </div>
        ` : '')}
      </div>
    `;
    
    return card;
  }

  // Get category display name
  function getCategoryName(category) {
    const categoryNames = {
      'all': 'All Projects',
      'finance': 'Finance',
      'consulting': 'Consulting',
      'cybersecurity': 'Cybersecurity',
      'government': 'Government',
      'education': 'Education',
      'automation': 'Automation',
      'business': 'Business'
    };
    return categoryNames[category] || category;
  }

  // Initialize filter buttons
  function initFilterButtons() {
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Prevent double-clicking
        if (button.classList.contains('processing')) return;
        
        const filterTag = button.getAttribute('data-filter');
        
        // Add processing state
        button.classList.add('processing');
        document.querySelector('.filter-buttons').classList.add('loading');
        
        // Filter with delay for smooth animation
        setTimeout(() => {
          filterProjects(filterTag);
          updateActiveFilter(button);
          
          // Remove processing state
          setTimeout(() => {
            button.classList.remove('processing');
            document.querySelector('.filter-buttons').classList.remove('loading');
          }, 200);
        }, 100);
      });
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
      
      // Add focus/blur animations
      button.addEventListener('focus', () => {
        button.style.transform = 'translateY(-2px) scale(1.02)';
      });
      
      button.addEventListener('blur', () => {
        if (!button.classList.contains('active')) {
          button.style.transform = '';
        }
      });
    });
  }

  // Add keyboard navigation for filter buttons
  function initKeyboardNavigation() {
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;
    
    filterContainer.addEventListener('keydown', (e) => {
      const buttons = Array.from(filterButtons);
      const currentIndex = buttons.findIndex(btn => btn === document.activeElement);
      
      let newIndex = currentIndex;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = buttons.length - 1;
          break;
      }
      
      if (newIndex !== currentIndex && buttons[newIndex]) {
        buttons[newIndex].focus();
      }
    });
  }

  // Add screen reader announcements
  function announceFilterChange(filterTag, count) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Showing ${count} ${filterTag === 'all' ? 'projects' : 'projects with ' + filterTag}`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Filter projects by tag
  function filterProjects(filterTag) {
    const filteredData = filterTag === 'all' 
      ? portfolioData 
      : portfolioData.filter(project => {
          // Check if any of the project's tags include the filter tag
          return project.tags.some(tag => tag.includes(filterTag));
        });
    
    // Update URL hash for bookmarking
    if (filterTag !== 'all') {
      window.history.replaceState({}, '', `#${filterTag}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // Announce change for screen readers
    announceFilterChange(filterTag, filteredData.length);
    
    renderPortfolioCards(filteredData);
  }

  // Update active filter button with smooth transition
  function updateActiveFilter(activeButton) {
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.style.transform = '';
    });
    
    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
    activeButton.style.transform = 'translateY(-2px) scale(1.02)';
    
    // Analytics tracking (if needed)
    const filterTag = activeButton.getAttribute('data-filter');
    if (typeof gtag !== 'undefined') {
      gtag('event', 'filter_portfolio', {
        'filter': filterTag,
        'event_category': 'portfolio'
      });
    }
  }

  // Show no results message with animation
  function showNoResults() {
    if (noResults) {
      noResults.style.display = 'block';
      setTimeout(() => {
        noResults.classList.add('show');
      }, 50);
    }
  }

  // Hide no results message
  function hideNoResults() {
    if (noResults) {
      noResults.classList.remove('show');
      setTimeout(() => {
        noResults.style.display = 'none';
      }, 300);
    }
  }

  // Initialize animations
  function initAnimations() {
    // Animate hero section
    const heroContent = document.querySelector('.portfolio-hero-content');
    if (heroContent) {
      setTimeout(() => {
        heroContent.classList.add('animate-fade-in');
      }, 100);
    }

    // Animate filter section
    const filterContainer = document.querySelector('.filter-container');
    if (filterContainer) {
      setTimeout(() => {
        filterContainer.classList.add('animate-fade-in');
      }, 300);
    }

    // Animate CTA section
    const ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
      setTimeout(() => {
        ctaContent.classList.add('animate-fade-in');
      }, 500);
    }
  }

  // Smooth scroll for internal links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Initialize everything
  initPortfolio();
  initSmoothScroll();
  initHashSupport();
  initKeyboardNavigation();
  initKeyboardNavigation();

  // Initialize hash support for direct filter links
  function initHashSupport() {
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Check for hash on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
      const filterButton = document.querySelector(`[data-filter="${hash}"]`);
      if (filterButton) {
        setTimeout(() => {
          filterButton.click();
        }, 500);
      }
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      const hash = window.location.hash.substring(1);
      const filterTag = hash || 'all';
      const filterButton = document.querySelector(`[data-filter="${filterTag}"]`);
      if (filterButton && !filterButton.classList.contains('active')) {
        filterProjects(filterTag);
        updateActiveFilter(filterButton);
      }
    });
  }

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, observerOptions);

  // Observe sections for scroll animations
  document.querySelectorAll('.portfolio-filter, .portfolio-grid-section, .portfolio-cta-section').forEach(section => {
    fadeObserver.observe(section);
  });

  // Image Modal Functionality
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const closeModal = document.querySelector('.modal-close');

  // Add click event to all portfolio images
  document.addEventListener('click', function(e) {
    const portfolioImage = e.target.closest('.portfolio-image');
    if (portfolioImage) {
      const img = portfolioImage.querySelector('img');
      if (img) {
        modal.classList.add('show');
        modalImg.src = img.src;
        modalCaption.innerHTML = img.alt || 'Portfolio Image';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    }
  });

  // Close modal on close button click
  if (closeModal) {
    closeModal.onclick = function() {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  }

  // Close modal on background click
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  }

  // Close modal on Escape key press
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
});
