// Main JavaScript file for Lineo Finance website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initMobileMenu();
    initFormValidation();
    initLazyLoading();
    initSmoothScroll();
    initFAQ();
    initHeroCarousel();
    initHeaderScroll();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Update aria-expanded attribute
            const isExpanded = toggle.classList.contains('active');
            toggle.setAttribute('aria-expanded', isExpanded);
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
                console.log('Form submitted successfully');
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
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        
        if (summary) {
            // Add keyboard navigation
            summary.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.open = !item.open;
                }
            });
            
            // Add smooth animation class when toggling
            summary.addEventListener('click', function() {
                item.classList.toggle('opening');
                
                setTimeout(() => {
                    item.classList.remove('opening');
                }, 300);
            });
        }
    });
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
        console.log('Page Load Time:', pageLoadTime + 'ms');
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
        autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
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
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
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
    updateCarousel();
    startAutoPlay();
    
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
    
    // Initial check
    updateHeader();
}