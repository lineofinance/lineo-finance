// Initialize Swiper for carousels
document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library not loaded');
        return;
    }

    // Initialize hero carousel
    const heroCarousel = document.querySelector('.hero-carousel.swiper');
    if (heroCarousel) {
        new Swiper(heroCarousel, {
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
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
                firstSlideMessage: 'This is the first slide',
                lastSlideMessage: 'This is the last slide',
                paginationBulletMessage: 'Go to slide {{index}}',
            },
        });
    }

    // Initialize broker carousel
    const brokerCarousel = document.querySelector('.broker-carousel.swiper');
    if (brokerCarousel) {
        new Swiper(brokerCarousel, {
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
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
                firstSlideMessage: 'This is the first slide',
                lastSlideMessage: 'This is the last slide',
                paginationBulletMessage: 'Go to slide {{index}}',
            },
        });
    }

    // Initialize smart system carousel
    const smartSystemCarousel = document.querySelector('.smart-system-carousel.swiper');
    if (smartSystemCarousel) {
        new Swiper(smartSystemCarousel, {
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