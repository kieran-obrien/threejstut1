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
const materialSun = new THREE.MeshStandardMaterial({ color: 0xffaa0d });
const material = new THREE.MeshStandardMaterial({ color: 0x006600 });
const sun = new THREE.Mesh(geometrySun, materialSun);

// Add the initial sun
scene.add(sun);
sun.position.set(0, 0, 0);

// Add lighting to the scene
const pointLight = new THREE.PointLight(0xffffff, 1000, 1000);
pointLight.position.set(5, 20, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight, pointLight);
const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

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

class Planet {
    constructor(size, distanceFromLast, orbitSpeed, mesh) {
        this.size = size;
        this.distance = distanceFromLast;
        this.speed = orbitSpeed;
        this.mesh = mesh;
        this.inOrbit = false;
    }
    updatePlanetSize(size) {
        this.mesh.scale.set(size, size, size);
    }
}

function getPlanet() {
    return new Planet(1, 45, 0.01, new THREE.Mesh(geometryPlanet, material));
}
const planetsArrayNew = Array(10).fill().map(getPlanet);
console.log(planetsArrayNew);
console.log(planetsArrayNew[0]);

// Add planet functionality
let planetCount = 0;
function handlePlanets(planets) {
    // Remove all planet size forms

    const planetSizeDiv = document.getElementById("planet-size-div");
    const updatePlanetSize = (index) => {
        const size = document.getElementById(`planet-size-${index}`).value;
        planets[index].updatePlanetSize(size);
    };
    window.updatePlanetSize = updatePlanetSize;

    // Add planet size forms
    let planetCountCheck = planetCount;
    planetCount = document.getElementById("planet-count").value;
    if (planetCountCheck !== planetCount) {
        console.log("Planet count changed");
        console.log(planetCount);
        const allPlanets = document.querySelectorAll("#planet-size-div form");
        allPlanets.forEach((p) => p.remove());
        for (let i = 0; i < planetCount; i++) {
            const form = document.createElement("form");
            form.innerHTML = `<label for="planet-size">Planet ${
                i + 1
            } Size</label>
                <input onchange="updatePlanetSize(${i})"
                    type="range"
                    id="planet-size-${i}"
                    name="planet-size"
                    min="1"
                    max="10"
                    value="1"
                />`;
            planetSizeDiv.appendChild(form);
        }
    }

    // Add the planets
    for (let i = 0; i < planets.length; i++) {
        if (scene.children.includes(planets[i].mesh)) {
            scene.remove(planets[i].mesh);
        }
        if (i < planetCount) {
            scene.add(planets[i].mesh);
        }
    }
}

// Function to animate the scene/loop
function animate() {
    handlePlanets(planetsArrayNew);
    let orbitRadius = 45;
    for (const p of planetsArrayNew) {
        const date = Date.now() * 0.001;
        p.mesh.position.set(
            Math.cos(date) * orbitRadius,
            0,
            Math.sin(date) * orbitRadius
        );
        orbitRadius += 45;
    }
    requestAnimationFrame(animate);
    sun.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
animate();
