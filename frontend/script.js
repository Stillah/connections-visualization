import * as THREE from 'three';

// Visualisation of package location on World map using Three.js 
let scene, camera, renderer, mapPlane;

// Initialize Three.js scene
function initThreeJS() {
  const container = document.getElementById('map-container');

  // Create the scene
  scene = new THREE.Scene();

  // Create the orthographic camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  const frustumSize = 9; // Adjust this value to control the zoom level
  camera = new THREE.OrthographicCamera(
    -frustumSize * aspectRatio / 2, // left
    frustumSize * aspectRatio / 2,  // right
    frustumSize / 2,                // top
    -frustumSize / 2,               // bottom
    0.1,                            // near
    1000                            // far
  );
  camera.position.z = 10; // Position the camera above the plane

  // Create the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  // Create a plane for the world map
  const textureLoader = new THREE.TextureLoader();
  const mapTexture = textureLoader.load('assets/other_map.png');
  const mapAspectRatio = 2; // Replace with the actual aspect ratio of your map image
  const geometry = new THREE.PlaneGeometry(10 * mapAspectRatio, 10);
  const material = new THREE.MeshBasicMaterial({ map: mapTexture });
  mapPlane = new THREE.Mesh(geometry, material);
  scene.add(mapPlane);

  // Render the scene
  animate();
}

// Handle window resize
function onWindowResize() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const frustumSize = 10; // Keep this consistent with the camera initialization
  camera.left = -frustumSize * aspectRatio / 2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Convert latitude and longitude to Three.js plane coordinates
function latLngToXY(lat, lng, planeWidth, planeHeight) {
  const x = (lng + 180) / 360 * planeWidth - planeWidth / 2;
  const y = (90 + lat) / 180 * planeHeight - planeHeight / 2; // Invert the latitude calculation
  return { x, y };
}

// Place a dot on the Three.js plane
function placeDot(lat, lng) {
  const dotGeometry = new THREE.SphereGeometry(0.025, 16, 16);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(44, 129, 44)' });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);

  const { x, y } = latLngToXY(lat, lng, mapPlane.geometry.parameters.width, mapPlane.geometry.parameters.height);
  dot.position.set(x, y, 0.1);
  scene.add(dot);

  let green = 129;
  let red = 44;
  const colorChangeInterval = setInterval(() => {
    if (green > 0) {
      green -= 5;
      red += 5;
      dot.material.color.set(`rgb(${red}, ${green}, 44)`);
    } else {
      clearInterval(colorChangeInterval);
    }
  }, 150);
}

initThreeJS();




// Counter and fetch logic remain unchanged
let totalConnections = 0;
let startTime = Date.now(); // Record the start time
let connectionsInLastSecond = 0;
let lastSecondTimestamp = null;
let previousTimestamp = null;

function updateCounter() {
  const counterElement = document.getElementById('connection-counter');
  counterElement.textContent = `Connections in the last second: ${connectionsInLastSecond}`;
}

function resetCounter() {
  updateCounter();
  totalConnections += connectionsInLastSecond; // Add to total connections

  // Calculate the average connections per second
  const elapsedTime = (Date.now() - startTime) / 1000; // Elapsed time in seconds
  const averageConnections = (totalConnections / elapsedTime).toFixed(2);

  // Update the average connections box
  const averageCounterElement = document.getElementById('average-connections');
  averageCounterElement.textContent = `Average connections per second: ${averageConnections}`;

  connectionsInLastSecond = 0; // Reset the counter for the last second
}

setInterval(resetCounter, 1000);

async function fetchData() {
  try {
    const response = await fetch('http://localhost:8080/get_packages', { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let delay = 0;
    if (!data.suspicious) {
      placeDot(data.Latitude, data.Longitude);

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (lastSecondTimestamp === null || currentTimestamp === lastSecondTimestamp) {
        connectionsInLastSecond++;
      } else {
        lastSecondTimestamp = currentTimestamp;
        connectionsInLastSecond = 1;
      }

      if (previousTimestamp !== null) {
        delay = data.Timestamp - previousTimestamp;
      }
      previousTimestamp = data.Timestamp;
    } else {
      console.log('Identified suspicious connection.');
      delay = 0;
    }

    delay = Math.max(delay, 0);
    setTimeout(fetchData, delay);
  } catch (error) {
    setTimeout(fetchData, 1000);
    console.error('Error fetching data:', error);
  }
}

fetchData();