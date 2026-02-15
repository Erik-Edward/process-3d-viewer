import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { processData } from './data/sample-process.js';
import { createTank, createPump, createValve, createHeatExchanger, createColumn, createCompressor, createReactor, createFurnace, createPipe, mediumParticleColors } from './components.js';

// --- Renderer ---
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x1a1a2e);

// --- Scen ---
const scene = new THREE.Scene();

// --- Kamera ---
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(20, 18, 20);

// --- Ljus ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Svagt fyllnadsljus underifrån
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.2);
fillLight.position.set(-5, -5, -5);
scene.add(fillLight);

// --- Markplan ---
const gridHelper = new THREE.GridHelper(50, 50, 0x333355, 0x222244);
scene.add(gridHelper);

// --- OrbitControls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 2, -4);

// --- Bygg scenen från processdata ---
const componentMap = new Map(); // id -> THREE.Group
const componentGroups = []; // alla klickbara grupper

const factories = {
    tank: createTank,
    pump: createPump,
    valve: createValve,
    heatExchanger: createHeatExchanger,
    column: createColumn,
    compressor: createCompressor,
    reactor: createReactor,
    furnace: createFurnace
};

for (const comp of processData.components) {
    const factory = factories[comp.type];
    if (!factory) continue;

    const group = factory(comp);
    group.position.set(comp.position.x, comp.position.y, comp.position.z);
    scene.add(group);

    componentMap.set(comp.id, group);
    componentGroups.push(group);
}

// --- Textlabels ovanför komponenter ---
const labelHeight = {
    tank: 5.8,
    pump: 2.2,
    valve: 2.6,
    heatExchanger: 2.8,
    column: 10.0,
    compressor: 3.5,
    reactor: 7.5,
    furnace: 8.0
};

function createLabel(text, component) {
    const canvas2d = document.createElement('canvas');
    const ctx = canvas2d.getContext('2d');
    canvas2d.width = 512;
    canvas2d.height = 128;

    // Bakgrund med rundade hörn
    ctx.fillStyle = 'rgba(20, 20, 40, 0.85)';
    const r = 16;
    ctx.beginPath();
    ctx.roundRect(4, 4, 504, 120, r);
    ctx.fill();

    // Kantlinje
    ctx.strokeStyle = 'rgba(150, 150, 220, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, 504, 120, r);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#e0e0ff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas2d);
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(material);

    const height = labelHeight[component.type] || 3;
    sprite.position.set(component.position.x, height, component.position.z);
    sprite.scale.set(2.5, 0.625, 1);

    return sprite;
}

for (const comp of processData.components) {
    const label = createLabel(comp.id, comp);
    scene.add(label);
}

// Gemensam rörhöjd så att alla rör löper horisontellt
const PIPE_HEIGHT = 0.8;
const ELBOW_RADIUS = 0.4; // Matchar värdet i components.js

// Lagra rörvägar (waypoints) för flödesanimation
const flowRoutes = [];

// Bygg rörledningar - beräkna anslutningspunkter baserat på L-formad routing
for (const conn of processData.connections) {
    const fromGroup = componentMap.get(conn.from);
    const toGroup = componentMap.get(conn.to);
    if (!fromGroup || !toGroup) continue;

    const dx = toGroup.position.x - fromGroup.position.x;
    const dz = toGroup.position.z - fromGroup.position.z;
    const fromRadius = fromGroup.userData.connectionRadius;
    const toRadius = toGroup.userData.connectionRadius;

    const needsBend = Math.abs(dx) > 0.1 && Math.abs(dz) > 0.1;

    let startWorld, endWorld;
    const waypoints = [];

    if (needsBend) {
        const signX = Math.sign(dx);
        const signZ = Math.sign(dz);

        startWorld = {
            x: fromGroup.position.x + signX * fromRadius,
            y: PIPE_HEIGHT,
            z: fromGroup.position.z
        };
        endWorld = {
            x: toGroup.position.x,
            y: PIPE_HEIGHT,
            z: toGroup.position.z - signZ * toRadius
        };

        // Waypoints: start → pre-elbow → böjpunkter → post-elbow → end
        const cornerX = endWorld.x;
        const cornerZ = startWorld.z;
        waypoints.push(new THREE.Vector3(startWorld.x, PIPE_HEIGHT, startWorld.z));
        waypoints.push(new THREE.Vector3(cornerX - signX * ELBOW_RADIUS, PIPE_HEIGHT, cornerZ));

        // Böjpunkter (kvartscirkel)
        const elbowSteps = 6;
        const cornerPoint = new THREE.Vector3(cornerX, PIPE_HEIGHT, cornerZ);
        const fromDir = new THREE.Vector3(-signX, 0, 0);
        const toDir = new THREE.Vector3(0, 0, signZ);
        for (let i = 0; i <= elbowSteps; i++) {
            const angle = (i / elbowSteps) * Math.PI / 2;
            const p = new THREE.Vector3()
                .addScaledVector(fromDir, Math.cos(angle) * ELBOW_RADIUS)
                .addScaledVector(toDir, Math.sin(angle) * ELBOW_RADIUS)
                .add(cornerPoint);
            waypoints.push(p);
        }

        waypoints.push(new THREE.Vector3(endWorld.x, PIPE_HEIGHT, endWorld.z));
    } else {
        const dist = Math.sqrt(dx * dx + dz * dz);
        const dirX = dist > 0 ? dx / dist : 0;
        const dirZ = dist > 0 ? dz / dist : 0;

        startWorld = {
            x: fromGroup.position.x + dirX * fromRadius,
            y: PIPE_HEIGHT,
            z: fromGroup.position.z + dirZ * fromRadius
        };
        endWorld = {
            x: toGroup.position.x - dirX * toRadius,
            y: PIPE_HEIGHT,
            z: toGroup.position.z - dirZ * toRadius
        };

        waypoints.push(new THREE.Vector3(startWorld.x, PIPE_HEIGHT, startWorld.z));
        waypoints.push(new THREE.Vector3(endWorld.x, PIPE_HEIGHT, endWorld.z));
    }

    // Beräkna total längd för jämn hastighet
    let totalLength = 0;
    const segLengths = [];
    for (let i = 1; i < waypoints.length; i++) {
        const len = waypoints[i].distanceTo(waypoints[i - 1]);
        segLengths.push(len);
        totalLength += len;
    }

    flowRoutes.push({ waypoints, segLengths, totalLength, medium: conn.medium });

    const pipe = createPipe(startWorld, endWorld, conn.medium);
    scene.add(pipe);
}

// --- Flödespartiklar ---
const PARTICLES_PER_ROUTE = 3;
const FLOW_SPEED = 1.5; // enheter per sekund
const particleGeom = new THREE.SphereGeometry(0.12, 8, 8);
const PARTICLE_Y_OFFSET = 0.15;

const flowParticles = [];

for (const route of flowRoutes) {
    const color = mediumParticleColors[route.medium] || 0x44ddff;
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < PARTICLES_PER_ROUTE; i++) {
        const mesh = new THREE.Mesh(particleGeom, mat);
        scene.add(mesh);
        flowParticles.push({
            mesh,
            route,
            progress: i / PARTICLES_PER_ROUTE
        });
    }
}

/**
 * Beräkna position längs en rutt givet progress (0-1)
 */
function getPositionOnRoute(route, progress) {
    const targetDist = progress * route.totalLength;
    let accumulated = 0;

    for (let i = 0; i < route.segLengths.length; i++) {
        const segLen = route.segLengths[i];
        if (accumulated + segLen >= targetDist) {
            const t = (targetDist - accumulated) / segLen;
            return new THREE.Vector3().lerpVectors(route.waypoints[i], route.waypoints[i + 1], t);
        }
        accumulated += segLen;
    }

    return route.waypoints[route.waypoints.length - 1].clone();
}

// --- Raycasting och interaktion ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedGroup = null;
let hoveredGroup = null;

const infoTitle = document.getElementById('info-title');
const infoDetails = document.getElementById('info-details');

// Lagra originalmaterial per grupp för att kunna återställa
const originalMaterials = new Map();

function findComponentGroup(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.id) return current;
        current = current.parent;
    }
    return null;
}

function storeOriginalMaterials(group) {
    if (originalMaterials.has(group)) return;
    const map = new Map();
    group.traverse((child) => {
        if (child.isMesh && child.material) {
            map.set(child, child.material);
        }
    });
    originalMaterials.set(group, map);
}

function setGroupEmissive(group, color, intensity) {
    storeOriginalMaterials(group);
    group.traverse((child) => {
        if (child.isMesh && child.material) {
            const orig = originalMaterials.get(group)?.get(child);
            if (orig) {
                child.material = orig.clone();
                child.material.emissive = new THREE.Color(color);
                child.material.emissiveIntensity = intensity;
            }
        }
    });
}

function restoreGroupMaterials(group) {
    const map = originalMaterials.get(group);
    if (!map) return;
    group.traverse((child) => {
        if (child.isMesh && map.has(child)) {
            child.material = map.get(child);
        }
    });
}

const typeLabels = {
    tank: 'Kärl',
    pump: 'Pump',
    valve: 'Ventil',
    heatExchanger: 'Värmeväxlare',
    column: 'Kolonn',
    compressor: 'Kompressor',
    reactor: 'Reaktor',
    furnace: 'Ugn'
};

function showInfo(data) {
    infoTitle.textContent = data.name;
    infoDetails.innerHTML = `
        <p class="label">Typ</p>
        <p class="value">${typeLabels[data.type] || data.type}</p>
        <p class="label">ID</p>
        <p class="value">${data.id}</p>
        <p class="label">Beskrivning</p>
        <p class="value">${data.description}</p>
    `;
}

function resetInfoPanel() {
    infoTitle.textContent = 'Klicka på en komponent';
    infoDetails.innerHTML = `
        <p>Rotera: vänster musknapp</p>
        <p>Zooma: scrollhjul</p>
        <p>Panorera: höger musknapp</p>
    `;
}

// --- Hover ---
canvas.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let newHovered = null;
    for (const hit of intersects) {
        const group = findComponentGroup(hit.object);
        if (group) {
            newHovered = group;
            break;
        }
    }

    // Inget ändrat
    if (newHovered === hoveredGroup) return;

    // Ta bort gammal hover (om den inte är vald)
    if (hoveredGroup && hoveredGroup !== selectedGroup) {
        restoreGroupMaterials(hoveredGroup);
    }

    hoveredGroup = newHovered;

    // Sätt ny hover (om den inte redan är vald)
    if (hoveredGroup && hoveredGroup !== selectedGroup) {
        setGroupEmissive(hoveredGroup, 0x6666ff, 0.15);
    }

    // Ändra cursor
    canvas.style.cursor = hoveredGroup ? 'pointer' : 'default';
});

// --- Klick ---
canvas.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Återställ tidigare vald
    if (selectedGroup) {
        restoreGroupMaterials(selectedGroup);
        selectedGroup = null;
    }

    for (const hit of intersects) {
        const group = findComponentGroup(hit.object);
        if (group) {
            selectedGroup = group;
            setGroupEmissive(group, 0x4444ff, 0.35);
            showInfo(group.userData);
            return;
        }
    }

    resetInfoPanel();
});

// --- Fönsterhantering ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animationsloop ---
let lastTime = performance.now();

function animate(now) {
    requestAnimationFrame(animate);

    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // Uppdatera flödespartiklar
    for (const p of flowParticles) {
        p.progress += (FLOW_SPEED * delta) / p.route.totalLength;
        if (p.progress > 1) p.progress -= 1;

        const pos = getPositionOnRoute(p.route, p.progress);
        p.mesh.position.set(pos.x, pos.y + PARTICLE_Y_OFFSET, pos.z);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate(performance.now());
