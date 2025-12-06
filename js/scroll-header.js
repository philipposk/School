// Scroll-based header animation and sound effects
// Header items move to left side when scrolling down with 3D animation

const ScrollHeaderManager = {
    isScrolled: false,
    headerButtons: [],
    sidebar: null,
    soundEnabled: true,
    sounds: {},
    animationSpeed: 1.0, // Default animation speed multiplier
    lastScrollTime: null,
    lastScrollY: 0,
    
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
        // Create sidebar container on top-left side - always fixed
        const sidebar = document.createElement('div');
        sidebar.id = 'header-sidebar';
        sidebar.style.cssText = `
            position: fixed !important;
            left: 0.5rem !important;
            top: 1rem !important;
            z-index: 1000 !important;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.5rem;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            transform: translateZ(0);
            will-change: opacity;
        `;
        document.body.appendChild(sidebar);
        this.sidebar = sidebar;
        
        // Create sound toggle button
        this.createSoundToggle();
    },
    
    createSoundToggle() {
        const soundBtn = document.createElement('button');
        soundBtn.id = 'sound-toggle';
        soundBtn.innerHTML = this.soundEnabled ? '🔊' : '🔇';
        soundBtn.title = this.soundEnabled ? 'Mute sounds' : 'Unmute sounds';
        soundBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(102, 126, 234, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        soundBtn.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            soundBtn.innerHTML = this.soundEnabled ? '🔊' : '🔇';
            soundBtn.title = this.soundEnabled ? 'Mute sounds' : 'Unmute sounds';
            
            // Stop all playing sounds if muting
            if (!this.soundEnabled) {
                Object.values(this.sounds).forEach(sound => {
                    if (sound && !sound.paused) {
                        sound.pause();
                        sound.currentTime = 0;
                    }
                });
            }
        });
        
        soundBtn.addEventListener('mouseenter', () => {
            soundBtn.style.transform = 'scale(1.1)';
            soundBtn.style.background = 'rgba(102, 126, 234, 1)';
        });
        
        soundBtn.addEventListener('mouseleave', () => {
            soundBtn.style.transform = 'scale(1)';
            soundBtn.style.background = 'rgba(102, 126, 234, 0.8)';
        });
        
        document.body.appendChild(soundBtn);
        this.soundToggle = soundBtn;
    },
    
    handleScroll() {
        const scrollY = window.scrollY;
        const shouldBeScrolled = scrollY > 100; // Threshold for animation
        
        // Calculate scroll speed for animation timing
        const now = Date.now();
        const timeSinceLastScroll = now - (this.lastScrollTime || now);
        this.lastScrollTime = now;
        
        // Calculate scroll velocity (pixels per millisecond)
        const scrollDelta = Math.abs(scrollY - (this.lastScrollY || scrollY));
        this.lastScrollY = scrollY;
        const scrollSpeed = scrollDelta / Math.max(timeSinceLastScroll, 1); // pixels per ms
        
        // Normalize speed (0.5 to 2.0 multiplier)
        // Fast scroll (>10px/ms) = 0.5x duration (faster), slow scroll (<1px/ms) = 2x duration (slower)
        this.animationSpeed = Math.max(0.5, Math.min(2.0, 1 / (scrollSpeed * 0.1 + 0.5)));
        
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
        
        if (!header || !headerRight) {
            console.warn('ScrollHeaderManager: Header or header-right not found');
            return;
        }
        
        // Re-fetch header buttons in case they've changed
        this.headerButtons = Array.from(document.querySelectorAll('.header-btn'));
        
        if (this.headerButtons.length === 0) {
            console.warn('ScrollHeaderManager: No header buttons found');
            return;
        }
        
        if (scrolled) {
            // Ensure sidebar exists
            if (!this.sidebar) {
                this.createSidebar();
            }
            
            // Clean up any existing flying buttons and clear sidebar
            document.querySelectorAll('.flying-button').forEach(btn => btn.remove());
            if (this.sidebar) {
                this.sidebar.innerHTML = '';
            }
            
            // Get button positions for flight path calculation
            this.headerButtons.forEach((btn, index) => {
                const rect = btn.getBoundingClientRect();
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                
                // Target position on sidebar (top-left)
                const targetX = 24; // Center of sidebar button
                const targetY = 80 + index * 56; // Top-left, stacked vertically
                
                // Create flying button clone
                const clone = btn.cloneNode(true);
                clone.classList.add('header-sidebar-btn', 'flying-button');
                clone.style.cssText = `
                    position: fixed;
                    left: ${startX}px;
                    top: ${startY}px;
                    width: ${rect.width}px;
                    height: ${rect.height}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    cursor: pointer;
                    z-index: 10000;
                    transform-style: preserve-3d;
                    pointer-events: none;
                `;
                
                // Add tooltip with button name
                const title = btn.getAttribute('title') || btn.textContent.trim();
                clone.setAttribute('title', title);
                clone.setAttribute('data-tooltip', title);
                
                document.body.appendChild(clone);
                
                // Calculate flight path: fly along top with multiple bounces
                const midX1 = window.innerWidth * 0.2; // First bounce point
                const midX2 = window.innerWidth * 0.1; // Second bounce point
                const midY = 50; // Fly along top
                
                // Calculate timing based on scroll speed
                const baseDelay = 50 * this.animationSpeed;
                const phase1Duration = 300 * this.animationSpeed;
                const phase2Duration = 250 * this.animationSpeed;
                const phase3Duration = 200 * this.animationSpeed;
                const phase4Duration = 150 * this.animationSpeed;
                const phase5Duration = 100 * this.animationSpeed;
                
                // Animate flight path with multiple bounces
                setTimeout(() => {
                    // Phase 1: Fly along top - first bounce
                    clone.style.transition = `all ${phase1Duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    clone.style.left = `${midX1}px`;
                    clone.style.top = `${midY}px`;
                    clone.style.transform = 'rotateZ(0deg) scale(1)';
                    
                    // Phase 2: Bounce up
                    setTimeout(() => {
                        clone.style.transition = `all ${phase2Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                        clone.style.top = `${midY - 15}px`;
                        clone.style.transform = 'rotateZ(5deg) scale(1.1)';
                        
                        // Phase 3: Bounce down and continue
                        setTimeout(() => {
                            clone.style.transition = `all ${phase3Duration}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`;
                            clone.style.left = `${midX2}px`;
                            clone.style.top = `${midY}px`;
                            clone.style.transform = 'rotateZ(-5deg) scale(1)';
                            
                            // Phase 4: Sharp turn and dive with bounce
                            setTimeout(() => {
                                clone.style.transition = `all ${phase4Duration}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`;
                                clone.style.left = `${targetX + 10}px`;
                                clone.style.top = `${targetY - 30}px`;
                                clone.style.transform = 'rotateZ(-45deg) scale(1.3)';
                                
                                // Phase 5: Bounce up before landing
                                setTimeout(() => {
                                    clone.style.transition = `all ${phase5Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                                    clone.style.top = `${targetY - 10}px`;
                                    clone.style.transform = 'rotateZ(-20deg) scale(1.1)';
                                    
                                    // Phase 6: Final landing with splash/bang
                                    setTimeout(() => {
                                        clone.style.transition = `all ${phase5Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                                        clone.style.left = `${targetX}px`;
                                        clone.style.top = `${targetY}px`;
                                        clone.style.transform = 'rotateZ(0deg) scale(1)';
                                        clone.style.borderRadius = '50%';
                                        clone.style.width = '48px';
                                        clone.style.height = '48px';
                                        
                                        // Create splash/bang effect
                                        this.createSplashEffect(targetX, targetY, index);
                                        
                                        // Play landing sound
                                        if (this.soundEnabled && this.sounds.pop) {
                                            setTimeout(() => {
                                                this.sounds.pop.play().catch(() => {});
                                            }, 50);
                                        }
                                        
                                        // Finalize button
                                        setTimeout(() => {
                                            clone.style.position = 'relative';
                                            clone.style.left = '';
                                            clone.style.top = '';
                                            clone.style.pointerEvents = 'auto';
                                            clone.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                                            
                                            // Move to sidebar (only if sidebar doesn't already have this button)
                                            if (!this.sidebar.querySelector(`[data-button-index="${index}"]`)) {
                                                clone.setAttribute('data-button-index', index);
                                                this.sidebar.appendChild(clone);
                                                
                                                // Add hover effect
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
                                        }, 100);
                                    }, phase5Duration);
                                }, phase4Duration);
                            }, phase3Duration);
                        }, phase2Duration);
                    }, phase1Duration);
                }, index * baseDelay);
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
            
            // Show sidebar - ensure it stays fixed at top-left
            this.sidebar.style.position = 'fixed';
            this.sidebar.style.left = '0.5rem';
            this.sidebar.style.top = '1rem';
            this.sidebar.style.opacity = '1';
            this.sidebar.style.pointerEvents = 'auto';
            
            // Shrink header
            header.style.cssText += `
                transform: translateY(-100%) scale(0.8);
                opacity: 0.5;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            `;
        } else {
            // Clean up any existing flying buttons first
            document.querySelectorAll('.flying-button').forEach(btn => btn.remove());
            
            // Animate buttons back to header (reverse animation)
            const sidebarButtons = Array.from(this.sidebar.querySelectorAll('.header-sidebar-btn'));
            
            sidebarButtons.forEach((sidebarBtn, index) => {
                const btn = this.headerButtons[index];
                if (!btn) return;
                
                // Get target position (original header button position)
                const rect = btn.getBoundingClientRect();
                const targetX = rect.left + rect.width / 2;
                const targetY = rect.top + rect.height / 2;
                
                // Get current position
                const sidebarRect = sidebarBtn.getBoundingClientRect();
                const startX = sidebarRect.left + sidebarRect.width / 2;
                const startY = sidebarRect.top + sidebarRect.height / 2;
                
                // Immediately hide/disappear sidebar button as animation starts
                sidebarBtn.style.opacity = '0';
                sidebarBtn.style.transform = 'scale(0)';
                sidebarBtn.style.pointerEvents = 'none';
                sidebarBtn.style.transition = 'all 0.2s ease';
                
                // Create flying clone for reverse animation
                const clone = sidebarBtn.cloneNode(true);
                clone.classList.add('flying-button');
                clone.style.cssText = `
                    position: fixed;
                    left: ${startX}px;
                    top: ${startY}px;
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
                    z-index: 10000;
                    transform-style: preserve-3d;
                    pointer-events: none;
                    opacity: 1;
                `;
                
                document.body.appendChild(clone);
                
                // Calculate reverse flight path (opposite of forward)
                const midX2 = window.innerWidth * 0.1;
                const midX1 = window.innerWidth * 0.2;
                const midY = 50;
                
                // Calculate timing based on scroll speed (reverse is slower - harder to climb up!)
                const baseDelay = 50 * this.animationSpeed;
                const phase1Duration = 100 * this.animationSpeed;
                const phase2Duration = 150 * this.animationSpeed;
                const phase3Duration = 200 * this.animationSpeed;
                const phase4Duration = 250 * this.animationSpeed;
                const phase5Duration = 300 * this.animationSpeed;
                
                // Reverse animation: start from sidebar, go back through phases
                setTimeout(() => {
                    // Phase 1: Lift off from sidebar (reverse of landing)
                    clone.style.transition = `all ${phase1Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                    clone.style.left = `${targetX + 10}px`;
                    clone.style.top = `${targetY - 10}px`;
                    clone.style.transform = 'rotateZ(-20deg) scale(1.1)';
                    
                    // Phase 2: Bounce up (reverse of bounce down)
                    setTimeout(() => {
                        clone.style.transition = `all ${phase2Duration}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`;
                        clone.style.left = `${targetX + 10}px`;
                        clone.style.top = `${targetY - 30}px`;
                        clone.style.transform = 'rotateZ(-45deg) scale(1.3)';
                        
                        // Phase 3: Turn and fly up (reverse of dive)
                        setTimeout(() => {
                            clone.style.transition = `all ${phase3Duration}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`;
                            clone.style.left = `${midX2}px`;
                            clone.style.top = `${midY}px`;
                            clone.style.transform = 'rotateZ(-5deg) scale(1)';
                            
                            // Phase 4: Bounce down (reverse of bounce up)
                            setTimeout(() => {
                                clone.style.transition = `all ${phase4Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                                clone.style.top = `${midY - 15}px`;
                                clone.style.transform = 'rotateZ(5deg) scale(1.1)';
                                
                                // Phase 5: Continue along top (reverse of first phase)
                                setTimeout(() => {
                                    clone.style.transition = `all ${phase5Duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                                    clone.style.left = `${midX1}px`;
                                    clone.style.top = `${midY}px`;
                                    clone.style.transform = 'rotateZ(0deg) scale(1)';
                                    
                                    // Phase 6: Final approach to header position
                                    setTimeout(() => {
                                        clone.style.transition = `all ${phase5Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                                        clone.style.left = `${targetX}px`;
                                        clone.style.top = `${targetY}px`;
                                        clone.style.transform = 'rotateZ(0deg) scale(1)';
                                        clone.style.borderRadius = '8px';
                                        clone.style.width = `${btn.offsetWidth}px`;
                                        clone.style.height = `${btn.offsetHeight}px`;
                                        
                                        // HIDDEN NERD JOKE: Delay at top because it's harder to climb up! 🧗
                                        setTimeout(() => {
                                            // Pause at top position (the "climbing is hard" delay)
                                            clone.style.transition = 'all 0.3s ease';
                                            clone.style.transform = 'scale(1.1)';
                                            
                                            setTimeout(() => {
                                                // Final landing back in header
                                                clone.style.transition = `all ${phase1Duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                                                clone.style.transform = 'scale(1)';
                                                
                                                // Play sound
                                                if (this.soundEnabled && this.sounds.pop) {
                                                    setTimeout(() => {
                                                        this.sounds.pop.play().catch(() => {});
                                                    }, 50);
                                                }
                                                
                                                // Restore original button
                                                setTimeout(() => {
                                                    btn.style.cssText = '';
                                                    btn.style.cssText += `
                                                        transform: translateX(0) rotateY(0deg) translateZ(0);
                                                        opacity: 1;
                                                        transition: all 0.3s ease;
                                                        pointer-events: auto;
                                                    `;
                                                    clone.remove();
                                                }, phase1Duration);
                                            }, 300); // The "climbing delay" - hidden nerd joke! 🧗
                                        }, phase5Duration);
                                    }, phase4Duration);
                                }, phase3Duration);
                            }, phase2Duration);
                        }, phase1Duration);
                    }, phase1Duration);
                }, index * baseDelay);
            });
            
            // Hide sidebar after delay
            setTimeout(() => {
                this.sidebar.style.opacity = '0';
                this.sidebar.style.pointerEvents = 'none';
                this.sidebar.innerHTML = '';
            }, sidebarButtons.length * baseDelay + 2000);
            
            // Restore header
            setTimeout(() => {
                header.style.cssText = '';
            }, 100);
        }
    },
    
    createSplashEffect(x, y, index) {
        // Create splash/bang animation particles
        const splash = document.createElement('div');
        splash.className = 'splash-effect';
        splash.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 80px;
            height: 80px;
            pointer-events: none;
            z-index: 10001;
            transform: translate(-50%, -50%);
        `;
        
        // Create multiple particles for splash effect
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const size = 4 + Math.random() * 6;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.4) 100%);
                border-radius: 50%;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                animation: splashParticle 0.6s ease-out forwards;
                --angle: ${angle}rad;
                --distance: ${distance}px;
            `;
            splash.appendChild(particle);
        }
        
        // Add central bang effect
        const bang = document.createElement('div');
        bang.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(102, 126, 234, 0.6) 50%, transparent 100%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: splashBang 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;
        splash.appendChild(bang);
        
        document.body.appendChild(splash);
        
        // Remove after animation
        setTimeout(() => {
            splash.remove();
        }, 600);
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
    
    @keyframes splashParticle {
        0% {
            transform: translate(-50%, -50%) translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) translate(calc(cos(var(--angle)) * var(--distance)), calc(sin(var(--angle)) * var(--distance))) scale(0);
            opacity: 0;
        }
    }
    
    @keyframes splashBang {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
    
    .splash-effect {
        transform-style: preserve-3d;
    }
    
    #header-sidebar {
        transform-style: preserve-3d;
    }
    
    .header-sidebar-btn {
        transform-style: preserve-3d;
    }
    
    .flying-button {
        transform-style: preserve-3d;
        will-change: transform, left, top;
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

