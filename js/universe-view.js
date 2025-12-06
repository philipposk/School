// Universe View Manager - Galaxy/Planet view with courses as countries
// Courses are represented as countries on a globe, with zoom levels showing modules

const UniverseView = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    courseRegions: [],
    zoomLevel: 0, // 0 = galaxy view, 1 = planet view, 2 = course regions, 3 = neighborhoods, 4 = modules
    selectedCourse: null,
    selectedRegion: null,
    selectedNeighborhood: null,
    container: null,
    universeObjects: [],
    isLanding: false,
    isLanded: false,
    walkingControls: null,
    otherPlanets: [], // Store references to background planets
    lastCameraPosition: null,
    lastCameraMovementTime: null,
    autoReturnTimer: null,
    isReturningToMainPlanet: false,
    mainPlanetLabelVisible: false,
    travelingStars: null, // Particle system for traveling stars
    travelingStarsGeometry: null,
    travelingStarsMaterial: null,
    isTravelingAway: false,
    travelSpeed: 0,
    
    init() {
        // Add roundRect polyfill if not available
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.lineTo(x + width - radius, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.lineTo(x + width, y + height - radius);
                this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.lineTo(x + radius, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.lineTo(x, y + radius);
                this.quadraticCurveTo(x, y, x + radius, y);
                this.closePath();
            };
        }
        
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
        this.camera.position.set(0, 0, 1500); // Start at medium distance to see the planet
        this.camera.lookAt(0, 0, 0); // Look at the planet
    },
    
    setupRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Solid background
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 1); // Black background
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);
    },
    
    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 10; // Allow very close zoom for module details
            this.controls.maxDistance = Infinity; // Allow infinite zoom out
            this.controls.target.set(0, 0, 0); // Look at planet
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
                this.controls.minDistance = 10; // Allow very close zoom for module details
                this.controls.maxDistance = Infinity;
                this.controls.target.set(0, 0, 0); // Look at planet
                this.controls.zoomSpeed = 1.0;
                this.controls.addEventListener('change', () => {
                    this.onZoomChange();
                    this.handleZoomSpeed();
                });
            };
            document.head.appendChild(script);
        }
    },
    
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse hex to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
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
            this.otherPlanets.push(planetMesh); // Store reference for auto-return detection
        });
        
        // Create traveling stars effect (for infinite travel illusion)
        this.createTravelingStars();
    },
    
    createTravelingStars() {
        // Create efficient particle system for traveling stars
        // Limited particles that recycle to avoid memory issues
        const particleCount = 300; // Small number, recycled
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Initialize stars in front of camera (will move towards camera)
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Random position in front of camera
            positions[i3] = (Math.random() - 0.5) * 2000; // X
            positions[i3 + 1] = (Math.random() - 0.5) * 2000; // Y
            positions[i3 + 2] = Math.random() * 5000 + 100; // Z (in front)
            
            // Random sizes for variety
            sizes[i] = Math.random() * 3 + 1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Material for traveling stars
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.travelingStars = new THREE.Points(geometry, material);
        this.travelingStars.visible = false; // Hidden by default
        this.travelingStars.renderOrder = -1; // Render behind other objects
        this.scene.add(this.travelingStars);
        
        // Store references for updates
        this.travelingStarsGeometry = geometry;
        this.travelingStarsMaterial = material;
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
            emissive: 0x4a9eff, // Bright blue glow
            emissiveIntensity: 0.5 // Much brighter than other planets
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
        
        // Ensure we have courses to display
        if (!courses || courses.length === 0) {
            console.warn('No courses found for Universe view');
            // Still update planet texture with base ocean color
            if (this.planetTexture) {
                this.planetTexture.needsUpdate = true;
            }
            return;
        }
        
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
            
            // Ensure consistent region sizes for all courses
            const width = 200; // Slightly larger for better text fit
            const height = 140; // Slightly taller for better text fit
            
            // Ensure regions don't go outside canvas bounds
            const safeX = Math.max(width * 0.2, Math.min(x, 2048 - width * 0.8));
            const safeY = Math.max(height * 0.2, Math.min(y, 1024 - height * 0.8));
            
            // Draw smooth, rounded country-like shape (not weird polygons)
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.9;
            const radius = Math.min(width, height) * 0.3;
            ctx.beginPath();
            ctx.roundRect(safeX, safeY, width, height, radius);
            ctx.fill();
            
            // Add bright border for visibility
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Store text for later rendering (will be drawn dynamically based on zoom)
            // Don't draw text here - it will be drawn dynamically based on zoom level
            
            ctx.globalAlpha = 1.0;
            
            // Create hierarchical structure: Course -> Regions -> Neighborhoods -> Modules
            // Divide course into regions (like Greece has Ipeiros, Veroia, Kalamata)
            const subRegions = this.createCourseRegions(course, lat, lon);
            
            // Store course region data (use safe coordinates)
            this.courseRegions.push({
                course: course,
                x: safeX,
                y: safeY,
                width: width,
                height: height,
                color: color,
                isActive: isActive,
                lat: lat,
                lon: lon,
                regions: subRegions, // Sub-regions within this course
                neighborhoods: [] // Will be populated when zoomed in
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
    
    // Create regions within a course (like Ipeiros, Veroia, Kalamata in Greece)
    createCourseRegions(course, courseLat, courseLon) {
        const regions = [];
        
        // Divide course modules into regions (3-4 modules per region)
        const modulesPerRegion = 3;
        const modules = course.modules_data || [];
        
        for (let i = 0; i < modules.length; i += modulesPerRegion) {
            const regionModules = modules.slice(i, i + modulesPerRegion);
            const regionIndex = Math.floor(i / modulesPerRegion);
            
            // Calculate position for this region within the course
            const angle = (regionIndex / Math.max(1, Math.ceil(modules.length / modulesPerRegion))) * Math.PI * 2;
            const offsetDistance = 0.1; // Small offset from course center
            
            const regionLat = courseLat + Math.cos(angle) * offsetDistance;
            const regionLon = courseLon + Math.sin(angle) * offsetDistance;
            
            regions.push({
                id: `region_${course.id}_${regionIndex}`,
                name: this.generateRegionName(course, regionIndex),
                modules: regionModules,
                lat: regionLat,
                lon: regionLon,
                neighborhoods: [] // Will be populated when zoomed in
            });
        }
        
        return regions;
    },
    
    // Generate region names (like Ipeiros, Veroia, Kalamata)
    generateRegionName(course, index) {
        // Use Greek city names or module-based names
        const greekCities = ['Ιπείρος', 'Βέροια', 'Καλαμάτα', 'Θεσσαλονίκη', 'Αθήνα', 'Πάτρα', 'Λάρισα', 'Ηράκλειο'];
        if (index < greekCities.length) {
            return greekCities[index];
        }
        // Fallback to module-based names
        const modules = course.modules_data || [];
        if (modules[index * 3]) {
            return modules[index * 3].title.substring(0, 15);
        }
        return `Region ${index + 1}`;
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
            sizeAttenuation: true,
            opacity: 1.0 // Start fully visible
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.userData.material = spriteMaterial; // Store reference for opacity updates
        sprite.scale.set(40, 40, 1);
        
        // Position above the course region on the planet using spherical coordinates
        const radius = 110; // Slightly above planet surface
        const x = Math.cos(lat) * Math.cos(lon) * radius;
        const y = Math.sin(lat) * radius;
        const z = Math.cos(lat) * Math.sin(lon) * radius;
        
        sprite.position.set(x, y, z);
        
        sprite.userData = { 
            course: course, 
            index: index, 
            lat: lat, 
            lon: lon,
            baseY: y,
            basePosition: new THREE.Vector3(x, y, z)
        };
        
        // Add sprite as child of planet so it rotates with the planet
        this.planet.add(sprite);
        
        // Store sprite reference
        const regionIndex = this.courseRegions.findIndex(r => r.course.id === course.id);
        if (regionIndex >= 0) {
            this.courseRegions[regionIndex].sprite = sprite;
        }
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
    
    // Helper function to wrap text to multiple lines
    wrapText(ctx, text, maxWidth, x, y, lineHeight) {
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

        // Draw lines
        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + (index * lineHeight));
        });

        return lines.length;
    },
    
    // Update planet texture with course names based on zoom level
    updatePlanetTexture() {
        if (!this.planetTexture || !this.courseRegions.length) return;
        
        const distance = this.camera.position.length();
        
        // Use higher resolution when zoomed in close for better detail
        let canvasWidth = 2048;
        let canvasHeight = 1024;
        let scaleFactor = 1;
        
        if (distance < 200) {
            canvasWidth = 4096;
            canvasHeight = 2048;
            scaleFactor = 2;
        } else if (distance < 400) {
            canvasWidth = 3072;
            canvasHeight = 1536;
            scaleFactor = 1.5;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Base ocean
        ctx.fillStyle = '#2a5a7a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw "School" and "6x7.gr" label when viewed from far away
        if (distance > 800) {
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${80 * scaleFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add text shadow for visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 10 * scaleFactor;
            ctx.shadowOffsetX = 3 * scaleFactor;
            ctx.shadowOffsetY = 3 * scaleFactor;
            
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            const lineHeight = 100 * scaleFactor;
            
            // Draw "School" on first line
            ctx.fillText('School', centerX, centerY - lineHeight / 2);
            
            // Draw "6x7.gr" on second line
            ctx.font = `bold ${60 * scaleFactor}px Arial`;
            ctx.fillText('6x7.gr', centerX, centerY + lineHeight / 2);
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            this.mainPlanetLabelVisible = true;
        } else {
            this.mainPlanetLabelVisible = false;
        }
        
        // Draw continents/landmasses (scaled)
        ctx.fillStyle = '#3a6a4a';
        ctx.beginPath();
        ctx.ellipse(500 * scaleFactor, 300 * scaleFactor, 200 * scaleFactor, 150 * scaleFactor, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(1500 * scaleFactor, 400 * scaleFactor, 250 * scaleFactor, 180 * scaleFactor, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(800 * scaleFactor, 700 * scaleFactor, 180 * scaleFactor, 120 * scaleFactor, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Determine font size, border width, and text visibility based on zoom
        // Text becomes gradually more visible as you approach
        let fontSize = 20;
        let borderWidth = 4;
        let showText = false;
        let textOpacity = 0;
        
        if (distance < 200) {
            // Very close - full visibility, large text
            fontSize = 48 * scaleFactor;
            borderWidth = 8 * scaleFactor;
            showText = true;
            textOpacity = 1.0;
        } else if (distance < 300) {
            // Close - full visibility, medium-large text
            fontSize = 36 * scaleFactor;
            borderWidth = 6 * scaleFactor;
            showText = true;
            textOpacity = 1.0;
        } else if (distance < 500) {
            // Mid distance - full visibility, medium text
            fontSize = 28 * scaleFactor;
            borderWidth = 5 * scaleFactor;
            showText = true;
            textOpacity = 1.0;
        } else if (distance < 800) {
            // Far but visible - gradually fade in
            fontSize = 22 * scaleFactor;
            borderWidth = 4 * scaleFactor;
            showText = true;
            // Fade in from 800 to 500 distance
            textOpacity = Math.max(0, (800 - distance) / 300); // 0 at 800, 1 at 500
        } else if (distance < 1200) {
            // Very far - start fading in
            fontSize = 18 * scaleFactor;
            borderWidth = 3 * scaleFactor;
            showText = true;
            // Very faint, gradually appearing
            textOpacity = Math.max(0, (1200 - distance) / 400); // 0 at 1200, 1 at 800
        } else {
            // Too far - no text visible
            borderWidth = 3 * scaleFactor;
            showText = false;
            textOpacity = 0;
        }
        
        // Draw course regions
        this.courseRegions.forEach(region => {
            const { x, y, width, height, color, course } = region;
            
            // Scale coordinates for higher resolution
            const scaledX = x * scaleFactor;
            const scaledY = y * scaleFactor;
            const scaledWidth = width * scaleFactor;
            const scaledHeight = height * scaleFactor;
            
            // Ensure region fits within canvas bounds
            const safeScaledX = Math.max(scaledWidth * 0.2, Math.min(scaledX, canvasWidth - scaledWidth * 0.8));
            const safeScaledY = Math.max(scaledHeight * 0.2, Math.min(scaledY, canvasHeight - scaledHeight * 0.8));
            
            // Draw smooth, rounded country-like shape (not weird polygons)
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.95;
            
            // Use rounded rectangle with smooth curves instead of weird polygons
            const centerX = safeScaledX + scaledWidth / 2;
            const centerY = safeScaledY + scaledHeight / 2;
            const radius = Math.min(scaledWidth, scaledHeight) * 0.3;
            
            ctx.beginPath();
            ctx.roundRect(safeScaledX, safeScaledY, scaledWidth, scaledHeight, radius);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Add bright, thick border for visibility
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = borderWidth;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Add inner border for extra definition when zoomed in
            if (distance < 300) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = borderWidth * 0.5;
                ctx.stroke();
            }
            
            // Draw course name - show full name with proper contrast and gradual visibility
            if (showText && course.title && textOpacity > 0) {
                // Calculate text color based on region color brightness for contrast
                const rgb = this.hexToRgb(color);
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                const textColor = brightness > 128 ? '#000000' : '#ffffff'; // Dark text on light bg, light text on dark bg
                
                // Apply opacity to text (gradual fade-in as you approach)
                ctx.save();
                ctx.globalAlpha = textOpacity;
                ctx.fillStyle = textColor;
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add contrasting text shadow for readability (also with opacity)
                const shadowColor = brightness > 128 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = 4 * scaleFactor;
                ctx.shadowOffsetX = 2 * scaleFactor;
                ctx.shadowOffsetY = 2 * scaleFactor;
                
                const textX = safeScaledX + scaledWidth / 2;
                const textY = safeScaledY + scaledHeight / 2;
                const maxTextWidth = scaledWidth * 0.9; // More space for text
                const maxHeight = scaledHeight * 0.8; // More vertical space
                const lineHeight = fontSize * 1.2;
                const maxLines = Math.max(3, Math.floor(maxHeight / lineHeight)); // Allow up to 3 lines
                
                // Always show full course name, wrap to multiple lines
                this.wrapText(ctx, course.title, maxTextWidth, textX, textY - ((Math.min(maxLines, 3) - 1) * lineHeight / 2), lineHeight);
                
                // Reset shadow and restore context
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.restore();
            }
            
            ctx.globalAlpha = 1.0;
        });
        
        // Update texture
        this.planetTexture.image = canvas;
        this.planetTexture.needsUpdate = true;
        if (this.planetMaterial) {
            this.planetMaterial.map = this.planetTexture;
            this.planetMaterial.needsUpdate = true;
        }
    },
    
    updateZoomLevel() {
        const distance = this.camera.position.length();
        
        // Update planet texture with appropriate text size based on zoom
        this.updatePlanetTexture();
        
        // Always show planet
        if (this.planet) {
            this.planet.visible = true;
        }
        
        // Show/hide course icons and update planet visibility based on zoom
        this.courseRegions.forEach(region => {
            if (region.sprite) {
                // Make sprite always face camera (update each frame since planet rotates)
                // Get world position since sprite is child of planet
                if (this.camera) {
                    const worldPos = new THREE.Vector3();
                    region.sprite.getWorldPosition(worldPos);
                    region.sprite.lookAt(this.camera.position);
                }
                
                // Emojis visible when far/mid distance, fade out when zooming in close
                if (this.zoomLevel >= 1 && distance > 200) {
                    // Far/mid distance - show emojis clearly
                    region.sprite.visible = true;
                    const scale = Math.max(30, 80 - (distance / 15));
                    region.sprite.scale.set(scale, scale, 1);
                    if (region.sprite.material) {
                        region.sprite.material.opacity = 1.0;
                    }
                } else if (distance <= 200 && distance > 150) {
                    // Transition zone - fade out emojis
                    region.sprite.visible = true;
                    const scale = Math.max(20, 50 - (distance / 20));
                    region.sprite.scale.set(scale, scale, 1);
                    // Fade out opacity as we zoom in
                    const opacity = (distance - 150) / 50; // 1.0 at 200, 0.0 at 150
                    if (region.sprite.material) {
                        region.sprite.material.opacity = Math.max(0, Math.min(1, opacity));
                    }
                } else {
                    // Close distance - hide emojis completely so countries are visible
                    region.sprite.visible = false;
                    if (region.sprite.material) {
                        region.sprite.material.opacity = 0;
                    }
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
        
        // Increase planet emissive and improve material properties when zoomed in for better visibility
        if (this.planetMaterial) {
            if (distance < 200) {
                this.planetMaterial.emissiveIntensity = 0.5;
                this.planetMaterial.roughness = 0.5; // Less rough = more reflective/shiny
                this.planetMaterial.metalness = 0.3;
            } else if (distance < 400) {
                this.planetMaterial.emissiveIntensity = 0.3;
                this.planetMaterial.roughness = 0.6;
                this.planetMaterial.metalness = 0.2;
            } else {
                this.planetMaterial.emissiveIntensity = 0.1;
                this.planetMaterial.roughness = 0.7;
                this.planetMaterial.metalness = 0.2;
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
        // Smooth landing animation like 3D World mode
        this.isLanding = true;
        
        // Get world position since sprite is child of planet
        const worldPos = new THREE.Vector3();
        sprite.getWorldPosition(worldPos);
        
        // Calculate landing position - closer to surface for better view
        const landingDistance = 120; // Close enough to see details
        const direction = worldPos.clone().normalize();
        const targetPosition = direction.multiplyScalar(landingDistance);
        
        const startPosition = this.camera.position.clone();
        const duration = 2500; // Slightly longer for smoother landing
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function (ease-out cubic)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // Smooth camera movement
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            
            // Update world position each frame since planet rotates
            const currentWorldPos = new THREE.Vector3();
            sprite.getWorldPosition(currentWorldPos);
            this.camera.lookAt(currentWorldPos);
            
            // Update controls target
            if (this.controls) {
                this.controls.target.lerpVectors(this.controls.target.clone(), currentWorldPos, ease * 0.1);
                this.controls.update();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Landing complete
                this.isLanding = false;
                this.isLanded = true;
                this.selectedCourse = course;
                
                // Create temple, regions, and modules when landed
                const courseRegion = this.courseRegions.find(r => r.course.id === course.id);
                if (courseRegion) {
                    if (!courseRegion.temple) {
                        this.createTempleAndModules(courseRegion);
                    }
                    // Create regions within the course
                    this.createSubRegions(courseRegion);
                }
            }
        };
        
        animate();
    },
    
    // Create sub-regions within a course (like Ipeiros, Veroia, Kalamata)
    createSubRegions(courseRegion) {
        if (!courseRegion.regions || courseRegion.regions.length === 0) return;
        
        courseRegion.regions.forEach((region, index) => {
            // Create visual representation of region on planet surface
            const radius = 100;
            const x = Math.cos(region.lat) * Math.cos(region.lon) * radius;
            const y = Math.sin(region.lat) * radius;
            const z = Math.cos(region.lat) * Math.sin(region.lon) * radius;
            
            // Create region marker
            const regionGeometry = new THREE.CylinderGeometry(3, 3, 2, 8);
            const regionMaterial = new THREE.MeshStandardMaterial({
                color: courseRegion.color,
                emissive: courseRegion.color,
                emissiveIntensity: 0.4
            });
            const regionMarker = new THREE.Mesh(regionGeometry, regionMaterial);
            regionMarker.position.set(x, y, z);
            regionMarker.userData = {
                region: region,
                courseRegion: courseRegion
            };
            
            // Make region marker child of planet
            this.planet.add(regionMarker);
            region.marker = regionMarker;
        });
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
    
    // Track camera movement to detect when user stops moving towards other planets
    trackCameraMovement() {
        if (!this.camera || this.isReturningToMainPlanet) return;
        
        const currentPos = this.camera.position.clone();
        const currentTime = Date.now();
        
        // Check if camera is moving
        if (this.lastCameraPosition) {
            const movement = currentPos.distanceTo(this.lastCameraPosition);
            const timeSinceLastMove = currentTime - (this.lastCameraMovementTime || currentTime);
            
            // If camera moved significantly, reset timer
            if (movement > 1) {
                this.lastCameraMovementTime = currentTime;
                this.lastCameraPosition = currentPos;
                
                // Check if moving towards other planets
                const distanceToMainPlanet = currentPos.length();
                const isLookingAtOtherPlanet = this.isLookingAtOtherPlanet();
                
                // If far from main planet and looking at other planet, start auto-return timer
                if (distanceToMainPlanet > 1000 && isLookingAtOtherPlanet) {
                    this.startAutoReturnTimer();
                } else {
                    this.clearAutoReturnTimer();
                }
            } else {
                // Camera not moving - check if should auto-return
                if (timeSinceLastMove > 3000) { // 3 seconds of no movement
                    const distanceToMainPlanet = currentPos.length();
                    const isLookingAtOtherPlanet = this.isLookingAtOtherPlanet();
                    
                    if (distanceToMainPlanet > 1000 && isLookingAtOtherPlanet) {
                        this.returnToMainPlanet();
                    }
                }
            }
        } else {
            this.lastCameraPosition = currentPos;
            this.lastCameraMovementTime = currentTime;
        }
    },
    
    // Check if camera is looking at/moving towards other planets
    isLookingAtOtherPlanet() {
        if (!this.camera || this.otherPlanets.length === 0) return false;
        
        const cameraPos = this.camera.position;
        const distanceToMainPlanet = cameraPos.length();
        
        // If very close to main planet, not looking at other planets
        if (distanceToMainPlanet < 1000) return false;
        
        // Check if any other planet is closer than main planet
        for (let planet of this.otherPlanets) {
            const planetPos = planet.position;
            const distanceToPlanet = cameraPos.distanceTo(planetPos);
            
            // If other planet is significantly closer, user is looking at it
            if (distanceToPlanet < distanceToMainPlanet * 0.8) {
                return true;
            }
        }
        
        return false;
    },
    
    // Start auto-return timer
    startAutoReturnTimer() {
        if (this.autoReturnTimer) return; // Already started
        
        this.autoReturnTimer = setTimeout(() => {
            this.returnToMainPlanet();
        }, 3000); // 3 seconds
    },
    
    // Clear auto-return timer
    clearAutoReturnTimer() {
        if (this.autoReturnTimer) {
            clearTimeout(this.autoReturnTimer);
            this.autoReturnTimer = null;
        }
    },
    
    // Smoothly return to panoramic view of main planet
    returnToMainPlanet() {
        if (this.isReturningToMainPlanet) return;
        
        this.isReturningToMainPlanet = true;
        this.clearAutoReturnTimer();
        
        // Target position: panoramic view from far away
        const targetDistance = 2000; // Far enough to see the whole planet
        const targetPosition = new THREE.Vector3(0, 0, targetDistance);
        
        const startPosition = this.camera.position.clone();
        const startTime = Date.now();
        const duration = 3000; // 3 second animation
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing
            const ease = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            this.camera.position.lerpVectors(startPosition, targetPosition, ease);
            
            // Look at main planet
            this.camera.lookAt(0, 0, 0);
            
            // Update controls target
            if (this.controls) {
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                this.isReturningToMainPlanet = false;
                this.lastCameraPosition = this.camera.position.clone();
                this.lastCameraMovementTime = Date.now();
            }
        };
        
        animate();
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Ensure renderer and camera exist before rendering
        if (!this.renderer || !this.camera || !this.scene) {
            return;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Track camera movement for auto-return
        if (typeof this.trackCameraMovement === 'function') {
            this.trackCameraMovement();
        }
        
        // Update traveling stars effect
        if (typeof this.updateTravelingStars === 'function') {
            this.updateTravelingStars();
        }
        
        // Update zoom level check
        const currentDistance = this.camera.position.length();
        if (Math.abs(currentDistance - (this.lastDistance || 0)) > 10) {
            this.onZoomChange();
            this.lastDistance = currentDistance;
        }
        
        // Rotate planet very slowly - much slower for better viewing
        if (this.planet) {
            const distance = this.camera.position.length();
            // Much slower rotation - one full rotation every 5-10 minutes
            if (distance > 1000) {
                this.planet.rotation.y += 0.00005; // Very slow from far away
            } else if (distance > 500) {
                this.planet.rotation.y += 0.0001; // Slow from mid distance
            } else {
                this.planet.rotation.y += 0.0002; // Still slow when close
            }
        }
        
        // Animate course icons (floating) - update Y position relative to base
        this.courseRegions.forEach(region => {
            if (region.sprite && region.sprite.userData.baseY !== undefined) {
                const time = Date.now() * 0.001;
                // Keep sprite floating animation but maintain base position
                const basePos = region.sprite.userData.basePosition;
                if (basePos) {
                    region.sprite.position.set(
                        basePos.x,
                        basePos.y + Math.sin(time + (region.sprite.userData.index || 0)) * 5,
                        basePos.z
                    );
                }
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

