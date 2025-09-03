// Helper function to add pause on interaction
function addPauseOnInteraction(carouselElement, swiperInstance) {
    // Pause when mouse enters carousel area
    carouselElement.addEventListener('mouseenter', function() {
        swiperInstance.autoplay.stop();
        announceToScreenReader('Karussell pausiert');
    });
    
    // Resume when mouse leaves carousel area
    carouselElement.addEventListener('mouseleave', function() {
        swiperInstance.autoplay.start();
        announceToScreenReader('Karussell wird fortgesetzt');
    });
    
    // Pause when any element in carousel receives focus
    carouselElement.addEventListener('focusin', function() {
        swiperInstance.autoplay.stop();
    });
    
    // Resume when focus leaves carousel
    carouselElement.addEventListener('focusout', function(e) {
        // Check if focus is still within carousel
        setTimeout(() => {
            if (!carouselElement.contains(document.activeElement)) {
                swiperInstance.autoplay.start();
            }
        }, 100);
    });
    
    // Also pause on keyboard interaction with navigation buttons
    const navButtons = carouselElement.querySelectorAll('.swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet');
    navButtons.forEach(button => {
        button.addEventListener('focus', () => {
            swiperInstance.autoplay.stop();
        });
    });
}

// Helper function to add ARIA live region for announcements
function addAriaLiveRegion(carouselElement) {
    if (!document.querySelector('.carousel-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.className = 'carousel-live-region sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
    }
}

// Helper function to announce to screen readers
function announceToScreenReader(message) {
    const liveRegion = document.querySelector('.carousel-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Initialize Swiper for carousels
document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library not loaded');
        return;
    }
    
    // Add global ARIA live region for all carousels
    addAriaLiveRegion();

    // Initialize hero carousel
    const heroCarousel = document.querySelector('.hero-carousel.swiper');
    if (heroCarousel) {
        const heroSwiper = new Swiper(heroCarousel, {
            // Core parameters
            slidesPerView: 1,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            
            // Navigation
            navigation: {
                nextEl: '.hero-carousel-next',
                prevEl: '.hero-carousel-prev',
            },
            
            // Pagination
            pagination: {
                el: '.hero-carousel-pagination',
                clickable: true,
            },
            
            // Smooth transitions
            speed: 500,
            effect: 'slide',
            
            
            // Disable touch/mouse drag
            allowTouchMove: false,
            simulateTouch: false,
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Animation on slide change
            on: {
                slideChangeTransitionStart: function() {
                    // Add animation class to active slide
                    const activeSlide = this.slides[this.activeIndex];
                    if (activeSlide) {
                        const card = activeSlide.querySelector('.carousel-card');
                        if (card) {
                            card.style.animation = 'none';
                            setTimeout(() => {
                                card.style.animation = 'slideIn 0.5s ease-out';
                            }, 10);
                        }
                    }
                }
            },
            
            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Vorheriger Slide',
                nextSlideMessage: 'Nächster Slide',
                firstSlideMessage: 'Dies ist der erste Slide',
                lastSlideMessage: 'Dies ist der letzte Slide',
                paginationBulletMessage: 'Gehe zu Slide {{index}}',
                notificationClass: 'swiper-notification',
            },
        });
        
        // Add pause on hover/focus for hero carousel
        addPauseOnInteraction(heroCarousel, heroSwiper);
    }

    // Initialize broker carousel
    const brokerCarousel = document.querySelector('.broker-carousel.swiper');
    if (brokerCarousel) {
        const brokerSwiper = new Swiper(brokerCarousel, {
            // Core parameters
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true, // Enable endless loop
            centeredSlides: false,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            
            // Responsive breakpoints
            breakpoints: {
                // When window width is >= 852px (tablet)
                852: {
                    slidesPerView: 3,
                    slidesPerGroup: 1, // Move one slide at a time
                }
            },
            
            // Navigation
            navigation: {
                nextEl: '.broker-carousel .swiper-button-next',
                prevEl: '.broker-carousel .swiper-button-prev',
            },
            
            // Pagination
            pagination: {
                el: '.broker-carousel .swiper-pagination',
                clickable: true,
                dynamicBullets: false,
            },
            
            // Performance optimizations
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            preloadImages: false,
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 3,
            },
            
            // Smooth transitions
            speed: 500,
            effect: 'slide',
            
            // Disable touch/mouse drag
            allowTouchMove: false,
            simulateTouch: false,
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Vorheriger Broker',
                nextSlideMessage: 'Nächster Broker',
                firstSlideMessage: 'Dies ist der erste Broker',
                lastSlideMessage: 'Dies ist der letzte Broker',
                paginationBulletMessage: 'Gehe zu Broker {{index}}',
                notificationClass: 'swiper-notification',
            },
        });
        
        // Add pause on hover/focus for broker carousel
        addPauseOnInteraction(brokerCarousel, brokerSwiper);
    }

    // Initialize smart system carousel
    const smartSystemCarousel = document.querySelector('.smart-system-carousel.swiper');
    if (smartSystemCarousel) {
        const smartSystemSwiper = new Swiper(smartSystemCarousel, {
            // Core parameters
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true, // Enable endless loop
            centeredSlides: false,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            
            // Responsive breakpoints
            breakpoints: {
                // When window width is >= 768px (tablet)
                768: {
                    slidesPerView: 2,
                    slidesPerGroup: 1,
                    spaceBetween: 30,
                },
                // When window width is >= 1024px (desktop)
                1024: {
                    slidesPerView: 3,
                    slidesPerGroup: 1,
                    spaceBetween: 30,
                }
            },
            
            // Navigation
            navigation: {
                nextEl: '.smart-system-carousel .swiper-button-next',
                prevEl: '.smart-system-carousel .swiper-button-prev',
            },
            
            // Pagination
            pagination: {
                el: '.smart-system-carousel .swiper-pagination',
                clickable: true,
                dynamicBullets: false,
            },
            
            // Performance optimizations
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
            preloadImages: false,
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 3,
            },
            
            // Smooth transitions
            speed: 500,
            effect: 'slide',
            
            // Disable touch/mouse drag
            allowTouchMove: false,
            simulateTouch: false,
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
                firstSlideMessage: 'This is the first slide',
                lastSlideMessage: 'This is the last slide',
                paginationBulletMessage: 'Go to slide {{index}}',
            },
        });
        
        // Add pause on hover/focus for smart system carousel
        addPauseOnInteraction(smartSystemCarousel, smartSystemSwiper);
    }

    // Initialize leistungen target audience carousel
    const leistungenTargetCarousel = document.querySelector('.leistungen-target__carousel.swiper');
    if (leistungenTargetCarousel) {
        new Swiper(leistungenTargetCarousel, {
            // Core parameters
            slidesPerView: 1,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            
            // Navigation
            navigation: {
                nextEl: '.leistungen-target__carousel-next',
                prevEl: '.leistungen-target__carousel-prev',
            },
            
            // Pagination
            pagination: {
                el: '.leistungen-target__carousel-pagination',
                clickable: true,
            },
            
            // Smooth transitions
            speed: 500,
            effect: 'slide',
            
            // Disable touch/mouse drag
            allowTouchMove: false,
            simulateTouch: false,
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Animation on slide change
            on: {
                slideChangeTransitionStart: function() {
                    // Add animation class to active slide
                    const activeSlide = this.slides[this.activeIndex];
                    if (activeSlide) {
                        const card = activeSlide.querySelector('.carousel-card');
                        if (card) {
                            card.style.animation = 'none';
                            setTimeout(() => {
                                card.style.animation = 'slideIn 0.5s ease-out';
                            }, 10);
                        }
                    }
                }
            },
            
            // Accessibility
            a11y: {
                enabled: true,
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
                firstSlideMessage: 'This is the first slide',
                lastSlideMessage: 'This is the last slide',
                paginationBulletMessage: 'Go to slide {{index}}',
            },
        });
    }
});