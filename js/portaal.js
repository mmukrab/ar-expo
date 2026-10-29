// Portaal: de poster wordt een raam waardoor je een kamer in kijkt.
//
// Twee trucs samen:
// - een onzichtbaar vlak ter grootte van de poster schrijft in de stencilbuffer; de kamer wordt
//   alleen getekend waar dat vlak staat, dus je ziet hem alleen "door" de poster;
// - een snijvlak op de poster haalt alles weg wat vóór de poster uitsteekt, waaronder de muur
//   aan de kijkkant. Daardoor hoeft het model zelf geen open wand te hebben.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const STENCIL = 1;
const LICHTRICHTING = new THREE.Vector3(0.45, -0.6, -1).normalize(); // van de kijker schuin de kamer in

const omgevingen = new WeakMap();

// Zet renderer en scène klaar voor de kamers: schaduwen, filmische toonweergave en een zachte
// omgeving die materialen laat glanzen in plaats van ze vlak te belichten.
export function richtLichtIn(renderer, scene) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  if (!omgevingen.has(renderer)) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    omgevingen.set(renderer, pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture);
    pmrem.dispose();
  }
  scene.environment = omgevingen.get(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.9));
}

// De omvang van de kamer, zonder losse voorwerpen die ver buiten de kamer zweven. Eén vergeten
// object op een kilometer afstand zou de kamer anders tot een stipje verkleinen.
function kamerDoos(model) {
  const delen = [];
  model.traverse((deel) => {
    if (!deel.isMesh) return;
    const doos = new THREE.Box3().setFromObject(deel);
    if (!doos.isEmpty()) delen.push({ doos, midden: doos.getCenter(new THREE.Vector3()) });
  });
  if (delen.length === 0) return new THREE.Box3().setFromObject(model);

  const mediaan = (waarden) => waarden.sort((a, b) => a - b)[Math.floor(waarden.length / 2)];
  const kern = new THREE.Vector3(
    mediaan(delen.map((d) => d.midden.x)),
    mediaan(delen.map((d) => d.midden.y)),
    mediaan(delen.map((d) => d.midden.z)),
  );
  const afstanden = delen.map((d) => d.midden.distanceTo(kern));
  const grens = Math.max(5 * mediaan([...afstanden]), 2);
  const doos = new THREE.Box3();
  delen.forEach((d, i) => {
    if (afstanden[i] <= grens) doos.union(d.doos);
  });
  return doos;
}

// Maakt van een geladen kamer een portaal op een poster van 1 breed en `hoogte` hoog.
//   kijk      : draait de kamer om zijn verticale as (graden), om te kiezen door welke wand je kijkt
//   zoom      : groter dan 1 haalt de kamer dichterbij
//   insnijden : welk deel van de kamerdiepte vóór de poster wordt weggesneden (0.05 = 5%)
//   omhoog    : verschuift de kamer verticaal, als deel van de posterhoogte
//   schaduw   : false zet de schaduwen uit (scheelt rekenwerk op trage telefoons)
//   licht     : sterkte van de lamp die door de poster naar binnen schijnt
// Geeft { groep, werkBij }; roep werkBij() elke frame aan vóór het renderen.
export function maakPortaal(
  kamer,
  { hoogte = 1.414, kijk = 0, zoom = 1, insnijden = 0.05, omhoog = 0, schaduw = true, licht = 2.6 } = {},
) {
  const groep = new THREE.Group();

  const raam = new THREE.Mesh(
    new THREE.PlaneGeometry(1, hoogte),
    new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: STENCIL,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilZPass: THREE.ReplaceStencilOp,
    }),
  );
  raam.renderOrder = 1;
  groep.add(raam);

  const draai = new THREE.Group();
  draai.rotation.y = THREE.MathUtils.degToRad(kijk);
  draai.add(kamer);
  draai.updateMatrixWorld(true);
  const doos = kamerDoos(draai);
  const maat = doos.getSize(new THREE.Vector3());
  const midden = doos.getCenter(new THREE.Vector3());

  // De doorsnede van de kamer bedekt de hele poster; wat buiten de poster valt zie je pas als je
  // er schuin doorheen kijkt.
  const schaal = Math.max(1 / maat.x, hoogte / maat.y) * zoom;
  const inhoud = new THREE.Group();
  inhoud.add(draai);
  inhoud.scale.setScalar(schaal);
  inhoud.position.set(
    -midden.x * schaal,
    -midden.y * schaal + omhoog * hoogte,
    -(doos.max.z - maat.z * insnijden) * schaal,
  );
  groep.add(inhoud);

  const snijvlak = new THREE.Plane();
  kamer.traverse((deel) => {
    if (!deel.isMesh) return;
    deel.renderOrder = 2;
    const materialen = Array.isArray(deel.material) ? deel.material : [deel.material];
    for (const materiaal of materialen) {
      materiaal.stencilWrite = true;
      materiaal.stencilRef = STENCIL;
      materiaal.stencilFunc = THREE.EqualStencilFunc;
      materiaal.clippingPlanes = [snijvlak];
      // De weggesneden voorwand mag ook geen schaduw werpen, anders komt er geen licht binnen.
      materiaal.clipShadows = true;
      // De omgeving vult alleen aan; de lamp bepaalt het beeld.
      if ("envMapIntensity" in materiaal) materiaal.envMapIntensity = 0.45;
    }
    deel.castShadow = deel.receiveShadow = schaduw;
  });

  // Eén lamp schijnt door de open voorkant naar binnen, alsof het licht vanuit de zaal de kamer in
  // valt. Hij hangt aan de poster, dus licht en schaduw draaien mee als de bezoeker beweegt.
  const kern = new THREE.Vector3(0, omhoog * hoogte, inhoud.position.z + midden.z * schaal);
  const straal = (maat.length() * schaal) / 2;
  const lamp = new THREE.DirectionalLight(0xfff2dd, licht);
  lamp.position.copy(kern).addScaledVector(LICHTRICHTING, -2 * straal);
  lamp.target.position.copy(kern);
  lamp.castShadow = schaduw;
  lamp.shadow.mapSize.set(1024, 1024);
  lamp.shadow.bias = -0.0004;
  groep.add(lamp, lamp.target);
  let lampSchaal = 0;
  const wereldSchaal = new THREE.Vector3();

  // Het snijvlak ligt op de poster en houdt alles erachter (z < 0 in posterruimte).
  const basis = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  function werkBij() {
    groep.updateWorldMatrix(true, false);
    snijvlak.copy(basis).applyMatrix4(groep.matrixWorld);

    // De schaduwcamera rekent in wereldmaten, en de poster heeft in AR een heel andere schaal dan 1.
    const s = groep.getWorldScale(wereldSchaal).x;
    if (schaduw && Math.abs(s - lampSchaal) > 1e-4 * s) {
      lampSchaal = s;
      const camera = lamp.shadow.camera;
      camera.left = camera.bottom = -straal * s;
      camera.right = camera.top = straal * s;
      camera.near = 0.5 * straal * s;
      camera.far = 3.5 * straal * s;
      camera.updateProjectionMatrix();
      lamp.shadow.normalBias = 0.012 * straal * s;
    }
  }

  return { groep, werkBij };
}
