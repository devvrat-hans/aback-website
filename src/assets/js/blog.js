document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog functionality
    initializeBlog();
    
    function initializeBlog() {
        setupCategoryFiltering();
        setupAnimations();
        setupScrollEffects();
        setupNewsletterForm();
    }
    
    // Category Filtering
    function setupCategoryFiltering() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const blogPosts = document.querySelectorAll('.blog-post');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter posts
                filterPosts(category, blogPosts);
            });
        });
    }
    
    function filterPosts(category, posts) {
        posts.forEach((post, index) => {
            const postCategory = post.getAttribute('data-category');
            const shouldShow = category === 'all' || postCategory === category;
            
            if (shouldShow) {
                post.classList.remove('hidden', 'filtering');
                // Stagger animation
                setTimeout(() => {
                    post.style.opacity = '1';
                    post.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                post.classList.add('filtering');
                post.style.opacity = '0';
                post.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    post.classList.add('hidden');
                }, 300);
            }
        });
        
        // Update grid layout after filtering
        setTimeout(() => {
            updateGridLayout();
        }, 400);
    }
    
    function updateGridLayout() {
        const blogGrid = document.querySelector('.blog-grid');
        const visiblePosts = document.querySelectorAll('.blog-post:not(.hidden)');
        
        // Add animation class to trigger reflow
        blogGrid.style.transform = 'scale(0.98)';
        setTimeout(() => {
            blogGrid.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Animation Setup
    function setupAnimations() {
        const blogPosts = document.querySelectorAll('.blog-post');
        
        // Reset initial states
        blogPosts.forEach((post, index) => {
            post.style.opacity = '0';
            post.style.transform = 'translateY(30px)';
            
            // Animate in sequence
            setTimeout(() => {
                post.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            }, 100 * (index + 1));
        });
        
        // Add hover effects
        setupHoverEffects();
    }
    
    function setupHoverEffects() {
        const blogPosts = document.querySelectorAll('.blog-post:not(.featured-post)');
        
        blogPosts.forEach(post => {
            const postImage = post.querySelector('.post-image img');
            const postTitle = post.querySelector('.post-title');
            
            post.addEventListener('mouseenter', function() {
                if (postImage) {
                    postImage.style.transform = 'scale(1.05)';
                }
                if (postTitle) {
                    postTitle.style.color = 'var(--primary-color)';
                }
            });
            
            post.addEventListener('mouseleave', function() {
                if (postImage) {
                    postImage.style.transform = 'scale(1)';
                }
                if (postTitle) {
                    postTitle.style.color = 'var(--secondary-color)';
                }
            });
        });
    }
    
    // Scroll Effects
    function setupScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add stagger effect for category buttons
                    if (entry.target.classList.contains('blog-categories')) {
                        const buttons = entry.target.querySelectorAll('.category-btn');
                        buttons.forEach((button, index) => {
                            setTimeout(() => {
                                button.style.opacity = '1';
                                button.style.transform = 'translateY(0)';
                            }, index * 100);
                        });
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements
        const elementsToObserve = [
            '.blog-hero-content',
            '.blog-categories',
            '.newsletter-section'
        ];
        
        elementsToObserve.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => observer.observe(el));
        });
        
        // Initialize category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            button.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
        });
    }
    
    // Newsletter Form
    function setupNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('.newsletter-input');
                const submitBtn = this.querySelector('.newsletter-btn');
                const email = emailInput.value.trim();
                
                if (!email) {
                    showNotification('Please enter your email address', 'error');
                    return;
                }
                
                if (!isValidEmail(email)) {
                    showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Simulate form submission
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    showNotification('Thank you for subscribing!', 'success');
                    emailInput.value = '';
                    submitBtn.textContent = 'Subscribe';
                    submitBtn.disabled = false;
                }, 1500);
            });
        }
    }
    
    // Utility Functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            closeNotification(notification);
        }, 5000);
    }
    
    function closeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Search functionality (if needed in the future)
    function setupSearch() {
        const searchInput = document.querySelector('.search-input');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.toLowerCase().trim();
                
                searchTimeout = setTimeout(() => {
                    searchPosts(query);
                }, 300);
            });
        }
    }
    
    function searchPosts(query) {
        const posts = document.querySelectorAll('.blog-post');
        
        posts.forEach(post => {
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
            const category = post.querySelector('.post-category').textContent.toLowerCase();
            
            const matches = title.includes(query) || 
                          excerpt.includes(query) || 
                          category.includes(query);
            
            if (query === '' || matches) {
                post.classList.remove('hidden');
                post.style.opacity = '1';
                post.style.transform = 'translateY(0)';
            } else {
                post.style.opacity = '0';
                post.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    post.classList.add('hidden');
                }, 300);
            }
        });
    }
    
    // Add click handlers for blog posts (if you want them to be clickable)
    function setupPostClickHandlers() {
        const posts = document.querySelectorAll('.blog-post');
        
        posts.forEach(post => {
            post.style.cursor = 'pointer';
            
            post.addEventListener('click', function(e) {
                // Don't trigger if clicking on links or buttons
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                    return;
                }
                
                // Get post data
                const title = this.querySelector('.post-title').textContent;
                const category = this.getAttribute('data-category');
                
                // For now, just show an alert. In a real implementation,
                // you would navigate to the full blog post
                console.log(`Navigate to blog post: ${title} (${category})`);
                
                // You could implement navigation here:
                // window.location.href = `/blog/${postSlug}`;
            });
        });
    }
    
    // Initialize additional features
    setupPostClickHandlers();
    
    // Add loading state management
    function showLoading() {
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.style.opacity = '0.5';
        blogGrid.style.pointerEvents = 'none';
    }
    
    function hideLoading() {
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.style.opacity = '1';
        blogGrid.style.pointerEvents = 'auto';
    }
    
    // Add smooth scrolling for internal links
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
});

// Export functions if needed elsewhere
window.BlogPage = {
    filterPosts: function(category) {
        const posts = document.querySelectorAll('.blog-post');
        const button = document.querySelector(`[data-category="${category}"]`);
        if (button) {
            button.click();
        }
    },
    
    searchPosts: function(query) {
        // Public API for searching posts
        searchPosts(query);
    }
};

// Initialize CTA animation when it comes into view
document.addEventListener('DOMContentLoaded', function() {
    // Initialize CTA animation with IntersectionObserver
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
