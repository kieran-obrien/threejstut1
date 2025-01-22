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

// Set planet class
class Planet {
    constructor(size, distanceFromLast, orbitSpeed, mesh) {
        this.size = size;
        this.distance = distanceFromLast;
        this.speed = orbitSpeed;
        this.previousSpeed = orbitSpeed;
        this.mesh = mesh;
        this.inOrbit = false;
        this.name = "";
    }
    updatePlanetSize(size) {
        this.mesh.scale.set(size, size, size);
    }
    updatePlanetSpeed(speed) {
        let targetSpeed = speed;
        console.log(this.speed, this.previousSpeed);
        this.previousSpeed = this.speed;
        this.speed = speed;
        console.log(this.speed, this.previousSpeed);
        /*const transitionDuration = 1000; // Duration of the transition in milliseconds
        const startTime = Date.now();
        const startSpeed = this.previousSpeed;
        const endSpeed = targetSpeed;

        const animateTransition = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / transitionDuration, 1);
            this.speed = startSpeed + (endSpeed - startSpeed) * progress;

            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            }
        };

        animateTransition();
        */
    }
}

// Create and populate array of ten planet objects
function getPlanet() {
    return new Planet(1, 45, 0.0005, new THREE.Mesh(geometryPlanet, material));
}
const planetsArray = Array(10).fill().map(getPlanet);
for (let i = 1; i < planetsArray.length + 1; i++) {
    planetsArray[i - 1].name = `Planet ${i}`;
}
console.log(planetsArray);
console.log(planetsArray[0]);

// Add planet functionality
let planetCount = 0;
function handlePlanets(planets) {
    // Update planet size
    const updatePlanetSize = (index) => {
        const size = document.getElementById(`planet-size-${index}`).value;
        planets[index].updatePlanetSize(size);
    };
    window.updatePlanetSize = updatePlanetSize;

    // Update planet orbit speed
    const updatePlanetSpeed = (index) => {
        const speed = document.getElementById(`orbit-speed-${index}`).value;
        planets[index].updatePlanetSpeed(speed / 5000);
    };
    window.updatePlanetSpeed = updatePlanetSpeed;

    // Add planet control forms
    let planetCountCheck = planetCount;
    planetCount = document.getElementById("planet-count").value;
    if (planetCountCheck !== planetCount) {
        console.log("Planet count changed");
        console.log(planetCount);
        const allPlanets = document.querySelectorAll(
            "#planet-controls-div form"
        );
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
                />
                <label for="orbit-speed">Planet ${i + 1} Orbit Speed</label>
                <input onchange="updatePlanetSpeed(${i})"
                    type="range"
                    id="orbit-speed-${i}"
                    name="orbit-speed"
                    min="1"
                    max="10"
                    value="1"
                />
                `;

            // Set div to append control forms to
            const planetSizeDiv = document.getElementById(
                "planet-controls-div"
            );
            planetSizeDiv.appendChild(form);
        }
    }

    // Add the planets
    for (let i = 0; i < planets.length; i++) {
        if (scene.children.includes(planets[i].mesh)) {
            planets[i].inOrbit = false;
            scene.remove(planets[i].mesh);
        }
        if (i < planetCount) {
            planets[i].inOrbit = true;
            scene.add(planets[i].mesh);
        }
    }
}

// Arrow orbit effect
const arrow = () => {
    const dir = planetsArray[0].mesh.position.clone();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = planetsArray[0].mesh.position.clone();
    const length = 2;
    const hex = 0xffff00;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0, 0);
    scene.add(arrowHelper);
    setTimeout(() => scene.remove(arrowHelper), 5000);
};

// Generate random star effect
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

// Function to animate the scene/loop
function animate() {
    arrow();
    handlePlanets(planetsArray);
    let orbitRadius = 45;
    for (const p of planetsArray) {
        // Smoothly transition to the new speed
        const orbitSpeed = Date.now() * p.speed;
        p.mesh.position.set(
            Math.cos(orbitSpeed) * orbitRadius,
            0,
            Math.sin(orbitSpeed) * orbitRadius
        );

        orbitRadius += 45;
    }
    requestAnimationFrame(animate);
    sun.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
animate();
