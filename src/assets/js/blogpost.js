document.addEventListener('DOMContentLoaded', function() {
    // Initialize blog post functionality
    initializeBlogPost();
    
    function initializeBlogPost() {
        setupReadingProgress();
        setupTableOfContents();
        setupSmoothScrolling();
        setupShareButtons();
        setupAnimations();
        setupImageLightbox();
    }
    
    // Reading Progress Bar
    function setupReadingProgress() {
        const progressBar = document.getElementById('reading-progress');
        if (!progressBar) return;
        
        function updateProgress() {
            const article = document.querySelector('.blog-post-content');
            if (!article) return;
            
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // Calculate progress
            const progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );
            
            progressBar.style.width = (progress * 100) + '%';
        }
        
        // Update progress on scroll
        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial call
    }
    
    // Table of Contents Active Link Tracking
    function setupTableOfContents() {
        const tocLinks = document.querySelectorAll('.table-of-contents a[href^="#"]');
        const sections = document.querySelectorAll('h2[id], h3[id]');
        
        if (tocLinks.length === 0 || sections.length === 0) return;
        
        function updateActiveLink() {
            const scrollTop = window.pageYOffset;
            let activeSection = null;
            
            // Find the current section
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100; // Offset for header
                if (scrollTop >= sectionTop) {
                    activeSection = section;
                }
            });
            
            // Update active link
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (activeSection && link.getAttribute('href') === '#' + activeSection.id) {
                    link.classList.add('active');
                }
            });
        }
        
        // Update active link on scroll
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Initial call
        
        // Smooth scroll for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Smooth Scrolling for All Internal Links
    function setupSmoothScrolling() {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }
    
    // Social Share Buttons
    function setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const platform = this.dataset.platform;
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                const text = encodeURIComponent(document.querySelector('.blog-post-excerpt')?.textContent || '');
                
                let shareUrl = '';
                
                switch (platform) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'linkedin':
                        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    default:
                        return;
                }
                
                // Open share window
                window.open(shareUrl, 'share', 'width=600,height=400,scrollbars=yes,resizable=yes');
            });
        });
        
        // Add copy link functionality
        const copyLinkButton = document.querySelector('.copy-link-button');
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', function() {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    showNotification('Link copied to clipboard!', 'success');
                }).catch(() => {
                    showNotification('Failed to copy link', 'error');
                });
            });
        }
    }
    
    // Animations
    function setupAnimations() {
        // Animate elements on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements for animation
        const elementsToAnimate = [
            '.blog-post-header',
            '.table-of-contents',
            '.highlight-box',
            '.cta-inline',
            '.author-bio',
            '.related-posts'
        ];
        
        elementsToAnimate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => observer.observe(el));
        });
        
        // Stagger animation for content sections
        const contentSections = document.querySelectorAll('.blog-post-content h2, .blog-post-content p, .blog-post-content ul');
        contentSections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Image Lightbox
    function setupImageLightbox() {
        const images = document.querySelectorAll('.blog-post-content img');
        
        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                openLightbox(this.src, this.alt);
            });
        });
    }
    
    function openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${src}" alt="${alt}" />
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        // Add styles
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const image = lightbox.querySelector('img');
        image.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0.5rem;
        `;
        
        document.body.appendChild(lightbox);
        
        // Animate in
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);
        
        // Close functionality
        function closeLightbox() {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(lightbox);
            }, 300);
        }
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
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
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            closeNotification(notification);
        });
        
        setTimeout(() => {
            closeNotification(notification);
        }, 4000);
    }
    
    function closeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Reading Time Estimator
    function calculateReadingTime() {
        const content = document.querySelector('.blog-post-content');
        if (!content) return;
        
        const text = content.textContent || content.innerText;
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(words / wordsPerMinute);
        
        const readingTimeElement = document.querySelector('.reading-time');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} min read`;
        }
    }
    
    // Initialize reading time calculation
    calculateReadingTime();
    
    // Print functionality
    function addPrintStyles() {
        const printStyles = `
            @media print {
                .navbar, .footer, .cta-section, .share-buttons, 
                .table-of-contents, .breadcrumb-nav {
                    display: none !important;
                }
                
                .blog-post-container {
                    box-shadow: none !important;
                    border: none !important;
                }
                
                .blog-post-content {
                    padding: 0 !important;
                }
                
                body {
                    padding-top: 0 !important;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = printStyles;
        document.head.appendChild(style);
    }
    
    addPrintStyles();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Navigate with arrow keys
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const sections = document.querySelectorAll('h2[id]');
            const currentSection = getCurrentSection(sections);
            
            if (currentSection !== -1) {
                let nextSection;
                if (e.key === 'ArrowUp') {
                    nextSection = Math.max(0, currentSection - 1);
                } else {
                    nextSection = Math.min(sections.length - 1, currentSection + 1);
                }
                
                const targetElement = sections[nextSection];
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    function getCurrentSection(sections) {
        const scrollTop = window.pageYOffset;
        for (let i = sections.length - 1; i >= 0; i--) {
            if (scrollTop >= sections[i].offsetTop - 100) {
                return i;
            }
        }
        return 0;
    }
});

// Export utility functions
window.BlogPost = {
    scrollToSection: function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },
    
    sharePost: function(platform) {
        const button = document.querySelector(`[data-platform="${platform}"]`);
        if (button) {
            button.click();
        }
    }
};
