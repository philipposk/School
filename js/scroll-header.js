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
        // Remove existing sidebar if any
        const existing = document.getElementById('header-sidebar');
        if (existing) {
            existing.remove();
        }
        
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
            transition: opacity 0.3s ease, visibility 0.3s ease !important;
            background: rgba(0, 0, 0, 0.7) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 12px !important;
            min-width: 60px !important;
            min-height: 60px !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
            transform: translateZ(0) !important;
            will-change: opacity, visibility !important;
        `;
        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
        console.log('ScrollHeaderManager: Sidebar created and appended to body');
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > 100;
        
        // Ensure buttons are found
        if (this.headerButtons.length === 0) {
            this.headerButtons = Array.from(document.querySelectorAll('.header-btn'));
        }
        
        if (this.headerButtons.length === 0) return;
        
        // Only animate if state changed
        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.animateHeader(shouldBeScrolled);
        } else if (shouldBeScrolled && this.sidebar) {
            // Keep sidebar visible if scrolled (even if state hasn't changed)
            // Recreate buttons if sidebar is empty
            if (this.sidebar.children.length === 0 && this.headerButtons.length > 0) {
                console.log('ScrollHeaderManager: Sidebar empty, recreating buttons');
                this.animateHeader(true);
            } else {
                // Just ensure it's visible
                this.sidebar.style.setProperty('opacity', '1', 'important');
                this.sidebar.style.setProperty('pointer-events', 'auto', 'important');
                this.sidebar.style.setProperty('visibility', 'visible', 'important');
                this.sidebar.style.setProperty('display', 'flex', 'important');
                this.sidebar.style.setProperty('z-index', '99999', 'important');
            }
        }
    },
    
    animateHeader(scrolled) {
        const header = document.querySelector('header');
        if (!header) {
            console.warn('ScrollHeaderManager: Header not found');
            return;
        }
        
        console.log('ScrollHeaderManager: animateHeader called, scrolled:', scrolled);
        
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
            console.log('Creating', this.headerButtons.length, 'buttons in sidebar');
            this.headerButtons.forEach((btn, index) => {
                const clone = btn.cloneNode(true);
                clone.classList.add('header-sidebar-btn');
                // Remove any existing transforms or positioning
                clone.style.removeProperty('transform');
                clone.style.removeProperty('position');
                clone.style.removeProperty('top');
                clone.style.removeProperty('left');
                clone.style.removeProperty('right');
                clone.style.removeProperty('bottom');
                
                clone.style.cssText = `
                    position: relative !important;
                    width: 48px !important;
                    height: 48px !important;
                    min-width: 48px !important;
                    min-height: 48px !important;
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
                    transition: transform 0.3s ease, background 0.3s ease !important;
                    font-size: 1.2rem !important;
                    box-sizing: border-box !important;
                    flex-shrink: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    bottom: auto !important;
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
                    // Force reflow to ensure button is rendered
                    clone.offsetHeight;
                    const rect = clone.getBoundingClientRect();
                    console.log('Button', index, 'appended to sidebar, size:', rect.width, 'x', rect.height, 'at', rect.left, rect.top);
                } else {
                    console.error('Sidebar is null!');
                }
            });
            
            // Show sidebar - make absolutely sure it's visible
            if (this.sidebar) {
                console.log('ScrollHeaderManager: Showing sidebar, children:', this.sidebar.children.length);
                
                // Remove transition temporarily to ensure instant visibility
                this.sidebar.style.setProperty('transition', 'none', 'important');
                
                // Set all visibility properties
                this.sidebar.style.setProperty('opacity', '1', 'important');
                this.sidebar.style.setProperty('pointer-events', 'auto', 'important');
                this.sidebar.style.setProperty('visibility', 'visible', 'important');
                this.sidebar.style.setProperty('display', 'flex', 'important');
                this.sidebar.style.setProperty('z-index', '99999', 'important');
                
                // Force reflow
                this.sidebar.offsetHeight;
                
                // Restore transition
                this.sidebar.style.setProperty('transition', 'opacity 0.3s ease, visibility 0.3s ease', 'important');
                
                // Double-check visibility after a moment
                setTimeout(() => {
                    if (this.sidebar) {
                        const rect = this.sidebar.getBoundingClientRect();
                        const computed = window.getComputedStyle(this.sidebar);
                        const state = {
                            opacity: computed.opacity,
                            visibility: computed.visibility,
                            display: computed.display,
                            zIndex: computed.zIndex,
                            left: computed.left,
                            top: computed.top,
                            width: rect.width,
                            height: rect.height,
                            children: this.sidebar.children.length,
                            inViewport: rect.top >= 0 && rect.left >= 0 && rect.width > 0 && rect.height > 0
                        };
                        console.log('ScrollHeaderManager: Sidebar state check:', state);
                        
                        // If sidebar has 0 size, force it to have size
                        if (rect.width === 0 || rect.height === 0) {
                            console.warn('ScrollHeaderManager: Sidebar has 0 size! Forcing size...');
                            this.sidebar.style.setProperty('width', '60px', 'important');
                            this.sidebar.style.setProperty('height', 'auto', 'important');
                            this.sidebar.style.setProperty('min-height', '200px', 'important');
                        }
                    }
                }, 100);
            } else {
                console.error('ScrollHeaderManager: Sidebar is null when trying to show!');
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

