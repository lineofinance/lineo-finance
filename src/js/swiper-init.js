// Initialize Swiper for broker carousel
document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library not loaded');
        return;
    }

    // Initialize broker carousel
    const brokerCarousel = document.querySelector('.broker-carousel.swiper');
    if (brokerCarousel) {
        new Swiper(brokerCarousel, {
            // Core parameters
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true, // Enable endless loop
            loopedSlides: 7, // We have 7 unique slides
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
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            // Pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: false,
                renderBullet: function (index, className) {
                    // Only show 7 bullets even though we have duplicates for looping
                    if (index < 7) {
                        return '<span class="' + className + '"></span>';
                    }
                    return '';
                },
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
            
            // Touch interactions
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            
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
});