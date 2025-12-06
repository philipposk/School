// 3D World Manager - Game-like course exploration
// Inspired by AYAX 80 Años interactive 3D map

const ThreeDWorld = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    courseObjects: [],
    raycaster: null,
    mouse: null,
    selectedCourse: null,
    isAnimating: false,
    container: null,
    
    init() {
        // Check if Three.js is available
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, 3D world disabled');
            return;
        }
        
        this.container = document.getElementById('courses-container') || document.querySelector('.courses-container');
        if (!this.container) {
            console.warn('Courses container not found');
            return;
        }
        
        // Create container for 3D canvas
        const canvasContainer = document.createElement('div');
        canvasContainer.id = '3d-world-container';
        canvasContainer.style.cssText = 'width: 100%; height: 100vh; position: relative; overflow: hidden;';
        this.container.innerHTML = '';
        this.container.appendChild(canvasContainer);
        
        this.setupScene();
        this.setupCamera();
        this.setupRenderer(canvasContainer);
        this.setupControls();
        this.setupLights();
        this.createLandscape();
        this.loadCourses();
        this.setupInteraction();
        this.animate();
        this.addUI();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    },
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0015); // Reduced fog for better visibility
    },
    
    setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        // Start camera positioned to see underground course
        this.camera.position.set(0, 30, 80);
        this.camera.lookAt(0, -10, 0); // Look towards underground area
    },
    
    setupRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
    },
    
    setupControls() {
        // Use OrbitControls for smooth camera movement
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 20;
            this.controls.maxDistance = 500;
            this.controls.maxPolarAngle = Math.PI / 2.2;
            this.controls.enablePan = true;
        } else {
            // Fallback: load OrbitControls from CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            script.onload = () => {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.minDistance = 20;
                this.controls.maxDistance = 500;
                this.controls.maxPolarAngle = Math.PI / 2.2;
                this.controls.enablePan = true;
            };
            document.head.appendChild(script);
        }
    },
    
    setupLights() {
        // Ambient light - brighter for better card visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - brighter
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere - brighter and more colorful
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0x667eea, 0x764ba2];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1.0, 150);
            const angle = (i / colors.length) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 80,
                30 + Math.sin(i) * 20,
                Math.sin(angle) * 80
            );
            this.scene.add(light);
        });
    },
    
    createLandscape() {
        // Create a terrain-like landscape
        const geometry = new THREE.PlaneGeometry(500, 500, 50, 50);
        
        // Add some height variation
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 5 - 2; // z coordinate (height)
        }
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);
        
        // Create an opening/hole in the ground for the underground course
        const holeGeometry = new THREE.CylinderGeometry(25, 25, 2, 32);
        const holeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9,
            metalness: 0.1
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.y = -1;
        hole.rotation.x = Math.PI / 2;
        this.scene.add(hole);
        
        // Add some decorative elements
        this.addDecorativeElements();
    },
    
    addDecorativeElements() {
        // Add floating particles/atmosphere
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 500;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
    },
    
    loadCourses() {
        const courses = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        
        courses.forEach((course, index) => {
            const courseObject = this.createCourseCard(course, index, courses.length);
            this.scene.add(courseObject.mesh);
            this.courseObjects.push(courseObject);
        });
    },
    
    createCourseCard(course, index, total) {
        // Create 3D card geometry - slightly larger for better visibility
        const cardWidth = 18;
        const cardHeight = 12;
        const cardDepth = 0.8;
        
        const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
        
        // Create canvas texture for the card with brighter colors
        const canvas = document.createElement('canvas');
        canvas.width = 1024; // Higher resolution
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Draw card design with brighter, more vibrant gradient
        const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        // Use brighter, more saturated colors
        gradient.addColorStop(0, '#8b9aff'); // Brighter purple-blue
        gradient.addColorStop(0.5, '#9d6eff'); // Bright purple
        gradient.addColorStop(1, '#b886ff'); // Bright violet
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add border/outline for better visibility
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 1008, 1008);
        
        // Add inner glow effect
        const innerGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add icon - larger and brighter
        ctx.font = 'bold 180px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 4;
        ctx.strokeText(course.icon, 512, 220);
        ctx.fillText(course.icon, 512, 220);
        
        // Add title - larger and with shadow
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ffffff';
        const titleLines = this.wrapText(ctx, course.title, 800);
        titleLines.forEach((line, i) => {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 6;
            ctx.strokeText(line, 512, 380 + i * 60);
            ctx.fillText(line, 512, 380 + i * 60);
        });
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Create material with emissive glow
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x4444ff, // Blue glow
            emissiveIntensity: 0.3,
            roughness: 0.2,
            metalness: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add glow effect using a larger, semi-transparent mesh
        const glowGeometry = new THREE.BoxGeometry(cardWidth * 1.15, cardHeight * 1.15, cardDepth * 0.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);
        
        // Position cards in a circle/spiral pattern
        const angle = (index / total) * Math.PI * 2;
        const radius = 40 + (index % 3) * 15;
        
        // Special positioning for "Understanding Human Minds" - place it underground
        let height;
        if (course.id === 'human-minds') {
            height = -15; // Underground position
            // Position it at the center but underground
            mesh.position.set(0, height, 0);
            // Make it face up slightly
            mesh.rotation.x = -Math.PI / 6;
        } else {
            height = 5 + Math.sin(index) * 10;
            mesh.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            // Rotate to face center
            mesh.lookAt(0, height, 0);
        }
        
        // Add hover glow effect
        mesh.userData = {
            course: course,
            originalScale: mesh.scale.clone(),
            originalPosition: mesh.position.clone(),
            hovered: false
        };
        
        return { mesh, course };
    },
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    },
    
    setupInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Mouse move for hover
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
    },
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.courseObjects.map(obj => obj.mesh)
        );
        
        // Reset all cards
        this.courseObjects.forEach(obj => {
            if (!obj.mesh.userData.hovered) return;
            obj.mesh.userData.hovered = false;
            obj.mesh.scale.copy(obj.mesh.userData.originalScale);
            obj.mesh.material.emissive.setHex(0x4444ff);
            obj.mesh.material.emissiveIntensity = 0.3;
        });
        
        // Highlight hovered card
        if (intersects.length > 0) {
            const hoveredMesh = intersects[0].object;
            hoveredMesh.userData.hovered = true;
            hoveredMesh.scale.multiplyScalar(1.3);
            // Bright glow on hover
            hoveredMesh.material.emissive.setHex(0x88aaff);
            hoveredMesh.material.emissiveIntensity = 0.8;
            
            // Show info popup
            this.showCourseInfo(intersects[0].object.userData.course, event);
        } else {
            this.hideCourseInfo();
        }
    },
    
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.courseObjects.map(obj => obj.mesh)
        );
        
        if (intersects.length > 0) {
            const course = intersects[0].object.userData.course;
            this.flyToCourse(course, intersects[0].object);
        }
    },
    
    flyToCourse(course, mesh) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const targetPosition = mesh.position.clone();
        targetPosition.y += 5;
        targetPosition.add(mesh.position.clone().normalize().multiplyScalar(10));
        
        const startPosition = this.camera.position.clone();
        const startRotation = this.camera.rotation.clone();
        
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            this.camera.lookAt(mesh.position);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                // Show course details
                setTimeout(() => {
                    this.showCourseDetails(course);
                }, 500);
            }
        };
        
        animate();
    },
    
    showCourseInfo(course, event) {
        let popup = document.getElementById('course-info-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'course-info-popup';
            popup.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 1.5rem;
                border-radius: 12px;
                pointer-events: none;
                z-index: 10000;
                max-width: 300px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transform: translate(-50%, -100%);
                margin-top: -10px;
            `;
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${course.icon}</div>
            <div style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">${course.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">${course.description}</div>
            <div style="font-size: 0.8rem; opacity: 0.6;">
                ${course.modules} modules • ${course.duration} • ${course.level}
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">
                Click to explore →
            </div>
        `;
        
        popup.style.left = event.clientX + 'px';
        popup.style.top = event.clientY + 'px';
        popup.style.display = 'block';
    },
    
    hideCourseInfo() {
        const popup = document.getElementById('course-info-popup');
        if (popup) {
            popup.style.display = 'none';
        }
    },
    
    showCourseDetails(course) {
        // Create modal for course details
        const modal = document.createElement('div');
        modal.id = 'course-details-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 20000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 3rem;
                        border-radius: 20px;
                        max-width: 600px;
                        max-height: 80vh;
                        overflow-y: auto;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <button id="close-course-modal" style="position: absolute; top: 1rem; right: 1rem;
                        background: rgba(255,255,255,0.2); border: none; color: white;
                        width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
                        font-size: 1.5rem; line-height: 1;">×</button>
                <div style="font-size: 4rem; margin-bottom: 1rem;">${course.icon}</div>
                <h2 style="font-size: 2rem; margin-bottom: 1rem;">${course.title}</h2>
                <p style="opacity: 0.9; margin-bottom: 2rem; line-height: 1.6;">${course.description}</p>
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px;">
                        ${course.modules} Modules
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px;">
                        ${course.duration}
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px;">
                        ${course.level}
                    </span>
                </div>
                <button id="load-course-btn" style="background: white; color: #667eea;
                        padding: 1rem 2rem; border: none; border-radius: 12px;
                        font-size: 1.1rem; font-weight: bold; cursor: pointer;
                        width: 100%; margin-top: 1rem;">
                    Start Course →
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-course-modal').onclick = () => {
            modal.remove();
            this.flyBack();
        };
        
        document.getElementById('load-course-btn').onclick = () => {
            if (window.loadCourse) {
                window.loadCourse(course.id);
            }
            modal.remove();
        };
    },
    
    flyBack() {
        // Smoothly return camera to overview position
        const targetPosition = new THREE.Vector3(0, 50, 100);
        const startPosition = this.camera.position.clone();
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            this.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    addUI() {
        // Add instructions overlay
        const ui = document.createElement('div');
        ui.id = '3d-world-ui';
        ui.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.5);
            padding: 1rem;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            font-size: 0.9rem;
        `;
        ui.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-weight: bold;">🎮 3D Course Explorer</div>
            <div>🖱️ Drag to rotate • Scroll to zoom</div>
            <div>👆 Hover cards for info • Click to explore</div>
        `;
        this.container.appendChild(ui);
        
        // Add toggle button to switch back to 2D view
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Switch to 2D View';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 0.75rem 1.5rem;
            background: rgba(102, 126, 234, 0.8);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        toggleBtn.onclick = () => {
            this.destroy();
            // Reload page or switch to 2D view
            location.reload();
        };
        this.container.appendChild(toggleBtn);
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Animate course cards (gentle floating)
        this.courseObjects.forEach((obj, i) => {
            const time = Date.now() * 0.001;
            obj.mesh.position.y = obj.mesh.userData.originalPosition.y + Math.sin(time + i) * 2;
            obj.mesh.rotation.y += 0.005;
        });
        
        // Render
        this.renderer.render(this.scene, this.camera);
    },
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
};

// Initialize 3D world when view mode is set to 3d-world
window.init3DWorld = function() {
    const viewMode = (typeof ViewModeManager !== 'undefined' && ViewModeManager.getCurrentMode) 
        ? ViewModeManager.getCurrentMode() 
        : localStorage.getItem('viewMode') || 'enhanced';
    
    if (viewMode === '3d-world') {
        setTimeout(() => {
            if (typeof ThreeDWorld !== 'undefined') {
                ThreeDWorld.init();
            }
        }, 500);
    }
};

// Auto-initialize if already on 3D world view mode
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const viewMode = (typeof ViewModeManager !== 'undefined' && ViewModeManager.getCurrentMode) 
            ? ViewModeManager.getCurrentMode() 
            : localStorage.getItem('viewMode') || 'enhanced';
        
        if (viewMode === '3d-world') {
            setTimeout(() => {
                if (typeof ThreeDWorld !== 'undefined') {
                    ThreeDWorld.init();
                }
            }, 500);
        }
    });
} else {
    const viewMode = (typeof ViewModeManager !== 'undefined' && ViewModeManager.getCurrentMode) 
        ? ViewModeManager.getCurrentMode() 
        : localStorage.getItem('viewMode') || 'enhanced';
    
    if (viewMode === '3d-world') {
        setTimeout(() => {
            if (typeof ThreeDWorld !== 'undefined') {
                ThreeDWorld.init();
            }
        }, 500);
    }
}

