import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
); // field of view, aspect ratio, near, far

const renderer = new THREE.WebGLRenderer({
    // Create the renderer
    canvas: document.querySelector("#bg"),
});

// Set the renderer size and camera position
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);
renderer.render(scene, camera);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Load the texture and set it as the background
const textureLoader = new THREE.TextureLoader();
const backTexture = textureLoader.load("/space.jpg");

// Setting intial geometry and material for the sun and planets
const geometrySun = new THREE.SphereGeometry(10, 32, 32);
const geometryPlanet = new THREE.SphereGeometry(4, 15, 15);
const material = new THREE.MeshStandardMaterial({ color: 0x006600 });
const sun = new THREE.Mesh(geometrySun, material);

// Add the initial sun
scene.add(sun);
sun.position.set(0, 0, 0);

// Add lighting to the scene
const pointLight = new THREE.PointLight(0xffffff, 1000, 1000);
pointLight.position.set(5, 20, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight, pointLight);
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

// Generate random stars
function stars() {
    // Define the star geometry and material once
    const geometryStar = new THREE.SphereGeometry(0.8, 24, 24);
    const materialStar = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const generateStars = () => {
        // Nested function for generating stars
        const star = new THREE.Mesh(geometryStar, materialStar);
        const [x, y, z] = Array(3)
            .fill()
            .map(() => THREE.MathUtils.randFloatSpread(2000));
        star.position.set(x, y, z);
        scene.add(star);
    };
    Array(1000).fill().forEach(generateStars); // Set star amount
}
stars();
// Add planet functionality

function addPlanets(planets) {
    let planetCount = document.getElementById("planet-count").value;
    // Remove all planet frames
    for (const p of planets) {
        scene.remove(p);
    }
    const planetSize = document.getElementById("planet-size").value;
    console.log(planetCount);
    let initialPlanetDistance = 45; // Distance of first planet from sun
    const planetsArray =[];
    for (let i = 0; i < planetCount; i++) { // Loop through count and set new planets
        const planet = new THREE.Mesh(geometryPlanet, material);
        planet.position.set(initialPlanetDistance, 0, 0);
        planet.scale.set(planetSize, planetSize, planetSize);
        initialPlanetDistance += 75;
        planetsArray.push(planet);
    }
    console.log(planetsArray);
    return planetsArray;
}

// Init planets array
 let planets =[];

// Function to animate the scene/loop
function animate() { 
    planets = addPlanets(planets);
    for (const p of planets) {
        scene.add(p);
        let orbitRadius = 45;
        for (const p of planets) {        
            const date = Date.now() * 0.001;
            p.position.set(
                Math.cos(date) * orbitRadius,
                0,
                Math.sin(date) * orbitRadius
            );
            orbitRadius += 45;
        }
        
    }
    requestAnimationFrame(animate);
    sun.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
animate();
