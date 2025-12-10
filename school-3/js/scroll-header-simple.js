// Scroll-based header animation - SIMPLE VERSION
// Header items move to left side when scrolling down

const ScrollHeaderManager = {
    isScrolled: false,
    headerButtons: [],
    sidebar: null,
    soundEnabled: true,
    sounds: {},
    
    init() {
        // Get header buttons
        this.headerButtons = Array.from(document.querySelectorAll('.header-btn'));
        
        // Create sidebar container
        this.createSidebar();
        
        // Listen to scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.handleScroll(), 10);
        }, { passive: true });
        
        // Initial check
        this.handleScroll();
    },
    
    createSidebar() {
        const sidebar = document.createElement('div');
        sidebar.id = 'header-sidebar';
        sidebar.style.cssText = `
            position: fixed !important;
            left: 0.5rem !important;
            top: 1rem !important;
            z-index: 99999 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
            padding: 0.5rem !important;
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            transition: opacity 0.3s ease !important;
            background: rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 12px !important;
        `;
        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > 100;
        
        if (shouldBeScrolled === this.isScrolled) {
            // Keep sidebar visible if scrolled
            if (shouldBeScrolled && this.sidebar) {
                this.sidebar.style.setProperty('opacity', '1', 'important');
                this.sidebar.style.setProperty('pointer-events', 'auto', 'important');
                this.sidebar.style.setProperty('visibility', 'visible', 'important');
            }
            return;
        }
        
        this.isScrolled = shouldBeScrolled;
        
        // Ensure buttons are found
        if (this.headerButtons.length === 0) {
            this.headerButtons = Array.from(document.querySelectorAll('.header-btn'));
        }
        
        if (this.headerButtons.length === 0) return;
        
        this.animateHeader(shouldBeScrolled);
    },
    
    animateHeader(scrolled) {
        const header = document.querySelector('header');
        if (!header) return;
        
        if (scrolled) {
            // Ensure sidebar exists
            if (!this.sidebar) {
                this.createSidebar();
            }
            
            // Clear sidebar
            if (this.sidebar) {
                while (this.sidebar.firstChild) {
                    this.sidebar.removeChild(this.sidebar.firstChild);
                }
            }
            
            // Create buttons directly in sidebar
            this.headerButtons.forEach((btn, index) => {
                const clone = btn.cloneNode(true);
                clone.classList.add('header-sidebar-btn');
                clone.style.cssText = `
                    width: 48px !important;
                    height: 48px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 2px solid rgba(255, 255, 255, 0.8) !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    transition: all 0.3s ease !important;
                    font-size: 1.2rem !important;
                `;
                clone.onclick = btn.onclick;
                clone.setAttribute('title', btn.getAttribute('title') || btn.textContent.trim());
                
                // Hover effect
                clone.addEventListener('mouseenter', () => {
                    clone.style.setProperty('transform', 'translateX(10px) scale(1.15)', 'important');
                    clone.style.setProperty('background', 'rgba(255, 255, 255, 1)', 'important');
                });
                clone.addEventListener('mouseleave', () => {
                    clone.style.setProperty('transform', 'translateX(0) scale(1)', 'important');
                    clone.style.setProperty('background', 'rgba(255, 255, 255, 0.95)', 'important');
                });
                
                if (this.sidebar) {
                    this.sidebar.appendChild(clone);
                }
            });
            
            // Show sidebar
            if (this.sidebar) {
                this.sidebar.style.setProperty('opacity', '1', 'important');
                this.sidebar.style.setProperty('pointer-events', 'auto', 'important');
                this.sidebar.style.setProperty('visibility', 'visible', 'important');
            }
            
            // Hide header buttons
            this.headerButtons.forEach((btn) => {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            });
        } else {
            // Scrolling back to top
            // Hide sidebar
            if (this.sidebar) {
                this.sidebar.style.setProperty('opacity', '0', 'important');
                this.sidebar.style.setProperty('pointer-events', 'none', 'important');
                this.sidebar.style.setProperty('visibility', 'hidden', 'important');
                setTimeout(() => {
                    if (this.sidebar) {
                        while (this.sidebar.firstChild) {
                            this.sidebar.removeChild(this.sidebar.firstChild);
                        }
                    }
                }, 300);
            }
            
            // Show header buttons
            this.headerButtons.forEach((btn) => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            });
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollHeaderManager.init());
} else {
    ScrollHeaderManager.init();
}

