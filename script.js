// Import required libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

// Main Three.js variables
let scene, camera, renderer;
let controls, character;
let clock = new THREE.Clock();
let mixer;
let activeModel = null;

// Character movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Portfolio content
const portfolioContent = {
  experience: {
    title: "Professional Experience",
    items: [
      {
        title: "Senior Software Engineer",
        subtitle: "Tech Innovations Inc | 2020 - Present",
        description: "Led development of scalable web applications using React, Node.js, and AWS. Implemented microservices architecture resulting in 40% improved performance."
      },
      {
        title: "Full Stack Developer",
        subtitle: "Digital Solutions | 2018 - 2020",
        description: "Built responsive front-end interfaces and RESTful APIs. Optimized database queries leading to 30% faster page load times."
      }
    ]
  },
  projects: {
    title: "Featured Projects",
    items: [
      {
        title: "AI-Powered Analytics Dashboard",
        subtitle: "React, Python, TensorFlow",
        description: "A real-time analytics platform leveraging machine learning algorithms for predictive insights, helping businesses make data-driven decisions."
      },
      {
        title: "E-Commerce Platform",
        subtitle: "Next.js, MongoDB, Stripe",
        description: "A scalable online shopping platform with secure payment processing, inventory management, and order fulfillment systems."
      }
    ]
  },
  skills: {
    title: "Technical Skills",
    items: [
      {
        title: "Frontend Development",
        subtitle: "",
        description: "React, Vue.js, HTML5, CSS3, JavaScript, TypeScript, Responsive Design, UI/UX Principles"
      },
      {
        title: "Backend Development",
        subtitle: "",
        description: "Node.js, Python, Java, Express, Django, RESTful APIs, GraphQL"
      },
      {
        title: "Database & Cloud",
        subtitle: "",
        description: "MongoDB, PostgreSQL, MySQL, AWS, Google Cloud, Docker, Kubernetes"
      }
    ]
  }
};

// Initialize the app when the page is loaded
window.addEventListener('load', init);

function init() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f172a'); // Dark blue for night sky
  scene.fog = new THREE.FogExp2('#0f172a', 0.02);

  // Create the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  // Create the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);

  // Add lights
  addLights();
  
  // Create environment
  createEnvironment();
  
  // Add stars
  addStars();
  
  // Create character
  createCharacter();
  
  // Add interactive portfolio objects
  addPortfolioObjects();
  
  // Set up orbit controls (for development/testing)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enabled = false; // We'll enable custom controls instead
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Set up info panel close button
  document.querySelector('.close-button').addEventListener('click', closeInfoPanel);
  
  // Start the animation loop
  animate();
  
  // Simulate loading
  simulateLoading();
}

function addLights() {
  // Ambient light for overall scene illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);
  
  // Directional light for shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);
  
  // Purple point light for atmosphere
  const purpleLight = new THREE.PointLight(0xb39ddb, 1, 20);
  purpleLight.position.set(0, 10, 0);
  scene.add(purpleLight);
  
  // Add multiple distant lights to simulate stars
  for (let i = 0; i < 5; i++) {
    const x = (Math.random() - 0.5) * 50;
    const y = Math.random() * 10 + 5;
    const z = (Math.random() - 0.5) * 50;
    
    const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
    const intensity = Math.random() * 0.5 + 0.5;
    const distance = Math.random() * 20 + 10;
    
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(x, y, z);
    scene.add(light);
  }
}

function createEnvironment() {
  // Create desert floor
  const floorGeometry = new THREE.PlaneGeometry(500, 500, 128, 128);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#e0c097', // Sandy color
    roughness: 1,
    metalness: 0,
  });
  
  // Add displacement to create dunes
  const vertices = floorGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i);
    const y = vertices.getY(i);
    
    // Create gentle rolling dunes
    const amplitude = 1.5;
    const frequency = 0.05;
    const z = amplitude * Math.sin(x * frequency) * Math.cos(y * frequency);
    
    vertices.setZ(i, z);
  }
  
  floorGeometry.computeVertexNormals();
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);
  
  // Add distant mountains
  createMountains();
}

function createMountains() {
  // Create distant mountains for horizon
  const mountainMaterial = new THREE.MeshStandardMaterial({
    color: '#475569', // Slate color
    roughness: 1,
    metalness: 0,
  });
  
  // Create multiple mountain ranges
  for (let i = 0; i < 3; i++) {
    const range = createMountainRange(i);
    const mountain = new THREE.Mesh(range, mountainMaterial);
    mountain.position.y = -0.5;
    mountain.position.z = -40 - i * 15; // Position mountains on the horizon
    scene.add(mountain);
  }
}

function createMountainRange(rangeIndex) {
  const vertices = [];
  const indices = [];
  
  const width = 200;
  const depth = 20;
  const segments = 100;
  
  // Generate mountain peaks
  for (let x = 0; x <= segments; x++) {
    for (let z = 0; z <= 1; z++) {
      const xPos = (x / segments) * width - width / 2;
      const zPos = z * depth;
      
      // Randomize height based on perlin-like noise
      let height = 0;
      const frequency = 0.1;
      const amplitude = 10 + rangeIndex * 5;
      
      for (let o = 0; o < 3; o++) {
        const noiseFreq = frequency * Math.pow(2, o);
        const noiseAmp = amplitude * Math.pow(0.5, o);
        height += Math.sin(xPos * noiseFreq + rangeIndex * 10) * noiseAmp;
      }
      
      // Ensure front of range is at ground level
      if (z === 0) {
        height = Math.max(0, height - 5);
      }
      
      vertices.push(xPos, height, -zPos);
    }
  }
  
  // Create faces
  for (let x = 0; x < segments; x++) {
    const a = x * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    
    // Two triangles per segment
    indices.push(a, b, c);
    indices.push(c, b, d);
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  return geometry;
}

function addStars() {
  // Create particles for stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  const starsCount = 5000;
  const starsPositions = [];
  
  for (let i = 0; i < starsCount; i++) {
    // Distribute stars in a dome shape above the scene
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 100 + Math.random() * 50;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = Math.abs(radius * Math.cos(phi)); // Only above horizon
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    starsPositions.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPositions, 3));
  
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

function createCharacter() {
  // For now, create a simple character placeholder
  // We can replace this with a proper 3D model later
  const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
  const material = new THREE.MeshStandardMaterial({ color: '#7e22ce' });
  
  character = new THREE.Mesh(geometry, material);
  character.position.y = 0.75; // Half height above ground
  character.castShadow = true;
  scene.add(character);
}

function addPortfolioObjects() {
  // Add three interactive objects to represent portfolio sections
  
  // Experience object - Dodecahedron
  const experienceGeometry = new THREE.DodecahedronGeometry(1);
  const experienceMaterial = new THREE.MeshStandardMaterial({
    color: '#9333ea',
    emissive: '#4c1d95',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const experienceObject = new THREE.Mesh(experienceGeometry, experienceMaterial);
  experienceObject.position.set(-5, 1.5, -5);
  experienceObject.castShadow = true;
  experienceObject.userData = { 
    type: 'experience',
    hover: false,
    rotate: true
  };
  scene.add(experienceObject);
  
  // Projects object - Torus Knot
  const projectsGeometry = new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16);
  const projectsMaterial = new THREE.MeshStandardMaterial({
    color: '#10b981',
    emissive: '#065f46',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const projectsObject = new THREE.Mesh(projectsGeometry, projectsMaterial);
  projectsObject.position.set(0, 1.5, -8);
  projectsObject.castShadow = true;
  projectsObject.userData = { 
    type: 'projects',
    hover: false,
    rotate: true
  };
  scene.add(projectsObject);
  
  // Skills object - Icosahedron
  const skillsGeometry = new THREE.IcosahedronGeometry(1);
  const skillsMaterial = new THREE.MeshStandardMaterial({
    color: '#3b82f6',
    emissive: '#1e40af',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  
  const skillsObject = new THREE.Mesh(skillsGeometry, skillsMaterial);
  skillsObject.position.set(5, 1.5, -5);
  skillsObject.castShadow = true;
  skillsObject.userData = { 
    type: 'skills',
    hover: false,
    rotate: true
  };
  scene.add(skillsObject);
  
  // Add raycaster for object interaction
  setupInteraction();
}

function setupInteraction() {
  // Create raycaster for mouse interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Handle mouse movement for hover effects
  window.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);
    
    // Reset cursor
    document.body.style.cursor = 'auto';
    
    // Reset all objects hover state
    scene.traverse((object) => {
      if (object.userData && object.userData.hover !== undefined) {
        object.userData.hover = false;
      }
    });
    
    // Set hover state for intersected object
    if (intersects.length > 0) {
      const object = intersects[0].object;
      
      if (object.userData && object.userData.type) {
        document.body.style.cursor = 'pointer';
        object.userData.hover = true;
      }
    }
  });
  
  // Handle click events
  window.addEventListener('click', (event) => {
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      
      if (object.userData && object.userData.type) {
        // Set active model and display info panel
        activeModel = object;
        openInfoPanel(object.userData.type);
        
        // Move character to the object
        moveCharacterToObject(object);
      }
    }
  });
}

function moveCharacterToObject(object) {
  // Calculate position in front of the object
  const targetPosition = new THREE.Vector3();
  targetPosition.copy(object.position);
  
  // Move slightly in front of the object
  const distanceFromObject = 3;
  const directionToCharacter = new THREE.Vector3();
  directionToCharacter.subVectors(character.position, object.position).normalize();
  targetPosition.addScaledVector(directionToCharacter, distanceFromObject);
  targetPosition.y = 0.75; // Keep character at ground level
  
  // Animate movement using GSAP
  gsap.to(character.position, {
    x: targetPosition.x,
    z: targetPosition.z,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      // Make character face the object
      character.lookAt(object.position.x, character.position.y, object.position.z);
    }
  });
  
  // Make camera follow
  gsap.to(camera.position, {
    x: targetPosition.x,
    z: targetPosition.z + 5,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(object.position);
    }
  });
}

function openInfoPanel(type) {
  const panel = document.querySelector('.info-panel');
  const content = panel.querySelector('.info-content');
  
  // Clear previous content
  content.innerHTML = '';
  
  // Get content based on type
  const data = portfolioContent[type];
  
  // Create content HTML
  const header = document.createElement('h2');
  header.textContent = data.title;
  content.appendChild(header);
  
  // Add items
  data.items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title;
    itemDiv.appendChild(title);
    
    if (item.subtitle) {
      const subtitle = document.createElement('div');
      subtitle.className = 'subtitle';
      subtitle.textContent = item.subtitle;
      itemDiv.appendChild(subtitle);
    }
    
    const description = document.createElement('div');
    description.className = 'description';
    description.textContent = item.description;
    itemDiv.appendChild(description);
    
    content.appendChild(itemDiv);
  });
  
  // Show panel
  panel.classList.add('active');
  panel.style.pointerEvents = 'all';
}

function closeInfoPanel() {
  const panel = document.querySelector('.info-panel');
  panel.classList.remove('active');
  panel.style.pointerEvents = 'none';
  activeModel = null;
}

function onKeyDown(event) {
  switch (event.code) {
    case 'KeyW':
      moveForward = true;
      break;
    case 'KeyS':
      moveBackward = true;
      break;
    case 'KeyA':
      moveLeft = true;
      break;
    case 'KeyD':
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
  }
}

function updateCharacter() {
  // Only update if no active model (not in viewing mode)
  if (activeModel) return;
  
  const delta = clock.getDelta();
  
  // Movement logic
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();
  
  // Update velocity based on direction
  const speed = 5;
  if (moveForward || moveBackward) {
    velocity.z -= direction.z * speed * delta;
  } else {
    velocity.z *= 0.9; // Damping
  }
  
  if (moveLeft || moveRight) {
    velocity.x -= direction.x * speed * delta;
  } else {
    velocity.x *= 0.9; // Damping
  }
  
  // Apply movement
  character.position.x += velocity.x;
  character.position.z += velocity.z;
  
  // Face movement direction
  if (direction.x !== 0 || direction.z !== 0) {
    character.rotation.y = Math.atan2(direction.x, direction.z);
  }
  
  // Update camera to follow character
  camera.position.x = character.position.x;
  camera.position.z = character.position.z + 5;
  camera.position.y = character.position.y + 2;
  camera.lookAt(character.position);
}

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update character position
  updateCharacter();
  
  // Animate objects rotation
  scene.traverse((object) => {
    if (object.userData && object.userData.rotate) {
      // Regular rotation
      object.rotation.y += delta * 0.5;
      
      // Add floating effect if hovered
      if (object.userData.hover) {
        object.position.y = object.userData.originalY || object.position.y;
        object.position.y += Math.sin(clock.getElapsedTime() * 2) * 0.05;
      }
    }
  });
  
  // Animate desert dunes
  scene.traverse((object) => {
    if (object.geometry && object.geometry.type === 'PlaneGeometry') {
      const positions = object.geometry.attributes.position;
      const time = clock.getElapsedTime() * 0.05;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        if (i % 5 === 0) { // Only update some vertices for performance
          // Add subtle wave motion
          const amplitude = 0.05;
          const frequency = 0.02;
          const originalZ = positions.getZ(i);
          const z = originalZ + amplitude * Math.sin(time + x * frequency) * 0.01;
          
          positions.setZ(i, z);
        }
      }
      
      positions.needsUpdate = true;
    }
  });
  
  // Update controls if enabled
  if (controls.enabled) {
    controls.update();
  }
  
  // Render scene
  renderer.render(scene, camera);
}

function onWindowResize() {
  // Update camera aspect ratio and projection matrix
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function simulateLoading() {
  const loadingScreen = document.querySelector('.loading-screen');
  const progressBar = document.querySelector('.progress-bar');
  
  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Hide loading screen
      setTimeout(() => {
        loadingScreen.style.opacity = 0;
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 1000);
      }, 500);
    }
    
    progressBar.style.width = `${progress}%`;
  }, 200);
}