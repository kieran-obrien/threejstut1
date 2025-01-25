import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let readyToStart = false;

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

// Setting intial geometry and material for the sun and planets
const geometrySun = new THREE.SphereGeometry(10, 32, 32);
const materialSun = new THREE.MeshStandardMaterial({ color: 0xffaa0d });
const material = new THREE.MeshStandardMaterial({ color: 0x006600 });
const geometryPlanet = new THREE.SphereGeometry(4, 15, 15);

// Add lighting to the scene
const pointLight = new THREE.PointLight(0xffffff, 1000, 1000);
pointLight.position.set(5, 20, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight, pointLight);
const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

// Load the planet textures
const textureLoader = new THREE.TextureLoader();
let textureCounter = 1;
const planetTextures = [];

let planetsArray;
let planetMaterials = [];
let sun;
const loadTexture = (counter) => {
    const texturePath = `./texture${counter}.jpg`;

    textureLoader.load(
        texturePath,
        (texture) => {
            // On successful load
            planetTextures.push(texture);
            loadTexture(counter + 1); // Load the next texture
        },
        undefined,
        (err) => {
            // On error (e.g., texture not found)
            console.log("Finished loading textures");
            console.log(planetTextures);
            [planetsArray, planetMaterials, sun] = createPlanets(); // Create planets after loading all textures
        }
    );
};

// Start loading textures
loadTexture(textureCounter);
const checkTexturesLoaded = setInterval(() => {
    if (readyToStart) {
        clearInterval(checkTexturesLoaded);
    }
}, 100);

// Set planet class
class Planet {
    constructor(size, distanceFromLast, orbitSpeed, mesh) {
        this.size = size;
        this.distance = distanceFromLast;
        this.speed = orbitSpeed;
        this.spinSpeed = 0.00125;
        this.mesh = mesh;
        this.inOrbit = false;
        this.name = "";
        this.textureCode = 0;
        this.currentAngle = 0;
        this.lastUpdateTime = Date.now();
    }
    updatePlanetSize(size) {
        this.size = size;
        this.mesh.scale.set(size, size, size);
    }
    updatePlanetSpeed(speed) {
        console.log(this.speed);
        this.speed = speed / 8000;
        console.log(this.speed);
    }
    updatePlanetSpinSpeed(spinSpeed) {
        this.spinSpeed = spinSpeed / 800;
        console.log(this.spinSpeed);
    }
}

// Create and populate array of ten planet objects
// Also create array of planet materials

function getPlanet() {
    let planetMaterialInit = new THREE.MeshPhongMaterial({
        map: planetTextures[0],
    });
    return new Planet(
        1,
        45,
        0.000125,
        new THREE.Mesh(geometryPlanet, planetMaterialInit)
    );
}

function createPlanets() {
    let materialCounter = 0;
    planetMaterials = Array(planetTextures.length)
        .fill()
        .map(() => {
            let material = new THREE.MeshPhongMaterial({
                map: planetTextures[materialCounter],
            });
            materialCounter++;
            return material;
        });
    const planetsArray = Array(10).fill().map(getPlanet);
    for (let i = 1; i < planetsArray.length + 1; i++) {
        planetsArray[i - 1].name = `Planet ${i}`;
    }
    const sun = new THREE.Mesh(geometrySun, planetMaterials[3]);

    // Add the initial sun
    scene.add(sun);
    sun.position.set(0, 0, 0);

    readyToStart = true;
    console.log("Planets created");
    console.log(planetsArray);
    return [planetsArray, planetMaterials, sun];
}

// console.log(planetsArray);
// console.log(planetsArray[0]);

// Add planet functionality
let planetCount = 0;
function handlePlanets(planets) {
    // Update planet size
    const updatePlanetSize = (index) => {
        const size = document.getElementById(`planet-size-${index}`).value;
        console.log(size);
        planets[index].updatePlanetSize(size);
    };
    window.updatePlanetSize = updatePlanetSize;

    // Update planet orbit speed
    const updatePlanetSpeed = (index) => {
        const speed = document.getElementById(`orbit-speed-${index}`).value;
        planets[index].updatePlanetSpeed(speed);
    };
    window.updatePlanetSpeed = updatePlanetSpeed;

    // Update planet texture
    const updatePlanetTexture = (index) => {
        planets[index].textureCode++;
        let nextTexture = planets[index].textureCode;
        if (nextTexture >= planetMaterials.length) {
            nextTexture = 0;
            planets[index].textureCode = 0;
        }
        planets[index].mesh.material = planetMaterials[nextTexture];
        planetMaterials[nextTexture].map.needsUpdate = true;
    };
    window.updatePlanetTexture = updatePlanetTexture;

    // Update planet spin speed
    const updatePlanetSpinSpeed = (index) => {
        const spin = document.getElementById(`planet-spin-${index}`).value;
        planets[index].updatePlanetSpinSpeed(spin);
    };
    window.updatePlanetSpinSpeed = updatePlanetSpinSpeed;

    // Add planet control forms
    let planetCountCheck = planetCount;
    planetCount = document.getElementById("planet-count").value;
    // Has planet count changed?
    if (planetCountCheck !== planetCount) {
        const allPlanets = document.querySelectorAll(
            "#planet-controls-div form"
        );
        allPlanets.forEach((p, index) => {
            p.remove();
        });
        for (let i = 0; i < planetCount; i++) {
            const form = document.createElement("form");
            form.innerHTML = `<label for="planet-size">Planet ${
                i + 1
            } Size</label>
            <input oninput="updatePlanetSize(${i})"
                type="range"
                id="planet-size-${i}"
                name="planet-size"
                min="1"
                max="10"
                step="0.1"
                value="${planetsArray[i].size}"
            />
            <label for="orbit-speed">Planet ${i + 1} Orbit Speed</label>
            <input oninput="updatePlanetSpeed(${i})"
                type="range"
                id="orbit-speed-${i}"
                name="orbit-speed"
                min="1"
                max="10"
                step="0.1"
                value="${planetsArray[i].speed}"
            />
            <label for="planet-spin">Planet ${i + 1} Spin Speed</label>
            <input oninput="updatePlanetSpinSpeed(${i})"
                type="range"
                id="planet-spin-${i}"
                name="planet-spin"
                min="1"
                max="12"
                step="0.1"
                value="${planetsArray[i].spinSpeed}"
            />
            <label for="planet-texture">Planet ${i + 1} Texture</label>
            <input onclick="updatePlanetTexture(${i})"
                type="button"
                id="planet-texture-${i}"
                name="planet-texture"
            />`;

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

// Pause and play functionality
let isPaused = false;
function pausePlay() {
    for (let i = 0; i < planetsArray.length; i++) {
        // Update the last update time for each planet
        planetsArray[i].lastUpdateTime = Date.now();
    }
    isPaused = !isPaused;
}
const pauseButton = document.getElementById("pause-button");
pauseButton.addEventListener("click", pausePlay);

// Function to animate the scene/loop
function animate() {
    // arrow(); // Arrow orbit effect
    handlePlanets(planetsArray); // Handle planet controls
    let orbitRadius = 120;
    if (!isPaused) {
        // If not paused, update the planets
        const currentTime = Date.now();
        planetsArray.forEach((p) => {
            // Calculate the change in angle based on the speed and elapsed time
            const deltaAngle = (currentTime - p.lastUpdateTime) * p.speed;
            p.currentAngle += deltaAngle;
            p.lastUpdateTime = currentTime;

            // Set the new position based on the current angle
            p.mesh.position.set(
                Math.cos(p.currentAngle) * orbitRadius,
                0,
                Math.sin(p.currentAngle) * orbitRadius
            );
            orbitRadius += 120;
            // Rotate the planet
            p.mesh.rotation.y += p.spinSpeed;
        });
    }
    sun.rotation.y += 0.0005;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

const checkReadyToStart = setInterval(() => {
    if (readyToStart) {
        animate();
        clearInterval(checkReadyToStart);
    }
}, 100);
