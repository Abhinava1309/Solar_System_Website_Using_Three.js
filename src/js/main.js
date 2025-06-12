// Solar System 3D Simulation
class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Animation state
        this.isPaused = false;
        this.isDarkMode = true;
        this.globalSpeedMultiplier = 1.0;
        
        // Planets data with realistic properties
        this.planetsData = [
            {
                name: 'Mercury',
                radius: 0.8,
                distance: 15,
                color: 0x8C7853,
                rotationSpeed: 0.02,
                orbitSpeed: 0.04,
                description: 'The smallest planet and closest to the Sun. Mercury has extreme temperature variations.',
                facts: {
                    'Distance from Sun': '57.9 million km',
                    'Orbital Period': '88 Earth days',
                    'Day Length': '59 Earth days',
                    'Moons': '0'
                }
            },
            {
                name: 'Venus',
                radius: 1.2,
                distance: 22,
                color: 0xFFC649,
                rotationSpeed: -0.01,
                orbitSpeed: 0.035,
                description: 'The hottest planet with a thick, toxic atmosphere. Venus rotates backwards.',
                facts: {
                    'Distance from Sun': '108.2 million km',
                    'Orbital Period': '225 Earth days',
                    'Day Length': '243 Earth days',
                    'Moons': '0'
                }
            },
            {
                name: 'Earth',
                radius: 1.3,
                distance: 30,
                color: 0x6B93D6,
                rotationSpeed: 0.02,
                orbitSpeed: 0.03,
                description: 'Our home planet, the only known planet with life. Has one natural satellite.',
                facts: {
                    'Distance from Sun': '149.6 million km',
                    'Orbital Period': '365.25 days',
                    'Day Length': '24 hours',
                    'Moons': '1'
                }
            },
            {
                name: 'Mars',
                radius: 1.0,
                distance: 40,
                color: 0xCD5C5C,
                rotationSpeed: 0.018,
                orbitSpeed: 0.024,
                description: 'The Red Planet, named for its rusty color. Mars has the largest volcano in the solar system.',
                facts: {
                    'Distance from Sun': '227.9 million km',
                    'Orbital Period': '687 Earth days',
                    'Day Length': '24.6 hours',
                    'Moons': '2'
                }
            },
            {
                name: 'Jupiter',
                radius: 4.0,
                distance: 60,
                color: 0xD8CA9D,
                rotationSpeed: 0.04,
                orbitSpeed: 0.013,
                description: 'The largest planet, a gas giant with a Great Red Spot storm and many moons.',
                facts: {
                    'Distance from Sun': '778.5 million km',
                    'Orbital Period': '11.9 Earth years',
                    'Day Length': '9.9 hours',
                    'Moons': '95+'
                }
            },
            {
                name: 'Saturn',
                radius: 3.5,
                distance: 85,
                color: 0xFAD5A5,
                rotationSpeed: 0.038,
                orbitSpeed: 0.009,
                description: 'Famous for its spectacular ring system. Saturn is less dense than water.',
                facts: {
                    'Distance from Sun': '1.43 billion km',
                    'Orbital Period': '29.5 Earth years',
                    'Day Length': '10.7 hours',
                    'Moons': '146+'
                }
            },
            {
                name: 'Uranus',
                radius: 2.5,
                distance: 110,
                color: 0x4FD0E7,
                rotationSpeed: 0.03,
                orbitSpeed: 0.006,
                description: 'An ice giant tilted on its side. Uranus has faint rings and rotates sideways.',
                facts: {
                    'Distance from Sun': '2.87 billion km',
                    'Orbital Period': '84 Earth years',
                    'Day Length': '17.2 hours',
                    'Moons': '27'
                }
            },
            {
                name: 'Neptune',
                radius: 2.4,
                distance: 135,
                color: 0x4B70DD,
                rotationSpeed: 0.032,
                orbitSpeed: 0.005,
                description: 'The windiest planet with supersonic winds. Neptune is the farthest planet from the Sun.',
                facts: {
                    'Distance from Sun': '4.50 billion km',
                    'Orbital Period': '165 Earth years',
                    'Day Length': '16.1 hours',
                    'Moons': '16'
                }
            }
        ];
        
        this.planets = [];
        this.orbitLines = [];
        this.sun = null;
        this.stars = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createSun();
        this.createPlanets();
        this.createOrbitLines();
        this.createStars();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 100);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
        this.scene.add(ambientLight);
        
        // Point light from the sun
        const sunLight = new THREE.PointLight(0xffffff, 2, 300);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFDB813,
            emissive: 0xFDB813,
            emissiveIntensity: 0.3
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // Add sun glow effect
        const glowGeometry = new THREE.SphereGeometry(7, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFDB813,
            transparent: true,
            opacity: 0.1
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(sunGlow);
    }
    
    createPlanets() {
        this.planetsData.forEach((planetData, index) => {
            const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
            const planetMaterial = new THREE.MeshLambertMaterial({
                color: planetData.color
            });
            
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.position.x = planetData.distance;
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.userData = { ...planetData, index };
            
            // Create orbit group
            const orbitGroup = new THREE.Group();
            orbitGroup.add(planet);
            this.scene.add(orbitGroup);
            
            this.planets.push({
                mesh: planet,
                orbitGroup: orbitGroup,
                data: planetData,
                currentOrbitSpeed: planetData.orbitSpeed,
                currentRotationSpeed: planetData.rotationSpeed
            });
            
            // Add special features for specific planets
            if (planetData.name === 'Earth') {
                this.addEarthMoon(orbitGroup, planetData.distance);
            } else if (planetData.name === 'Saturn') {
                this.addSaturnRings(planet);
            }
        });
    }
    
    addEarthMoon(earthOrbitGroup, earthDistance) {
        const moonGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const moonMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        const moonOrbitGroup = new THREE.Group();
        moon.position.x = 3;
        moonOrbitGroup.add(moon);
        moonOrbitGroup.position.x = earthDistance;
        earthOrbitGroup.add(moonOrbitGroup);
        
        // Store moon reference for animation
        this.earthMoon = { orbitGroup: moonOrbitGroup, mesh: moon };
    }
    
    addSaturnRings(saturnMesh) {
        const ringGeometry = new THREE.RingGeometry(4, 7, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xD2B48C,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        saturnMesh.add(rings);
    }
    
    createOrbitLines() {
        this.planetsData.forEach(planetData => {
            const orbitGeometry = new THREE.RingGeometry(
                planetData.distance - 0.1,
                planetData.distance + 0.1,
                128
            );
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            
            const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbitLine.rotation.x = Math.PI / 2;
            this.scene.add(orbitLine);
            this.orbitLines.push(orbitLine);
        });
    }
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 10000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: false
        });
        
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    setupControls() {
        // Mouse controls for camera
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        let currentRotationX = 0;
        let currentRotationY = 0;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                targetRotationY += deltaX * 0.01;
                targetRotationX += deltaY * 0.01;
                targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));
                
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
            
            // Update mouse position for raycasting
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        // Zoom control
        canvas.addEventListener('wheel', (event) => {
            const zoomSpeed = 5;
            const direction = event.deltaY > 0 ? 1 : -1;
            
            this.camera.position.multiplyScalar(1 + direction * zoomSpeed * 0.01);
            
            // Limit zoom
            const distance = this.camera.position.length();
            if (distance < 20) {
                this.camera.position.normalize().multiplyScalar(20);
            } else if (distance > 300) {
                this.camera.position.normalize().multiplyScalar(300);
            }
        });
        
        // Update camera rotation
        const updateCamera = () => {
            currentRotationX += (targetRotationX - currentRotationX) * 0.05;
            currentRotationY += (targetRotationY - currentRotationY) * 0.05;
            
            const distance = this.camera.position.length();
            this.camera.position.x = distance * Math.sin(currentRotationY) * Math.cos(currentRotationX);
            this.camera.position.y = distance * Math.sin(currentRotationX);
            this.camera.position.z = distance * Math.cos(currentRotationY) * Math.cos(currentRotationX);
            
            this.camera.lookAt(0, 0, 0);
            
            requestAnimationFrame(updateCamera);
        };
        updateCamera();
        
        // Planet click detection
        canvas.addEventListener('click', (event) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                this.planets.map(p => p.mesh)
            );
            
            if (intersects.length > 0) {
                const clickedPlanet = intersects[0].object;
                this.focusOnPlanet(clickedPlanet);
            }
        });
        
        // Hover detection
        canvas.addEventListener('mousemove', (event) => {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(
                this.planets.map(p => p.mesh)
            );
            
            if (intersects.length > 0) {
                const hoveredPlanet = intersects[0].object;
                this.showPlanetInfo(hoveredPlanet.userData);
                canvas.style.cursor = 'pointer';
            } else {
                this.hidePlanetInfo();
                canvas.style.cursor = 'default';
            }
        });
    }
    
    setupEventListeners() {
        // Generate planet controls
        this.generatePlanetControls();
        
        // Pause/Resume button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Theme toggle
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Global speed control
        const globalSpeedSlider = document.getElementById('global-speed');
        globalSpeedSlider.addEventListener('input', (e) => {
            this.globalSpeedMultiplier = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = this.globalSpeedMultiplier.toFixed(1) + 'x';
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    generatePlanetControls() {
        const controlsContainer = document.getElementById('planet-controls');
        
        this.planetsData.forEach((planet, index) => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';
            
            controlGroup.innerHTML = `
                <label>${planet.name}</label>
                <div class="speed-control">
                    <input type="range" class="speed-slider" 
                           min="0" max="3" step="0.1" value="1"
                           data-planet="${index}">
                    <span class="speed-value">1.0x</span>
                </div>
            `;
            
            controlsContainer.appendChild(controlGroup);
            
            // Add event listener
            const slider = controlGroup.querySelector('.speed-slider');
            const valueDisplay = controlGroup.querySelector('.speed-value');
            
            slider.addEventListener('input', (e) => {
                const multiplier = parseFloat(e.target.value);
                const planetIndex = parseInt(e.target.dataset.planet);
                
                this.planets[planetIndex].currentOrbitSpeed = 
                    this.planetsData[planetIndex].orbitSpeed * multiplier;
                this.planets[planetIndex].currentRotationSpeed = 
                    this.planetsData[planetIndex].rotationSpeed * multiplier;
                
                valueDisplay.textContent = multiplier.toFixed(1) + 'x';
            });
        });
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pause-btn');
        btn.textContent = this.isPaused ? 'Resume' : 'Pause';
        btn.classList.toggle('active', this.isPaused);
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const btn = document.getElementById('theme-btn');
        
        if (this.isDarkMode) {
            this.scene.background = new THREE.Color(0x000011);
            btn.textContent = 'Light Mode';
            this.stars.visible = true;
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            btn.textContent = 'Dark Mode';
            this.stars.visible = false;
        }
        
        btn.classList.toggle('active', !this.isDarkMode);
    }
    
    focusOnPlanet(planetMesh) {
        const planetData = planetMesh.userData;
        const targetDistance = planetData.distance + planetData.radius * 5;
        
        gsap.to(this.camera.position, {
            duration: 2,
            x: targetDistance * 1.2,
            y: planetData.radius * 2,
            z: targetDistance * 0.8,
            ease: "power2.inOut"
        });
    }
    
    showPlanetInfo(planetData) {
        const infoPanel = document.getElementById('info-panel');
        const planetName = document.getElementById('planet-name');
        const planetDetails = document.getElementById('planet-details');
        
        planetName.textContent = planetData.name;
        
        let detailsHTML = `<p>${planetData.description}</p>`;
        for (const [key, value] of Object.entries(planetData.facts)) {
            detailsHTML += `<div class="planet-info"><strong>${key}:</strong> ${value}</div>`;
        }
        
        planetDetails.innerHTML = detailsHTML;
        infoPanel.classList.add('visible');
    }
    
    hidePlanetInfo() {
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.remove('visible');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isPaused) {
            const deltaTime = this.clock.getDelta();
            
            // Rotate sun
            if (this.sun) {
                this.sun.rotation.y += 0.005;
            }
            
            // Animate planets
            this.planets.forEach((planet) => {
                // Orbit animation
                planet.orbitGroup.rotation.y += 
                    planet.currentOrbitSpeed * this.globalSpeedMultiplier * deltaTime * 10;
                
                // Planet rotation
                planet.mesh.rotation.y += 
                    planet.currentRotationSpeed * this.globalSpeedMultiplier * deltaTime * 10;
            });
            
            // Animate Earth's moon
            if (this.earthMoon) {
                this.earthMoon.orbitGroup.rotation.y += 0.1 * this.globalSpeedMultiplier * deltaTime * 10;
                this.earthMoon.mesh.rotation.y += 0.05 * this.globalSpeedMultiplier * deltaTime * 10;
            }
            
            // Subtle star rotation
            if (this.stars) {
                this.stars.rotation.y += 0.0001;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when the page loads
window.addEventListener('load', () => {
    new SolarSystem();
});