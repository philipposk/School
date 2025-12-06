// Scroll-based header animation and sound effects
// Header items move to left side when scrolling down with 3D animation

const ScrollHeaderManager = {
    isScrolled: false,
    headerButtons: [],
    soundEnabled: true,
    sounds: {},
    
    init() {
        // Create sounds directory reference (sounds will be in /sounds/ folder)
        // Gracefully handle missing sound files
        this.sounds = {};
        const soundFiles = ['pop', 'scroll', 'fly', 'walk', 'click'];
        
        soundFiles.forEach(name => {
            try {
                const audio = new Audio(`sounds/${name}.mp3`);
                audio.volume = 0.2; // Low volume - subtle, not annoying
                audio.preload = 'auto';
                // Test if file exists by trying to load
                audio.addEventListener('error', () => {
                    console.log(`Sound file sounds/${name}.mp3 not found - skipping`);
                });
                this.sounds[name] = audio;
            } catch (e) {
                console.log(`Could not create sound for ${name}:`, e);
            }
        });
        
        // Get header buttons
        this.headerButtons = Array.from(document.querySelectorAll('.header-btn'));
        
        // Create sidebar container for scrolled state
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
        // Create sidebar container on left side
        const sidebar = document.createElement('div');
        sidebar.id = 'header-sidebar';
        sidebar.style.cssText = `
            position: fixed;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0.5rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > 100; // Threshold for animation
        
        if (shouldBeScrolled !== this.isScrolled) {
            this.isScrolled = shouldBeScrolled;
            this.animateHeader(shouldBeScrolled);
            
            // Play sound effect (gracefully handle missing files)
            if (this.soundEnabled && this.sounds.pop) {
                this.sounds.pop.play().catch(() => {
                    // Silently fail if sound file doesn't exist
                });
            }
        }
    },
    
    animateHeader(scrolled) {
        const header = document.querySelector('header');
        const headerRight = document.querySelector('.header-right');
        
        if (!header || !headerRight) return;
        
        if (scrolled) {
            // Move header buttons to sidebar
            this.headerButtons.forEach((btn, index) => {
                const clone = btn.cloneNode(true);
                clone.classList.add('header-sidebar-btn');
                clone.style.cssText = `
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    transform-style: preserve-3d;
                    animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both;
                `;
                
                // Add tooltip with button name
                const title = btn.getAttribute('title') || btn.textContent.trim();
                clone.setAttribute('title', title);
                clone.setAttribute('data-tooltip', title);
                
                // Add hover effect to show name
                clone.addEventListener('mouseenter', () => {
                    clone.style.transform = 'translateX(10px) scale(1.1) translateZ(20px)';
                    clone.style.background = 'rgba(255, 255, 255, 0.25)';
                });
                clone.addEventListener('mouseleave', () => {
                    clone.style.transform = 'translateX(0) scale(1) translateZ(0)';
                    clone.style.background = 'rgba(255, 255, 255, 0.15)';
                });
                
                // Copy onclick handler
                clone.onclick = btn.onclick;
                
                this.sidebar.appendChild(clone);
            });
            
            // Hide original header buttons with 3D animation
            this.headerButtons.forEach((btn, index) => {
                btn.style.cssText += `
                    transform: translateX(-100px) rotateY(-90deg) translateZ(-50px);
                    opacity: 0;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s;
                    pointer-events: none;
                `;
            });
            
            // Show sidebar
            this.sidebar.style.opacity = '1';
            this.sidebar.style.pointerEvents = 'auto';
            
            // Shrink header
            header.style.cssText += `
                transform: translateY(-100%) scale(0.8);
                opacity: 0.5;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
        } else {
            // Restore header buttons
            this.headerButtons.forEach((btn, index) => {
                btn.style.cssText = '';
                btn.style.cssText += `
                    transform: translateX(0) rotateY(0deg) translateZ(0);
                    opacity: 1;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s;
                    pointer-events: auto;
                `;
            });
            
            // Hide sidebar
            this.sidebar.style.opacity = '0';
            this.sidebar.style.pointerEvents = 'none';
            
            // Clear sidebar
            this.sidebar.innerHTML = '';
            
            // Restore header
            header.style.cssText = '';
        }
    }
};

// CSS animations
const scrollHeaderCSS = `
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px) rotateY(-90deg) translateZ(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0) rotateY(0deg) translateZ(0);
        }
    }
    
    #header-sidebar {
        transform-style: preserve-3d;
    }
    
    .header-sidebar-btn {
        transform-style: preserve-3d;
    }
    
    @media (max-width: 768px) {
        #header-sidebar {
            left: 0.25rem;
            padding: 0.5rem 0.25rem;
        }
        
        .header-sidebar-btn {
            width: 40px;
            height: 40px;
            font-size: 1rem;
        }
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = scrollHeaderCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollHeaderManager.init());
} else {
    ScrollHeaderManager.init();
}

