// Main JavaScript file for Lineo Finance website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initCurrentPageIndicator();
    initMobileMenu();
    // initFormValidation(); // Disabled - handled by forms.js
    initLazyLoading();
    initSmoothScroll();
    initFAQ();
    initHeroCarousel();
    initBrokerCarousel();
    initHeaderScroll();
});

// Current Page Indicator
function initCurrentPageIndicator() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        // Get the href attribute
        const linkPath = link.getAttribute('href');
        
        // Skip if it's the CTA button
        if (link.classList.contains('btn-nav-cta')) {
            return;
        }
        
        // Check if current page matches the link
        // Special handling for homepage
        if (currentPath === '/' || currentPath === '/index.html') {
            // Don't underline home link on homepage
            if (linkPath === '/') {
                link.classList.remove('current-page');
            }
        } else {
            // For other pages, check if the current path includes the link path
            // This handles both exact matches and subpages
            if (linkPath !== '/' && currentPath.includes(linkPath.replace(/\/$/, ''))) {
                link.classList.add('current-page');
            } else {
                link.classList.remove('current-page');
            }
        }
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    
    if (toggle && menu) {
        // Set initial ARIA attributes
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'nav-menu');
        menu.setAttribute('id', 'nav-menu');
        
        // Function to toggle menu
        function toggleMenu() {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Update aria-expanded attribute
            const isExpanded = toggle.classList.contains('active');
            toggle.setAttribute('aria-expanded', isExpanded);
            
            // Focus management for keyboard users
            if (isExpanded) {
                // Focus first menu item when opened
                const firstMenuItem = menu.querySelector('a');
                if (firstMenuItem) {
                    firstMenuItem.focus();
                }
            } else {
                // Return focus to toggle button when closed
                toggle.focus();
            }
        }
        
        // Handle click events
        toggle.addEventListener('click', toggleMenu);
        
        // Handle keyboard events (Enter and Space)
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus(); // Return focus to toggle button
            }
        });
        
        // Trap focus within menu when open (for keyboard navigation)
        menu.addEventListener('keydown', function(e) {
            if (!menu.classList.contains('active')) return;
            
            const focusableElements = menu.querySelectorAll('a, button');
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            const errorFields = form.querySelectorAll('.error');
            errorFields.forEach(field => field.classList.remove('error'));
            
            // Get all required fields
            const required = form.querySelectorAll('[required]');
            let isValid = true;
            let firstErrorField = null;
            
            required.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Track first error field for focus
                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                    
                    // Add error message
                    showFieldError(field);
                } else {
                    field.classList.remove('error');
                    clearFieldError(field);
                }
            });
            
            // Validate email fields
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
                    
                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                }
            });
            
            // Validate phone fields
            const phoneFields = form.querySelectorAll('input[type="tel"]');
            phoneFields.forEach(field => {
                if (field.value && !isValidPhone(field.value)) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
                    
                    if (!firstErrorField) {
                        firstErrorField = field;
                    }
                }
            });
            
            if (isValid) {
                // Success - would normally submit form here
                // Form submitted successfully
                showSuccessMessage(form);
                
                // Reset form after successful submission
                setTimeout(() => {
                    form.reset();
                    hideSuccessMessage(form);
                }, 3000);
            } else {
                // Focus on first error field
                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        });
        
        // Real-time validation on blur
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') || this.value) {
                    if (validateField(this)) {
                        this.classList.remove('error');
                        clearFieldError(this);
                    }
                }
            });
        });
    });
}

function validateField(field) {
    // Check if field is empty
    if (!field.value.trim()) {
        return false;
    }
    
    // Check specific field types
    if (field.type === 'email') {
        return isValidEmail(field.value);
    }
    
    if (field.type === 'tel' && field.value) {
        return isValidPhone(field.value);
    }
    
    if (field.type === 'checkbox') {
        return field.checked;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove spaces and dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Check if it's a valid phone number (basic validation)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(cleanPhone);
}

function showFieldError(field, customMessage) {
    // Remove any existing error message
    clearFieldError(field);
    
    // Create error message element
    const errorMsg = document.createElement('span');
    errorMsg.className = 'error-message';
    errorMsg.textContent = customMessage || 'Dieses Feld ist erforderlich';
    
    // Insert after the field
    field.parentNode.insertBefore(errorMsg, field.nextSibling);
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showSuccessMessage(form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.';
    form.appendChild(successMsg);
}

function hideSuccessMessage(form) {
    const successMsg = form.querySelector('.success-message');
    if (successMsg) {
        successMsg.remove();
    }
}

// Lazy Loading Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('lazy-loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Smooth Scroll for internal links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just '#'
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash
                history.pushState(null, null, href);
            }
        });
    });
}

// FAQ Accordion Enhancement
function initFAQ() {
    // Enhance the native details element animation
    const faqItems = document.querySelectorAll('.faq-accordion__item');
    
    faqItems.forEach(item => {
        const summary = item.querySelector('.faq-accordion__header');
        const content = item.querySelector('.faq-accordion__content');
        const inner = item.querySelector('.faq-accordion__inner');
        
        if (summary && content && inner) {
            // Set initial state
            if (item.hasAttribute('open')) {
                content.style.maxHeight = inner.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
            
            // Override the default behavior to control animation timing
            summary.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (item.hasAttribute('open')) {
                    // Closing animation
                    // First set the max-height to current height for smooth transition
                    content.style.maxHeight = inner.scrollHeight + 'px';
                    // Force reflow
                    content.offsetHeight;
                    // Now animate to 0
                    content.style.maxHeight = '0';
                    
                    // Remove open attribute after animation completes
                    content.addEventListener('transitionend', function handler() {
                        item.removeAttribute('open');
                        content.removeEventListener('transitionend', handler);
                    });
                } else {
                    // Close other items first (with animation)
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.hasAttribute('open')) {
                            const otherContent = otherItem.querySelector('.faq-accordion__content');
                            const otherInner = otherItem.querySelector('.faq-accordion__inner');
                            if (otherContent && otherInner) {
                                otherContent.style.maxHeight = otherInner.scrollHeight + 'px';
                                otherContent.offsetHeight;
                                otherContent.style.maxHeight = '0';
                                
                                otherContent.addEventListener('transitionend', function handler() {
                                    otherItem.removeAttribute('open');
                                    otherContent.removeEventListener('transitionend', handler);
                                });
                            }
                        }
                    });
                    
                    // Opening animation
                    item.setAttribute('open', '');
                    content.style.maxHeight = '0';
                    // Force reflow
                    content.offsetHeight;
                    // Animate to full height
                    content.style.maxHeight = inner.scrollHeight + 'px';
                }
            });
        }
    });
    
    // Optional: Add support for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        faqItems.forEach(item => {
            const content = item.querySelector('.faq-accordion__content');
            if (content) {
                content.style.transition = 'none';
            }
        });
    }
}

// Scroll-based animations
window.addEventListener('scroll', function() {
    // Add class to header when scrolling
    const header = document.querySelector('.site-header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Reveal elements on scroll
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
});

// Performance monitoring (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', function() {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        // Page Load Time logged for monitoring
    });
}

// Hero Carousel Functionality
function initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    let currentSlide = 0;
    let autoPlayInterval;
    const slideCount = slides.length;
    const autoPlayDelay = 4000; // 4 seconds
    let isTransitioning = false;
    
    // Clone first and last slides for endless effect
    const firstSlideClone = slides[0].cloneNode(true);
    const lastSlideClone = slides[slideCount - 1].cloneNode(true);
    
    // Add clones to track
    track.appendChild(firstSlideClone);
    track.insertBefore(lastSlideClone, slides[0]);
    
    // Start at position 1 (which is the original first slide)
    currentSlide = 1;
    track.style.transform = `translateX(-100%)`;
    
    // Update carousel position with endless loop
    function updateCarousel(animate = true) {
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        const offset = -currentSlide * 100;
        track.style.transform = `translateX(${offset}%)`;
        
        // Update indicators based on actual slide index
        const actualSlide = (currentSlide - 1 + slideCount) % slideCount;
        indicators.forEach((indicator, index) => {
            if (index === actualSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // Handle endless loop transitions
        if (animate) {
            isTransitioning = true;
            setTimeout(() => {
                isTransitioning = false;
                if (currentSlide === 0) {
                    // Jumped to clone of last slide, reset to actual last
                    currentSlide = slideCount;
                    updateCarousel(false);
                } else if (currentSlide === slideCount + 1) {
                    // Jumped to clone of first slide, reset to actual first
                    currentSlide = 1;
                    updateCarousel(false);
                }
            }, 500);
        }
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        if (isTransitioning) return;
        currentSlide = slideIndex + 1; // Adjust for clone
        updateCarousel();
        resetAutoPlay();
    }
    
    // Next slide (always goes left)
    function nextSlide() {
        if (isTransitioning) return;
        currentSlide++;
        updateCarousel();
    }
    
    // Previous slide
    function prevSlide() {
        if (isTransitioning) return;
        currentSlide--;
        updateCarousel();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, autoPlayDelay);
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    // Indicator clicks with debounce protection
    let lastClickTime = 0;
    const clickDebounce = 300; // Minimum time between clicks in ms
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastClickTime < clickDebounce) {
                return; // Ignore rapid clicks
            }
            lastClickTime = now;
            goToSlide(index);
        });
    });
    
    // Pause on hover
    const carouselContainer = track.closest('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.closest('.hero-carousel')) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        }
    });
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide(); // Swipe left
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide(); // Swipe right
        }
    }
    
    // Initialize
    updateCarousel(false); // No animation on initial load
    // Start autoplay after a delay to prevent immediate transition
    setTimeout(() => {
        startAutoPlay();
    }, 1000);
    
    // Pause auto-play when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

// Broker Carousel Functionality
function initBrokerCarousel() {
    const track = document.getElementById('brokerCarouselTrack');
    if (!track) return;
    
    // Initialize carousel with shared carousel logic
    initCarousel({
        trackId: 'brokerCarouselTrack',
        indicatorSelector: '.broker-carousel .carousel-indicator',
        prevBtnSelector: '.broker-carousel .carousel-nav.prev',
        nextBtnSelector: '.broker-carousel .carousel-nav.next',
        containerSelector: '.broker-carousel .carousel-container',
        autoPlayDelay: 4000,
        slidesPerView: {
            mobile: 1,
            tablet: 3,
            desktop: 3
        }
    });
}

// Generic Carousel Initialization
function initCarousel(config) {
    const track = document.getElementById(config.trackId);
    if (!track) return;
    
    const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
    const indicators = document.querySelectorAll(config.indicatorSelector);
    const prevBtn = document.querySelector(config.prevBtnSelector);
    const nextBtn = document.querySelector(config.nextBtnSelector);
    const container = document.querySelector(config.containerSelector);
    
    let currentSlide = 0;
    let autoPlayInterval;
    const slideCount = originalSlides.length;
    const autoPlayDelay = config.autoPlayDelay || 4000;
    let isTransitioning = false;
    
    // Determine slides per view based on screen size
    function getSlidesPerView() {
        if (window.innerWidth >= 1024) {
            return config.slidesPerView?.desktop || 1;
        } else if (window.innerWidth >= 768) {
            return config.slidesPerView?.tablet || 1;
        }
        return config.slidesPerView?.mobile || 1;
    }
    
    let slidesPerView = getSlidesPerView();
    
    // For endless carousel with multiple slides visible
    // Clone slides before and after for seamless looping
    if (slidesPerView > 1) {
        // Clone slides for endless effect
        // We need to clone enough slides to fill the viewport on both sides
        for (let i = 0; i < slidesPerView; i++) {
            const cloneBefore = originalSlides[slideCount - slidesPerView + i].cloneNode(true);
            const cloneAfter = originalSlides[i].cloneNode(true);
            cloneBefore.classList.add('clone');
            cloneAfter.classList.add('clone');
            track.insertBefore(cloneBefore, originalSlides[0]);
            track.appendChild(cloneAfter);
        }
        
        // Start at the first real slide (after clones)
        currentSlide = slidesPerView;
    }
    
    const allSlides = track.querySelectorAll('.carousel-slide');
    
    // Update carousel position
    function updateCarousel(animate = true, updateIndicators = true) {
        // Set transitioning flag immediately when animating
        if (animate) {
            isTransitioning = true;
        }
        
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // Calculate offset for single-slide movement
        const slideWidth = 100 / slidesPerView;
        const offset = -currentSlide * slideWidth;
        track.style.transform = `translateX(${offset}%)`;
        
        // Update indicators based on actual position (skip during position reset)
        if (updateIndicators && indicators.length > 0) {
            const actualIndex = slidesPerView > 1 ? 
                ((currentSlide - slidesPerView) % slideCount + slideCount) % slideCount :
                currentSlide % slideCount;
            
            // Update indicators - ensure exactly one is active
            indicators.forEach((indicator, index) => {
                if (index === actualIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
        
        // Handle endless loop transitions
        if (animate && slidesPerView > 1) {
            // Use a flag to prevent multiple event listeners
            let transitionHandled = false;
            
            const handleTransition = (e) => {
                // Only handle transform transitions
                if (e.propertyName !== 'transform' || transitionHandled) return;
                transitionHandled = true;
                
                track.removeEventListener('transitionend', handleTransition);
                
                // Reset position if we're at a clone
                if (currentSlide < slidesPerView) {
                    track.style.transition = 'none';
                    currentSlide = currentSlide + slideCount;
                    const slideWidth = 100 / slidesPerView;
                    const offset = -currentSlide * slideWidth;
                    track.style.transform = `translateX(${offset}%)`;
                    // Force reflow
                    void track.offsetHeight;
                    track.style.transition = '';
                } else if (currentSlide >= slideCount + slidesPerView) {
                    track.style.transition = 'none';
                    currentSlide = currentSlide - slideCount;
                    const slideWidth = 100 / slidesPerView;
                    const offset = -currentSlide * slideWidth;
                    track.style.transform = `translateX(${offset}%)`;
                    // Force reflow
                    void track.offsetHeight;
                    track.style.transition = '';
                }
                
                isTransitioning = false;
            };
            
            track.addEventListener('transitionend', handleTransition);
            
            // Fallback in case transitionend doesn't fire
            setTimeout(() => {
                if (isTransitioning) {
                    track.removeEventListener('transitionend', handleTransition);
                    isTransitioning = false;
                }
            }, 600);
        } else if (animate) {
            // For single-slide carousels or non-animated updates
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        } else {
            // No animation, reset flag immediately
            isTransitioning = false;
        }
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        if (isTransitioning) return;
        // When clicking indicators, go to the actual slide position
        currentSlide = slidesPerView > 1 ? slideIndex + slidesPerView : slideIndex;
        updateCarousel();
        resetAutoPlay();
    }
    
    // Next slide
    function nextSlide() {
        if (isTransitioning) return;
        currentSlide++;
        updateCarousel();
    }
    
    // Previous slide
    function prevSlide() {
        if (isTransitioning) return;
        currentSlide--;
        updateCarousel();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            if (!isTransitioning) {
                nextSlide();
            }
        }, autoPlayDelay);
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }
    
    // Indicator clicks with debounce protection
    let lastClickTime = 0;
    const clickDebounce = 300; // Minimum time between clicks in ms
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            const now = Date.now();
            if (now - lastClickTime < clickDebounce) {
                return; // Ignore rapid clicks
            }
            lastClickTime = now;
            goToSlide(index);
        });
    });
    
    // Pause on hover
    if (container) {
        container.addEventListener('mouseenter', stopAutoPlay);
        container.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== slidesPerView) {
            // For now, just reload the page on resize to rebuild the carousel
            // A more sophisticated approach would rebuild the clones
            location.reload();
        }
    });
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide();
            resetAutoPlay();
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide();
            resetAutoPlay();
        }
    }
    
    // Initialize
    updateCarousel(false);
    setTimeout(() => {
        startAutoPlay();
    }, 1000);
    
    // Pause auto-play when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}

// Header Scroll Effects
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    const logo = document.querySelector('.logo img');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateHeader() {
        const scrollY = window.scrollY;
        
        // Add/remove scrolled class
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Progressive logo scaling (optional - for even smoother effect)
        // We're not using CSS transform scaling anymore since we're changing actual height
        // The CSS transition handles the smooth animation
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Logo hover is handled by CSS, no need for JS intervention
    
    // Initial check
    updateHeader();
}

// Google Analytics 4 Custom Event Tracking
// Only tracks events if GA4 is loaded (user consented to cookies)

/**
 * Track contact form submissions - KEY CONVERSION
 * @param {string} formType - Type of form (contact, callback, demo)
 * @param {string} source - Form location (footer, contact-page, modal)
 */
function trackFormSubmission(formType, source = 'unknown') {
    if (typeof gtag === 'function') {
        gtag('event', 'form_submit', {
            'form_type': formType,
            'form_source': source,
            'page_location': window.location.href,
            'page_title': document.title
        });
        
        // Mark as conversion for business-critical forms
        if (formType === 'contact' || formType === 'demo' || formType === 'callback') {
            gtag('event', 'generate_lead', {
                'form_type': formType,
                'value': 1,
                'currency': 'EUR'
            });
        }
    }
}

/**
 * Track job application engagement - CONVERSION
 * @param {string} jobTitle - Job position title
 * @param {string} action - Action taken (view, apply_click, download_pdf)
 */
function trackJobEngagement(jobTitle, action = 'view') {
    if (typeof gtag === 'function') {
        gtag('event', 'job_engagement', {
            'job_title': jobTitle,
            'engagement_type': action,
            'page_location': window.location.href
        });
        
        // Mark actual applications as conversions
        if (action === 'apply_click' || action === 'application_submit') {
            gtag('event', 'job_application', {
                'job_title': jobTitle,
                'value': 1,
                'currency': 'EUR'
            });
        }
    }
}

/**
 * Track knowledge base usage - SUPPORT METRIC (not conversion)
 * For existing customers accessing help content
 * @param {string} articleTitle - Knowledge base article title
 * @param {string} category - Article category (setup, troubleshooting, etc.)
 */
function trackKnowledgeBaseUsage(articleTitle, category = 'general') {
    if (typeof gtag === 'function') {
        // Set user property for audience creation
        gtag('set', {
            'custom_map': {
                'dimension1': 'customer_type'
            }
        });
        
        gtag('config', 'G-QYZZ8CW3N0', {
            'custom_map': {
                'dimension1': 'customer_type'
            }
        });
        
        // Track knowledge base usage with customer segmentation
        gtag('event', 'knowledge_base_read', {
            'article_title': articleTitle,
            'article_category': category,
            'page_location': window.location.href,
            'customer_type': 'existing_customer',
            'user_segment': 'customer_support',
            'session_source': getSessionSource()
        });
        
        // Set user property to identify customer
        gtag('event', 'set_user_properties', {
            'customer_type': 'existing_customer',
            'last_kb_access': new Date().toISOString().split('T')[0]
        });
        
        // Track engagement depth
        setTimeout(() => {
            gtag('event', 'knowledge_base_engaged', {
                'article_title': articleTitle,
                'time_on_page': '30_seconds',
                'customer_type': 'existing_customer'
            });
        }, 30000);
        
        // Track scroll depth for support quality
        trackScrollDepth(articleTitle);
    }
}

/**
 * Track service page engagement - LEAD QUALITY
 * @param {string} service - Service name (automation, datev-integration, etc.)
 * @param {string} action - Action taken (view, cta_click, download)
 */
function trackServiceEngagement(service, action = 'view') {
    if (typeof gtag === 'function') {
        gtag('event', 'service_engagement', {
            'service_name': service,
            'engagement_type': action,
            'page_location': window.location.href
        });
        
        // High-intent actions
        if (action === 'cta_click' || action === 'contact_request') {
            gtag('event', 'high_intent_action', {
                'service_name': service,
                'action_type': action,
                'value': 1
            });
        }
    }
}

/**
 * Track file downloads - ENGAGEMENT
 * @param {string} fileName - Name of downloaded file
 * @param {string} fileType - Type of file (pdf, xlsx, etc.)
 */
function trackFileDownload(fileName, fileType = 'unknown') {
    if (typeof gtag === 'function') {
        gtag('event', 'file_download', {
            'file_name': fileName,
            'file_type': fileType,
            'page_location': window.location.href
        });
    }
}

// Auto-initialize event tracking for existing elements
document.addEventListener('DOMContentLoaded', function() {
    initEventTracking();
});

function initEventTracking() {
    // Track job page visits automatically
    if (window.location.pathname.includes('/jobs/')) {
        const jobTitle = document.querySelector('h1')?.textContent || 'Unknown Position';
        trackJobEngagement(jobTitle, 'view');
    }
    
    // Track knowledge base article views
    if (window.location.pathname.includes('/knowledge-base/') || window.location.pathname.includes('/content/knowledge-base/')) {
        const articleTitle = document.querySelector('h1')?.textContent || 'Unknown Article';
        const category = document.querySelector('[data-category]')?.dataset.category || 'general';
        trackKnowledgeBaseUsage(articleTitle, category);
    }
    
    // Track service page visits
    if (window.location.pathname.includes('/leistungen')) {
        trackServiceEngagement('automation-services', 'view');
    }
    
    // Auto-track file downloads
    document.querySelectorAll('a[href$=".pdf"], a[href$=".xlsx"], a[href$=".docx"]').forEach(link => {
        link.addEventListener('click', function() {
            const fileName = this.getAttribute('href').split('/').pop();
            const fileType = fileName.split('.').pop();
            trackFileDownload(fileName, fileType);
        });
    });
    
    // Auto-track external links
    document.querySelectorAll('a[href^="http"]:not([href*="lineo.finance"])').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': this.href,
                    'transport_type': 'beacon'
                });
            }
        });
    });
}

// Helper functions for enhanced tracking

/**
 * Detect if user came directly to knowledge base (existing customer indicator)
 * @returns {string} Session source classification
 */
function getSessionSource() {
    const referrer = document.referrer;
    const currentPath = window.location.pathname;
    
    // Direct knowledge base access (strong customer indicator)
    if (!referrer && currentPath.includes('/knowledge-base/')) {
        return 'direct_kb_access';
    }
    
    // Internal referral from main site
    if (referrer && referrer.includes('lineo.finance')) {
        return 'internal_navigation';
    }
    
    // External referral
    if (referrer) {
        return 'external_referral';
    }
    
    return 'direct_access';
}

/**
 * Track scroll depth for content engagement quality
 * @param {string} contentTitle - Title of content being tracked
 */
function trackScrollDepth(contentTitle) {
    let scrollDepthTracked = {
        '25': false,
        '50': false,
        '75': false,
        '100': false
    };
    
    function checkScrollDepth() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        // Track milestone reached
        Object.keys(scrollDepthTracked).forEach(milestone => {
            if (!scrollDepthTracked[milestone] && scrollPercent >= parseInt(milestone)) {
                scrollDepthTracked[milestone] = true;
                
                if (typeof gtag === 'function') {
                    gtag('event', 'scroll_depth', {
                        'content_title': contentTitle,
                        'scroll_depth': milestone + '%',
                        'customer_type': 'existing_customer',
                        'content_type': 'knowledge_base'
                    });
                }
            }
        });
    }
    
    // Throttled scroll tracking
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkScrollDepth, 100);
    });
}

// Make functions globally available for manual tracking
window.trackFormSubmission = trackFormSubmission;
window.trackJobEngagement = trackJobEngagement;
window.trackKnowledgeBaseUsage = trackKnowledgeBaseUsage;
window.trackServiceEngagement = trackServiceEngagement;
window.trackFileDownload = trackFileDownload;