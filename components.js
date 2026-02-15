import * as THREE from 'three';

// Gemensamma materialinställningar för industriellt utseende
const materials = {
    tank: new THREE.MeshStandardMaterial({
        color: 0xaaaabb,
        metalness: 0.6,
        roughness: 0.3
    }),
    pump: new THREE.MeshStandardMaterial({
        color: 0x4477cc,
        metalness: 0.5,
        roughness: 0.4
    }),
    valve: new THREE.MeshStandardMaterial({
        color: 0xcc4444,
        metalness: 0.5,
        roughness: 0.4
    }),
    pipe: new THREE.MeshStandardMaterial({
        color: 0x555566,
        metalness: 0.4,
        roughness: 0.5
    }),
    handwheel: new THREE.MeshStandardMaterial({
        color: 0x333344,
        metalness: 0.6,
        roughness: 0.3
    }),
    heatExchanger: new THREE.MeshStandardMaterial({
        color: 0xcc8844,
        metalness: 0.5,
        roughness: 0.35
    }),
    heatExchangerTubes: new THREE.MeshStandardMaterial({
        color: 0xbb7733,
        metalness: 0.6,
        roughness: 0.3
    }),
    column: new THREE.MeshStandardMaterial({
        color: 0x8899aa,
        metalness: 0.55,
        roughness: 0.3
    }),
    columnTray: new THREE.MeshStandardMaterial({
        color: 0x667788,
        metalness: 0.5,
        roughness: 0.4
    })
};

/**
 * Skapar en tank (vertikal cylinder med kupade toppar)
 * Anslutningspunkter: inlet (vänster sida), outlet (höger sida)
 */
export function createTank(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, type: data.type, name: data.name, description: data.description };

    const radius = 1.2;
    const bodyHeight = 3;
    // Lyft hela tanken så bottenkupolen vilar på gridet
    const baseY = radius;

    // Tankens kropp - vertikal cylinder
    const bodyGeom = new THREE.CylinderGeometry(radius, radius, bodyHeight, 32);
    const body = new THREE.Mesh(bodyGeom, materials.tank);
    body.position.y = baseY + bodyHeight / 2;
    group.add(body);

    // Topkupol
    const topGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = new THREE.Mesh(topGeom, materials.tank);
    top.position.y = baseY + bodyHeight;
    group.add(top);

    // Bottenkupol
    const bottomGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bottom = new THREE.Mesh(bottomGeom, materials.tank);
    bottom.position.y = baseY;
    group.add(bottom);

    // Anslutningsdata för dynamisk beräkning av röranslutningar
    group.userData.connectionRadius = radius;
    group.userData.connectionHeight = 0.8;

    return group;
}

/**
 * Skapar en pump (horisontell cylinder med bas)
 * Anslutningspunkter: inlet (vänster), outlet (höger)
 */
export function createPump(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, type: data.type, name: data.name, description: data.description };

    // Pumphus - horisontell cylinder
    const casingGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32);
    const casing = new THREE.Mesh(casingGeom, materials.pump);
    casing.rotation.z = Math.PI / 2;
    casing.position.y = 0.8;
    group.add(casing);

    // Inloppsstuts
    const inletGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
    const inlet = new THREE.Mesh(inletGeom, materials.pump);
    inlet.rotation.z = Math.PI / 2;
    inlet.position.set(-1, 0.8, 0);
    group.add(inlet);

    // Utloppsstuts (horisontell, höger sida)
    const outletGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 16);
    const outlet = new THREE.Mesh(outletGeom, materials.pump);
    outlet.rotation.z = Math.PI / 2;
    outlet.position.set(1, 0.8, 0);
    group.add(outlet);

    // Bas/fundament
    const baseGeom = new THREE.BoxGeometry(1.6, 0.3, 1);
    const base = new THREE.Mesh(baseGeom, materials.pump);
    base.position.y = 0.15;
    group.add(base);

    group.userData.connectionRadius = 1.3;
    group.userData.connectionHeight = 0.8;

    return group;
}

/**
 * Skapar en ventil (flugform/dubbelkon med spindel och ratt)
 */
export function createValve(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, type: data.type, name: data.name, description: data.description };

    // Ventilkropp - dubbelkon (bowtie)
    const cone1Geom = new THREE.ConeGeometry(0.5, 0.8, 16);
    const cone1 = new THREE.Mesh(cone1Geom, materials.valve);
    cone1.rotation.z = Math.PI / 2;
    cone1.position.set(-0.4, 0.6, 0);
    group.add(cone1);

    const cone2Geom = new THREE.ConeGeometry(0.5, 0.8, 16);
    const cone2 = new THREE.Mesh(cone2Geom, materials.valve);
    cone2.rotation.z = -Math.PI / 2;
    cone2.position.set(0.4, 0.6, 0);
    group.add(cone2);

    // Spindel (stem)
    const stemGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
    const stem = new THREE.Mesh(stemGeom, materials.handwheel);
    stem.position.y = 1.3;
    group.add(stem);

    // Ratt (handwheel) - torus
    const wheelGeom = new THREE.TorusGeometry(0.3, 0.04, 8, 24);
    const wheel = new THREE.Mesh(wheelGeom, materials.handwheel);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 1.7;
    group.add(wheel);

    group.userData.connectionRadius = 0.8;
    group.userData.connectionHeight = 0.6;

    return group;
}

/**
 * Skapar en värmeväxlare (horisontellt skal med tubknippen och gavlar)
 */
export function createHeatExchanger(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, type: data.type, name: data.name, description: data.description };

    const shellRadius = 0.7;
    const shellLength = 2.8;
    const baseY = shellRadius + 0.4;

    // Skal (shell) - horisontell cylinder
    const shellGeom = new THREE.CylinderGeometry(shellRadius, shellRadius, shellLength, 32);
    const shell = new THREE.Mesh(shellGeom, materials.heatExchanger);
    shell.rotation.z = Math.PI / 2;
    shell.position.y = baseY;
    group.add(shell);

    // Gavlar (tube sheets) - skivor i varje ände
    const sheetGeom = new THREE.CylinderGeometry(shellRadius + 0.05, shellRadius + 0.05, 0.08, 32);
    const sheet1 = new THREE.Mesh(sheetGeom, materials.heatExchangerTubes);
    sheet1.rotation.z = Math.PI / 2;
    sheet1.position.set(-shellLength / 2, baseY, 0);
    group.add(sheet1);

    const sheet2 = new THREE.Mesh(sheetGeom.clone(), materials.heatExchangerTubes);
    sheet2.rotation.z = Math.PI / 2;
    sheet2.position.set(shellLength / 2, baseY, 0);
    group.add(sheet2);

    // Ändkåpor (bonnet/channel) - halvcylindrar
    const capGeom = new THREE.SphereGeometry(shellRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap1 = new THREE.Mesh(capGeom, materials.heatExchanger);
    cap1.rotation.z = -Math.PI / 2;
    cap1.position.set(-shellLength / 2 - 0.04, baseY, 0);
    group.add(cap1);

    const cap2 = new THREE.Mesh(capGeom.clone(), materials.heatExchanger);
    cap2.rotation.z = Math.PI / 2;
    cap2.position.set(shellLength / 2 + 0.04, baseY, 0);
    group.add(cap2);

    // Stutsarna (nozzles) - 2 på toppen (shell-sida)
    const nozzleGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 12);
    const nozzle1 = new THREE.Mesh(nozzleGeom, materials.heatExchangerTubes);
    nozzle1.position.set(-shellLength / 4, baseY + shellRadius + 0.25, 0);
    group.add(nozzle1);

    const nozzle2 = new THREE.Mesh(nozzleGeom.clone(), materials.heatExchangerTubes);
    nozzle2.position.set(shellLength / 4, baseY + shellRadius + 0.25, 0);
    group.add(nozzle2);

    // Stödben/sadlar
    const saddleGeom = new THREE.BoxGeometry(0.3, 0.4, 1.0);
    const saddle1 = new THREE.Mesh(saddleGeom, materials.handwheel);
    saddle1.position.set(-shellLength / 3, 0.2, 0);
    group.add(saddle1);

    const saddle2 = new THREE.Mesh(saddleGeom.clone(), materials.handwheel);
    saddle2.position.set(shellLength / 3, 0.2, 0);
    group.add(saddle2);

    group.userData.connectionRadius = shellLength / 2 + shellRadius + 0.1;
    group.userData.connectionHeight = baseY;

    return group;
}

/**
 * Skapar en kolonn (hög vertikal cylinder med bottnar/trays och plattformar)
 */
export function createColumn(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, type: data.type, name: data.name, description: data.description };

    const radius = 1.0;
    const bodyHeight = 7;
    const baseY = radius;

    // Kolonnkropp
    const bodyGeom = new THREE.CylinderGeometry(radius, radius, bodyHeight, 32);
    const body = new THREE.Mesh(bodyGeom, materials.column);
    body.position.y = baseY + bodyHeight / 2;
    group.add(body);

    // Topkupol
    const topGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = new THREE.Mesh(topGeom, materials.column);
    top.position.y = baseY + bodyHeight;
    group.add(top);

    // Bottenkupol
    const bottomGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bottom = new THREE.Mesh(bottomGeom, materials.column);
    bottom.position.y = baseY;
    group.add(bottom);

    // Brickor/trays - synliga som ringar runt kolonnen
    const trayCount = 5;
    const trayGeom = new THREE.TorusGeometry(radius + 0.05, 0.04, 8, 32);
    for (let i = 0; i < trayCount; i++) {
        const tray = new THREE.Mesh(trayGeom, materials.columnTray);
        const y = baseY + bodyHeight * (i + 1) / (trayCount + 1);
        tray.position.y = y;
        tray.rotation.x = Math.PI / 2;
        group.add(tray);
    }

    // Feedstuts (sida, mitten)
    const nozzleGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 12);
    const feedNozzle = new THREE.Mesh(nozzleGeom, materials.columnTray);
    feedNozzle.rotation.z = Math.PI / 2;
    feedNozzle.position.set(radius + 0.3, baseY + bodyHeight * 0.4, 0);
    group.add(feedNozzle);

    // Toppstuts
    const topNozzle = new THREE.Mesh(nozzleGeom.clone(), materials.columnTray);
    topNozzle.position.set(0, baseY + bodyHeight + radius + 0.3, 0);
    group.add(topNozzle);

    // Kjol/skirt (stöd)
    const skirtGeom = new THREE.CylinderGeometry(radius + 0.1, radius + 0.2, 1.0, 32, 1, true);
    const skirt = new THREE.Mesh(skirtGeom, materials.columnTray);
    skirt.position.y = baseY - 0.5;
    group.add(skirt);

    group.userData.connectionRadius = radius + 0.4;
    group.userData.connectionHeight = 0.8;

    return group;
}

const PIPE_RADIUS = 0.08;
const FLANGE_RADIUS = 0.18;
const FLANGE_THICKNESS = 0.06;
const ELBOW_RADIUS = 0.4;

// Färgkodning per medium
const mediumColors = {
    produkt: 0x44bb44,  // Grön
    gas:     0xff8833,  // Orange
    luft:    0x66ccff,  // Ljusblå
    vatten:  0x2255aa,  // Mörkblå
    ånga:    0x999999,  // Grå
};

function getPipeMaterial(medium) {
    const color = mediumColors[medium] || 0x555566;
    return new THREE.MeshStandardMaterial({
        color,
        metalness: 0.4,
        roughness: 0.5
    });
}

// Flödespartikel-färg per medium (ljusare variant)
export const mediumParticleColors = {
    produkt: 0x88ff88,
    gas:     0xffbb66,
    luft:    0xaaeeff,
    vatten:  0x5599ff,
    ånga:    0xdddddd,
};

/**
 * Skapar en fläns (kort bred skiva) vid en position
 */
function createFlange(position, direction, mat) {
    const geom = new THREE.CylinderGeometry(FLANGE_RADIUS, FLANGE_RADIUS, FLANGE_THICKNESS, 16);
    const flange = new THREE.Mesh(geom, mat);
    flange.position.copy(position);

    const up = new THREE.Vector3(0, 1, 0);
    const dir = direction.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    flange.quaternion.copy(quat);

    return flange;
}

/**
 * Skapar ett rakt rörsegment mellan två punkter
 */
function createStraightSegment(start, end, mat) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    if (length < 0.01) return null;

    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const geom = new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, length, 8);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(midpoint);

    const up = new THREE.Vector3(0, 1, 0);
    const dir = direction.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    mesh.quaternion.copy(quat);

    return mesh;
}

/**
 * Skapar en 90°-böj som en serie korta raka segment (kvartscirkel).
 */
function createElbow(cornerPoint, fromDir, toDir, mat) {
    const segments = 8;
    const group = new THREE.Group();

    const from = fromDir.clone().normalize();
    const to = toDir.clone().normalize();

    for (let i = 0; i < segments; i++) {
        const angle0 = (i / segments) * Math.PI / 2;
        const angle1 = ((i + 1) / segments) * Math.PI / 2;

        const p0 = new THREE.Vector3()
            .addScaledVector(from, Math.cos(angle0) * ELBOW_RADIUS)
            .addScaledVector(to, Math.sin(angle0) * ELBOW_RADIUS)
            .add(cornerPoint);
        const p1 = new THREE.Vector3()
            .addScaledVector(from, Math.cos(angle1) * ELBOW_RADIUS)
            .addScaledVector(to, Math.sin(angle1) * ELBOW_RADIUS)
            .add(cornerPoint);

        const seg = createStraightSegment(p0, p1, mat);
        if (seg) group.add(seg);
    }

    return group;
}

/**
 * Skapar en rördragning mellan två världspositioner med flänsar och böjar.
 * medium: typ av medium för färgkodning ("produkt", "gas", "luft", "vatten", "ånga")
 */
export function createPipe(startWorld, endWorld, medium) {
    const group = new THREE.Group();
    group.userData = { type: "pipe" };

    const mat = getPipeMaterial(medium);

    const start = new THREE.Vector3(startWorld.x, startWorld.y, startWorld.z);
    const end = new THREE.Vector3(endWorld.x, endWorld.y, endWorld.z);

    const dx = end.x - start.x;
    const dz = end.z - start.z;

    // Fläns vid start
    const startDir = new THREE.Vector3().subVectors(end, start).normalize();
    group.add(createFlange(start, startDir, mat));

    const needsBend = Math.abs(dx) > 0.1 && Math.abs(dz) > 0.1;

    if (needsBend) {
        const cornerPoint = new THREE.Vector3(end.x, start.y, start.z);
        const signX = Math.sign(dx);
        const signZ = Math.sign(dz);

        const preElbow = new THREE.Vector3(
            cornerPoint.x - signX * ELBOW_RADIUS,
            cornerPoint.y,
            cornerPoint.z
        );
        const postElbow = new THREE.Vector3(
            cornerPoint.x,
            cornerPoint.y,
            cornerPoint.z + signZ * ELBOW_RADIUS
        );

        const seg1 = createStraightSegment(start, preElbow, mat);
        if (seg1) group.add(seg1);

        const fromDir = new THREE.Vector3(-signX, 0, 0);
        const toDir = new THREE.Vector3(0, 0, signZ);
        const elbow = createElbow(cornerPoint, fromDir, toDir, mat);
        group.add(elbow);

        const seg2 = createStraightSegment(postElbow, end, mat);
        if (seg2) group.add(seg2);
    } else {
        const seg = createStraightSegment(start, end, mat);
        if (seg) group.add(seg);
    }

    const endDir = needsBend
        ? new THREE.Vector3(0, 0, Math.sign(dz))
        : new THREE.Vector3().subVectors(end, start).normalize();
    group.add(createFlange(end, endDir, mat));

    return group;
}
