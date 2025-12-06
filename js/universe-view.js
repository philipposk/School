// Universe View Manager - Galaxy/Planet view with courses as countries
// Courses are represented as countries on a globe, with zoom levels showing modules

const UniverseView = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    courseRegions: [],
    zoomLevel: 0, // 0 = galaxy view, 1 = planet view, 2 = course regions, 3 = modules
    selectedCourse: null,
    container: null,
    universeObjects: [],
    
    init() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded, universe view disabled');
            return;
        }
        
        this.container = document.getElementById('courses-container') || document.querySelector('.courses-container');
        if (!this.container) {
            console.warn('Courses container not found');
            return;
        }
        
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'universe-view-container';
        canvasContainer.style.cssText = 'width: 100%; height: 100vh; position: relative; overflow: hidden;';
        this.container.innerHTML = '';
        this.container.appendChild(canvasContainer);
        
        this.setupScene();
        this.setupCamera();
        this.setupRenderer(canvasContainer);
        this.setupControls();
        this.setupLights();
        this.createUniverse();
        this.createPlanet();
        this.loadCourses();
        this.setupInteraction();
        this.animate();
        this.addUI();
        
        window.addEventListener('resize', () => this.onWindowResize());
    },
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    },
    
    setupLights() {
        // Brighter ambient light so planet is visible
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        
        // Strong directional light (sun) to illuminate the planet
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(200, 300, 200);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Additional point light near planet
        const planetLight = new THREE.PointLight(0xffffff, 1.0, 500);
        planetLight.position.set(150, 150, 150);
        this.scene.add(planetLight);
    },
    
    setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100000);
        this.camera.position.set(0, 0, 500);
    },
    
    setupRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);
    },
    
    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 50;
            this.controls.maxDistance = Infinity; // Allow infinite zoom out
            this.controls.zoomSpeed = 1.0; // Consistent zoom speed
            this.controls.addEventListener('change', () => {
                this.onZoomChange();
                this.handleZoomSpeed();
            });
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            script.onload = () => {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.minDistance = 50;
                this.controls.maxDistance = Infinity;
                this.controls.zoomSpeed = 1.0;
                this.controls.addEventListener('change', () => {
                    this.onZoomChange();
                    this.handleZoomSpeed();
                });
            };
            document.head.appendChild(script);
        }
    },
    
    handleZoomSpeed() {
        // Accelerate zoom when approaching planet (fast zoom in)
        // But only if not hovering over something (to prevent unwanted zoom)
        if (this.isHovering) {
            // Keep normal speed when hovering to prevent accidental zoom
            this.controls.zoomSpeed = 1.0;
            return;
        }
        
        const distance = this.camera.position.length();
        if (distance < 600 && distance > 150) {
            // Fast zoom in when approaching planet
            this.controls.zoomSpeed = 2.5;
        } else {
            // Normal consistent speed for zoom out
            this.controls.zoomSpeed = 1.0;
        }
    },
    
    createUniverse() {
        // Create starfield background
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            // Random positions in a large sphere
            const radius = 2000 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
            
            // Random star colors (white, blue, yellow)
            const color = Math.random();
            if (color < 0.7) {
                colors[i] = 1; colors[i + 1] = 1; colors[i + 2] = 1; // White
            } else if (color < 0.85) {
                colors[i] = 0.7; colors[i + 1] = 0.8; colors[i + 2] = 1; // Blue
            } else {
                colors[i] = 1; colors[i + 1] = 0.9; colors[i + 2] = 0.7; // Yellow
            }
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.universeObjects.push(stars);
        
        // Create distant galaxies (glowing orbs)
        for (let i = 0; i < 20; i++) {
            const galaxyGeometry = new THREE.SphereGeometry(50, 16, 16);
            const galaxyMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
                transparent: true,
                opacity: 0.3
            });
            const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
            
            const radius = 3000 + Math.random() * 2000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            galaxy.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            this.scene.add(galaxy);
            this.universeObjects.push(galaxy);
        }
        
        // Create Milky Way (large glowing band)
        const milkyWayGeometry = new THREE.TorusGeometry(2500, 200, 16, 100);
        const milkyWayMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a4a6a,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
        milkyWay.rotation.x = Math.PI / 4;
        this.scene.add(milkyWay);
        this.universeObjects.push(milkyWay);
        
        // Create planets in background
        const planetData = [
            { name: 'Mercury', color: 0x8c7853, size: 15, distance: 1800 },
            { name: 'Venus', color: 0xffc649, size: 20, distance: 2000 },
            { name: 'Mars', color: 0xcd5c5c, size: 18, distance: 2200 },
            { name: 'Jupiter', color: 0xd8ca9d, size: 40, distance: 2500 },
            { name: 'Saturn', color: 0xfad5a5, size: 35, distance: 2800 }
        ];
        
        planetData.forEach((planet, i) => {
            const planetGeometry = new THREE.SphereGeometry(planet.size, 32, 32);
            const planetMaterial = new THREE.MeshStandardMaterial({
                color: planet.color,
                emissive: planet.color,
                emissiveIntensity: 0.2
            });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            
            const angle = (i / planetData.length) * Math.PI * 2;
            planetMesh.position.set(
                Math.cos(angle) * planet.distance,
                0,
                Math.sin(angle) * planet.distance
            );
            
            this.scene.add(planetMesh);
            this.universeObjects.push(planetMesh);
        });
    },
    
    createPlanet() {
        // Create Earth-like planet with course regions
        const radius = 100;
        const segments = 64;
        
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Create texture for the planet with course regions
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Base ocean color
        ctx.fillStyle = '#1a4a6a';
        ctx.fillRect(0, 0, 2048, 1024);
        
        // This will be updated when courses are loaded
        this.planetTexture = new THREE.CanvasTexture(canvas);
        this.planetTexture.needsUpdate = true;
        
        const material = new THREE.MeshStandardMaterial({
            map: this.planetTexture,
            roughness: 0.7,
            metalness: 0.2,
            emissive: 0x000000,
            emissiveIntensity: 0.1
        });
        
        this.planet = new THREE.Mesh(geometry, material);
        this.planet.position.set(0, 0, 0);
        this.scene.add(this.planet);
        
        // Store reference for later updates
        this.planetMaterial = material;
        
        // Add atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.planet.add(atmosphere);
    },
    
    loadCourses() {
        const courses = window.getTranslatedCourses ? window.getTranslatedCourses() : (window.courses || []);
        
        // Color scheme for courses
        const courseColors = [
            { active: '#48bb78', coming: '#718096', undefined: '#4a5568' }, // Green/Grey
            { active: '#667eea', coming: '#9f7aea', undefined: '#6b7280' }, // Purple
            { active: '#ed8936', coming: '#f6ad55', undefined: '#718096' }, // Orange
            { active: '#38b2ac', coming: '#4fd1c7', undefined: '#4a5568' }, // Teal
            { active: '#f56565', coming: '#fc8181', undefined: '#6b7280' }, // Red
            { active: '#805ad5', coming: '#b794f4', undefined: '#718096' }, // Violet
        ];
        
        // Update planet texture with course regions - better distribution
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Base ocean - brighter so it's visible
        ctx.fillStyle = '#2a5a7a';
        ctx.fillRect(0, 0, 2048, 1024);
        
        // Draw continents/landmasses first
        ctx.fillStyle = '#3a6a4a';
        ctx.beginPath();
        ctx.ellipse(500, 300, 200, 150, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(1500, 400, 250, 180, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(800, 700, 180, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        
        courses.forEach((course, index) => {
            const colorSet = courseColors[index % courseColors.length];
            const isActive = true;
            const color = isActive ? colorSet.active : colorSet.coming;
            
            // Distribute courses across the planet surface (spherical coordinates)
            const lat = (index / courses.length) * Math.PI - Math.PI / 2; // -90 to 90 degrees
            const lon = (index * 137.508) % (Math.PI * 2); // Golden angle distribution
            
            // Convert to texture coordinates
            const x = (lon / (Math.PI * 2)) * 2048;
            const y = ((lat + Math.PI / 2) / Math.PI) * 1024;
            
            const width = 180;
            const height = 120;
            
            // Draw country-like shape with better visibility
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width * 0.7, y - height * 0.2);
            ctx.lineTo(x + width, y + height * 0.3);
            ctx.lineTo(x + width * 0.8, y + height);
            ctx.lineTo(x + width * 0.3, y + height * 0.9);
            ctx.lineTo(x - width * 0.1, y + height * 0.5);
            ctx.closePath();
            ctx.fill();
            
            // Add bright border for visibility
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Add course name when zoomed in (will be handled by zoom level)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(course.title.substring(0, 15), x + width / 2, y + height / 2);
            
            ctx.globalAlpha = 1.0;
            
            // Store course region data
            this.courseRegions.push({
                course: course,
                x: x,
                y: y,
                width: width,
                height: height,
                color: color,
                isActive: isActive,
                lat: lat,
                lon: lon
            });
            
            // Create 3D emoji/icon above the region
            this.createCourseIcon(course, index, courses.length, lat, lon);
        });
        
        // Update planet texture
        this.planetTexture.image = canvas;
        this.planetTexture.needsUpdate = true;
        
        // Force material update
        if (this.planetMaterial) {
            this.planetMaterial.map = this.planetTexture;
            this.planetMaterial.needsUpdate = true;
        }
    },
    
    createCourseIcon(course, index, total, lat, lon) {
        // Create 3D text sprite for course emoji/icon - larger and more visible
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Background circle for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(256, 256, 220, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = 'bold 240px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 12;
        ctx.strokeText(course.icon, 256, 256);
        ctx.fillText(course.icon, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            sizeAttenuation: true
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(40, 40, 1);
        
        // Position above the course region on the planet using spherical coordinates
        const radius = 110; // Slightly above planet surface
        const x = Math.cos(lat) * Math.cos(lon) * radius;
        const y = Math.sin(lat) * radius;
        const z = Math.cos(lat) * Math.sin(lon) * radius;
        
        sprite.position.set(x, y, z);
        
        // Make sprite always face camera
        sprite.lookAt(this.camera.position);
        
        sprite.userData = { course: course, index: index, lat: lat, lon: lon };
        this.scene.add(sprite);
        
        // Store sprite reference
        const regionIndex = this.courseRegions.findIndex(r => r.course.id === course.id);
        if (regionIndex >= 0) {
            this.courseRegions[regionIndex].sprite = sprite;
        }
        
        // Add floating animation
        sprite.userData.baseY = y;
        sprite.userData.basePosition = sprite.position.clone();
    },
    
    onZoomChange() {
        const distance = this.camera.position.length();
        
        // Update zoom level based on distance
        if (distance > 1000) {
            this.zoomLevel = 0; // Galaxy view
        } else if (distance > 300) {
            this.zoomLevel = 1; // Planet view
        } else if (distance > 150) {
            this.zoomLevel = 2; // Course regions visible
        } else {
            this.zoomLevel = 3; // Module detail view
        }
        
        // Update visibility of elements based on zoom level
        this.updateZoomLevel();
    },
    
    updateZoomLevel() {
        const distance = this.camera.position.length();
        
        // Always show planet
        if (this.planet) {
            this.planet.visible = true;
        }
        
        // Show/hide course icons and update planet visibility based on zoom
        this.courseRegions.forEach(region => {
            if (region.sprite) {
                if (this.zoomLevel >= 1 && distance < 2000) {
                    region.sprite.visible = true;
                    // Scale based on zoom - larger when closer
                    const scale = Math.max(30, 80 - (distance / 15));
                    region.sprite.scale.set(scale, scale, 1);
                    
                    // Make sprite face camera
                    if (this.camera) {
                        region.sprite.lookAt(this.camera.position);
                    }
                } else {
                    region.sprite.visible = false;
                }
            }
            
            // Show/hide temples based on zoom level
            if (region.temple) {
                if (this.zoomLevel >= 3 && distance < 150) {
                    region.temple.visible = true;
                    // Make temple children visible too
                    region.temple.traverse((child) => {
                        if (child.isMesh) {
                            child.visible = true;
                        }
                    });
                } else {
                    region.temple.visible = false;
                }
            }
            
            // Show/hide module markers
            if (region.modules) {
                region.modules.forEach(moduleMarker => {
                    if (this.zoomLevel >= 3 && distance < 120) {
                        moduleMarker.visible = true;
                    } else {
                        moduleMarker.visible = false;
                    }
                });
            }
        });
        
        // Increase planet emissive when zoomed in for better visibility
        if (this.planetMaterial) {
            if (this.zoomLevel >= 2) {
                this.planetMaterial.emissiveIntensity = 0.4;
            } else {
                this.planetMaterial.emissiveIntensity = 0.2;
            }
        }
        
        // Hide popups when zooming
        this.hideCourseInfo();
        this.hideTempleInfo();
    },
    
    setupInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isHovering = false; // Track hover state
        
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.hideCourseInfo();
            this.hideTempleInfo();
        });
    },
    
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Only check for hover if not scrolling/zooming
        // Check if mouse is moving (not just stationary)
        const now = Date.now();
        if (!this.lastMouseMoveTime) {
            this.lastMouseMoveTime = now;
        }
        const timeSinceLastMove = now - this.lastMouseMoveTime;
        this.lastMouseMoveTime = now;
        
        // Skip hover detection if mouse just moved (might be scrolling)
        if (timeSinceLastMove < 50) {
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        let hoveredSomething = false;
        
        // Check for temple intersections first (when zoomed in)
        const templeIntersects = this.raycaster.intersectObjects(
            this.courseRegions.filter(r => r.temple && r.temple.visible).map(r => r.temple)
        );
        
        if (templeIntersects.length > 0) {
            const temple = templeIntersects[0].object;
            this.showTempleInfo(temple.userData, event);
            this.isHovering = true;
            hoveredSomething = true;
        }
        
        // Check for sprite/emoji intersections
        if (!hoveredSomething) {
            const spriteIntersects = this.raycaster.intersectObjects(
                this.courseRegions.filter(r => r.sprite && r.sprite.visible).map(r => r.sprite)
            );
            
            if (spriteIntersects.length > 0) {
                const hoveredSprite = spriteIntersects[0].object;
                const baseScale = Math.max(30, 80 - (this.camera.position.length() / 15));
                hoveredSprite.scale.set(baseScale * 1.2, baseScale * 1.2, 1);
                this.showCourseInfo(hoveredSprite.userData.course, event);
                this.isHovering = true;
                hoveredSomething = true;
            }
        }
        
        // Hide popups if not hovering anything
        if (!hoveredSomething) {
            this.isHovering = false;
            this.hideCourseInfo();
            this.hideTempleInfo();
            // Reset scales
            this.courseRegions.forEach(region => {
                if (region.sprite && region.sprite.visible) {
                    const distance = this.camera.position.length();
                    const scale = Math.max(30, 80 - (distance / 15));
                    region.sprite.scale.set(scale, scale, 1);
                }
            });
        }
    },
    
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const distance = this.camera.position.length();
        
        // Check for temple click first (when zoomed in very close)
        const templeIntersects = this.raycaster.intersectObjects(
            this.courseRegions.filter(r => r.temple).map(r => r.temple)
        );
        
        if (templeIntersects.length > 0) {
            const temple = templeIntersects[0].object;
            this.openTempleContent(temple.userData);
            return;
        }
        
        // Check for sprite/emoji click
        const spriteIntersects = this.raycaster.intersectObjects(
            this.courseRegions.filter(r => r.sprite).map(r => r.sprite)
        );
        
        if (spriteIntersects.length > 0) {
            const course = spriteIntersects[0].object.userData.course;
            this.zoomToCourse(course, spriteIntersects[0].object);
            return;
        }
        
        // Check for planet/region click (only if zoomed in enough to see regions)
        if (distance < 200) {
            const planetIntersects = this.raycaster.intersectObject(this.planet);
            if (planetIntersects.length > 0) {
                // Find which course region was clicked based on texture coordinates
                const point = planetIntersects[0].point;
                const region = this.findRegionAtPoint(point);
                if (region && distance < 120) {
                    // Zoomed in enough - open that specific region/module
                    this.openRegionContent(region);
                } else if (region) {
                    // Not zoomed in enough - zoom to course
                    const sprite = region.sprite;
                    if (sprite) {
                        this.zoomToCourse(region.course, sprite);
                    }
                }
            }
        }
    },
    
    findRegionAtPoint(point) {
        // Convert 3D point to spherical coordinates, then find matching region
        const radius = 100;
        const normalized = point.clone().normalize();
        const lat = Math.asin(normalized.y);
        const lon = Math.atan2(normalized.z, normalized.x);
        
        // Find closest region
        let closestRegion = null;
        let minDistance = Infinity;
        
        this.courseRegions.forEach(region => {
            if (region.lat !== undefined && region.lon !== undefined) {
                const latDiff = Math.abs(lat - region.lat);
                const lonDiff = Math.abs(lon - region.lon);
                const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestRegion = region;
                }
            }
        });
        
        return closestRegion;
    },
    
    zoomToCourse(course, sprite) {
        // Smoothly zoom to the course - but don't open it yet
        const targetPosition = sprite.position.clone().multiplyScalar(1.3);
        const startPosition = this.camera.position.clone();
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            this.camera.lookAt(sprite.position);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Create temple and modules when landed
                const region = this.courseRegions.find(r => r.course.id === course.id);
                if (region && !region.temple) {
                    this.createTempleAndModules(region);
                }
            }
        };
        
        animate();
    },
    
    createTempleAndModules(region) {
        // Create a temple at the center of the region - larger and more visible
        const templeGroup = new THREE.Group();
        
        // Temple base - larger
        const baseGeometry = new THREE.CylinderGeometry(12, 15, 8, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37, // Gold color
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0xd4af37,
            emissiveIntensity: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 4;
        base.castShadow = true;
        base.receiveShadow = true;
        templeGroup.add(base);
        
        // Temple pillars - taller
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const pillarGeometry = new THREE.CylinderGeometry(1.5, 1.8, 18, 8);
            const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
            pillar.position.set(
                Math.cos(angle) * 8,
                9,
                Math.sin(angle) * 8
            );
            pillar.castShadow = true;
            templeGroup.add(pillar);
        }
        
        // Temple roof - larger
        const roofGeometry = new THREE.ConeGeometry(16, 12, 8);
        const roof = new THREE.Mesh(roofGeometry, baseMaterial);
        roof.position.y = 18;
        roof.rotation.y = Math.PI / 8;
        roof.castShadow = true;
        templeGroup.add(roof);
        
        // Add glowing orb on top for visibility
        const orbGeometry = new THREE.SphereGeometry(2, 16, 16);
        const orbMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1.0
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.y = 24;
        templeGroup.add(orb);
        
        // Position temple at region center
        const radius = 100;
        const x = Math.cos(region.lat) * Math.cos(region.lon) * radius;
        const y = Math.sin(region.lat) * radius;
        const z = Math.cos(region.lat) * Math.sin(region.lon) * radius;
        templeGroup.position.set(x, y, z);
        
        templeGroup.userData = {
            course: region.course,
            region: region
        };
        
        // Make temple visible when created (will be controlled by zoom level)
        templeGroup.visible = true;
        
        this.scene.add(templeGroup);
        region.temple = templeGroup;
        
        // Create module regions around the temple
        if (region.course.modules_data && region.course.modules_data.length > 0) {
            region.course.modules_data.forEach((module, index) => {
                this.createModuleRegion(region, module, index);
            });
        }
    },
    
    createModuleRegion(region, module, index) {
        // Create a small region marker for each module
        const moduleGeometry = new THREE.CylinderGeometry(2, 2, 1, 8);
        const moduleMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            emissive: 0x667eea,
            emissiveIntensity: 0.3
        });
        const moduleMarker = new THREE.Mesh(moduleGeometry, moduleMaterial);
        
        // Position modules in a circle around the temple
        const angle = (index / (region.course.modules_data.length || 8)) * Math.PI * 2;
        const radius = 100;
        const x = Math.cos(region.lat) * Math.cos(region.lon) * radius;
        const y = Math.sin(region.lat) * radius;
        const z = Math.cos(region.lat) * Math.sin(region.lon) * radius;
        
        const offsetRadius = 15;
        moduleMarker.position.set(
            x + Math.cos(angle) * offsetRadius,
            y,
            z + Math.sin(angle) * offsetRadius
        );
        
        moduleMarker.userData = {
            module: module,
            course: region.course,
            region: region
        };
        
        this.scene.add(moduleMarker);
        
        if (!region.modules) {
            region.modules = [];
        }
        region.modules.push(moduleMarker);
    },
    
    openTempleContent(templeData) {
        // Open the course when temple is clicked
        if (window.loadCourse && templeData.course) {
            window.loadCourse(templeData.course.id);
        }
    },
    
    openRegionContent(region) {
        // Open specific module/region content
        // For now, just open the course - can be extended to show module details
        if (window.loadCourse && region.course) {
            window.loadCourse(region.course.id);
        }
    },
    
    showTempleInfo(templeData, event) {
        let popup = document.getElementById('temple-info-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'temple-info-popup';
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
                border: 2px solid #d4af37;
            `;
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏛️</div>
            <div style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">${templeData.course.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;">Click to enter course</div>
            <div style="font-size: 0.8rem; opacity: 0.7;">
                ${templeData.course.modules} modules available
            </div>
        `;
        
        popup.style.left = event.clientX + 'px';
        popup.style.top = event.clientY + 'px';
        popup.style.display = 'block';
    },
    
    hideTempleInfo() {
        const popup = document.getElementById('temple-info-popup');
        if (popup) {
            popup.style.display = 'none';
        }
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
            `;
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${course.icon}</div>
            <div style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">${course.title}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">${course.description}</div>
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
    
    addUI() {
        const ui = document.createElement('div');
        ui.id = 'universe-view-ui';
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
            <div style="margin-bottom: 0.5rem; font-weight: bold;">🌌 Universe View</div>
            <div>🖱️ Drag to rotate • Scroll to zoom</div>
            <div>👆 Hover courses • Click to explore</div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">
                Zoom in to see course details
            </div>
        `;
        this.container.appendChild(ui);
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate planet slowly
        if (this.planet) {
            this.planet.rotation.y += 0.002;
        }
        
        // Animate course icons (floating)
        this.courseRegions.forEach(region => {
            if (region.sprite) {
                const time = Date.now() * 0.001;
                region.sprite.position.y = region.sprite.userData.baseY + Math.sin(time + region.sprite.userData.index) * 5;
            }
        });
        
        // Rotate universe objects slowly
        this.universeObjects.forEach(obj => {
            if (obj.rotation) {
                obj.rotation.y += 0.0001;
            }
        });
        
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

// Initialize when universe view mode is selected
window.initUniverseView = function() {
    if (typeof ViewModeManager !== 'undefined' && ViewModeManager.getCurrentMode() === 'universe') {
        setTimeout(() => {
            if (typeof UniverseView !== 'undefined') {
                UniverseView.init();
            }
        }, 500);
    }
};

