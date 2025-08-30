/**
 * Component Loader - Lightweight HTML component system
 * Loads HTML fragments and manages component lifecycle
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadedComponents = new Set();
    }

    /**
     * Load a component from an HTML file
     * @param {string} componentPath - Path to the component HTML file
     * @param {string} targetSelector - CSS selector for target element
     * @param {Object} options - Options for component loading
     */
    async loadComponent(componentPath, targetSelector, options = {}) {
        try {
            // Check cache first
            let html = this.cache.get(componentPath);
            
            if (!html) {
                const response = await fetch(componentPath);
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${componentPath}`);
                }
                html = await response.text();
                this.cache.set(componentPath, html);
            }

            // Insert component into DOM
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                console.error(`Target element not found: ${targetSelector}`);
                return;
            }

            // Process the HTML if needed (e.g., replace placeholders)
            if (options.data) {
                html = this.processTemplate(html, options.data);
            }

            // Insert based on position option
            const position = options.position || 'replace';
            switch (position) {
                case 'before':
                    targetElement.insertAdjacentHTML('beforebegin', html);
                    break;
                case 'after':
                    targetElement.insertAdjacentHTML('afterend', html);
                    break;
                case 'prepend':
                    targetElement.insertAdjacentHTML('afterbegin', html);
                    break;
                case 'append':
                    targetElement.insertAdjacentHTML('beforeend', html);
                    break;
                case 'replace':
                default:
                    targetElement.innerHTML = html;
                    break;
            }

            // Mark component as loaded
            this.loadedComponents.add(componentPath);

            // Execute callback if provided
            if (options.onLoad && typeof options.onLoad === 'function') {
                options.onLoad();
            }

            // Set active navigation item if this is a header
            if (componentPath.includes('header')) {
                this.setActiveNavigation();
            }

        } catch (error) {
            console.error('Component loading error:', error);
            // Fallback content if needed
            if (options.fallback) {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    targetElement.innerHTML = options.fallback;
                }
            }
        }
    }

    /**
     * Load multiple components
     * @param {Array} components - Array of component configurations
     */
    async loadComponents(components) {
        const promises = components.map(config => 
            this.loadComponent(config.path, config.target, config.options)
        );
        await Promise.all(promises);
    }

    /**
     * Process template with data replacements
     * @param {string} template - HTML template string
     * @param {Object} data - Data object for replacements
     */
    processTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    /**
     * Set active navigation item based on current page
     */
    setActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-menu a[data-page]');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Check if this is the current page
            const href = link.getAttribute('href');
            if (currentPath === href || 
                (currentPath === '/' && link.dataset.page === 'home') ||
                (currentPath.includes(link.dataset.page))) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Initialize components on page load
     */
    async init() {
        // Define common components to load
        const commonComponents = [
            {
                path: '/includes/header.html',
                target: '#header-placeholder',
                options: {
                    onLoad: () => {
                        // Re-initialize mobile menu after header loads
                        if (typeof initMobileMenu !== 'undefined') {
                            initMobileMenu();
                        }
                        if (typeof initHeaderScroll !== 'undefined') {
                            initHeaderScroll();
                        }
                    }
                }
            },
            {
                path: '/includes/footer.html',
                target: '#footer-placeholder',
                options: {}
            }
        ];

        // Load common components
        await this.loadComponents(commonComponents);

        // Load page-specific components if defined
        if (window.pageComponents) {
            await this.loadComponents(window.pageComponents);
        }
    }

    /**
     * Create a section loader for modular page sections
     */
    async loadSection(sectionName, targetSelector, data = {}) {
        const sectionPath = `/includes/sections/${sectionName}.html`;
        await this.loadComponent(sectionPath, targetSelector, {
            data: data,
            position: 'replace'
        });
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.componentLoader.init();
    });
} else {
    window.componentLoader.init();
}