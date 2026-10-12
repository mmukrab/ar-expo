import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MindARThree } from "mindar-image-three";
import { config } from "./config.js";
import { maakPortaal } from "./portaal.js";

const $ = (id) => document.getElementById(id);
const FOUND_KEY = "ar-expo-found";
const HIDE_DELAY = 1500; // ms: voorkomt flikkeren als de tracking even wegvalt

document.title = config.title;
$("start-title").textContent = config.title;
$("start-intro").textContent = config.intro;

// ---------- 3D-werk ----------

const loader = new GLTFLoader();
// De kamers zijn met Draco gecomprimeerd; de decoder wordt pas opgehaald als een model hem nodig heeft.
loader.setDRACOLoader(
  new DRACOLoader().setDecoderPath("https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/gltf/"),
);

const shapes = {
  knot: () => new THREE.TorusKnotGeometry(0.3, 0.1, 128, 16),
  ico: () => new THREE.IcosahedronGeometry(0.45, 0),
  torus: () => new THREE.TorusGeometry(0.33, 0.14, 24, 64),
  cone: () => new THREE.ConeGeometry(0.35, 0.8, 5),
  box: () => new THREE.BoxGeometry(0.6, 0.6, 0.6),
  sphere: () => new THREE.SphereGeometry(0.45, 32, 16),
};

function makePlaceholder(work) {
  const geometry = (shapes[work.shape] ?? shapes.ico)();
  const material = new THREE.MeshStandardMaterial({
    color: work.color ?? "#ffffff",
    roughness: 0.35,
    metalness: 0.2,
    flatShading: work.shape === "ico" || work.shape === "cone",
  });
  return new THREE.Mesh(geometry, material);
}

// Centreert het model en schaalt het zodat de grootste zijde `size` is.
function fit(object, size) {
  const box = new THREE.Box3().setFromObject(object);
  const dims = box.getSize(new THREE.Vector3());
  const wrapper = new THREE.Group();
  object.position.sub(box.getCenter(new THREE.Vector3()));
  wrapper.add(object);
  wrapper.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z, 1e-6));
  return wrapper;
}

async function loadSlot(slot) {
  if (slot.loading) return slot.loading;
  const { work } = slot;
  const size = work.size ?? 0.8;
  slot.loading = (async () => {
    let object;
    if (work.src) {
      const gltf = await loader.loadAsync(work.src);
      object = gltf.scene;
      if (gltf.animations.length) {
        slot.mixer = new THREE.AnimationMixer(object);
        gltf.animations.forEach((clip) => slot.mixer.clipAction(clip).play());
      }
    } else {
      object = makePlaceholder(work);
    }
    if (work.portaal) {
      // De poster wordt een raam waardoor je de kamer in kijkt.
      const portaal = maakPortaal(object, { hoogte: slot.hoogte, ...work.portaal });
      slot.holder.add(portaal.groep);
      slot.werkBij = portaal.werkBij;
    } else {
      slot.holder.add(fit(object, size));
      // Laat het werk vóór de poster zweven in plaats van er half doorheen.
      slot.holder.position.z = size / 2 + 0.1;
    }
    slot.loaded = true;
  })();
  return slot.loading;
}

// ---------- UI ----------

const found = new Set();
try {
  JSON.parse(localStorage.getItem(FOUND_KEY) ?? "[]").forEach((i) => found.add(i));
} catch {}

function renderProgress() {
  $("progress").textContent = `${found.size} / ${config.posters.length} posters gevonden`;
}

function markFound(index) {
  if (found.has(index)) return;
  found.add(index);
  try {
    localStorage.setItem(FOUND_KEY, JSON.stringify([...found]));
  } catch {}
  renderProgress();
}

function renderPanel(poster) {
  const slot = poster.slots[poster.current];
  $("poster-title").textContent = poster.title;
  $("work-title").textContent = slot.work.title ?? "";
  $("work-maker").textContent = slot.failed
    ? "Dit werk kon niet geladen worden."
    : slot.loaded
      ? (slot.work.maker ?? "")
      : "Laden…";
  $("dots").replaceChildren(
    ...poster.slots.map((_, i) => {
      const dot = document.createElement("span");
      if (i === poster.current) dot.className = "on";
      return dot;
    }),
  );
  const single = poster.slots.length < 2;
  $("prev").hidden = $("next").hidden = single;
}

// ---------- Posters ----------

let active = null;
let hideTimer = null;

function show(poster, index) {
  const count = poster.slots.length;
  poster.current = ((index % count) + count) % count;
  poster.slots.forEach((slot, i) => (slot.holder.visible = i === poster.current));
  const slot = poster.slots[poster.current];
  slot.holder.scale.setScalar(0.001); // groeit in de renderloop naar 1
  renderPanel(poster);
  loadSlot(slot)
    .catch((err) => {
      console.error(`Kon ${slot.work.src} niet laden`, err);
      slot.failed = true;
    })
    .finally(() => {
      if (active === poster) renderPanel(poster);
    });
}

function step(delta) {
  if (active) show(active, active.current + delta);
}

function onFound(poster, index) {
  clearTimeout(hideTimer);
  active = poster;
  markFound(index);
  show(poster, poster.current);
  document.body.classList.add("tracking");
}

function onLost(poster) {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (active !== poster) return;
    active = null;
    document.body.classList.remove("tracking");
  }, HIDE_DELAY);
}

// ---------- Start ----------

function fail(message) {
  $("loading").hidden = true;
  $("start").hidden = false;
  $("start-error").textContent = message;
}

async function checkCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Deze browser geeft geen toegang tot de camera. Open de pagina in Safari of Chrome (niet in een in-app browser).",
    );
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    throw new Error(
      "Geen toegang tot de camera. Sta cameragebruik toe in je browserinstellingen en probeer het opnieuw.",
    );
  }
}

async function start() {
  $("start").hidden = true;
  $("start-error").textContent = "";
  $("loading").hidden = false;

  try {
    await checkCamera();
  } catch (err) {
    return fail(err.message);
  }

  const mindar = new MindARThree({
    container: $("ar"),
    imageTargetSrc: config.targets,
    maxTrack: 1,
    uiLoading: "no",
    uiScanning: "no",
    uiError: "no",
  });
  const { renderer, scene, camera } = mindar;
  renderer.localClippingEnabled = true; // nodig voor het snijvlak van de portalen

  scene.add(new THREE.HemisphereLight(0xffffff, 0x555566, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(0.5, 1, 1.5);
  scene.add(sun);

  const posters = config.posters.map((data, index) => {
    const anchor = mindar.addAnchor(index);
    const poster = {
      title: data.title,
      current: 0,
      slots: data.works.map((work) => {
        const holder = new THREE.Group();
        holder.visible = false;
        anchor.group.add(holder);
        return { work, holder, loaded: false, hoogte: data.verhouding ?? 1.414 };
      }),
    };
    anchor.onTargetFound = () => onFound(poster, index);
    anchor.onTargetLost = () => onLost(poster);
    return poster;
  });

  try {
    await mindar.start();
  } catch (err) {
    console.error(err);
    return fail("De AR-ervaring kon niet starten. Herlaad de pagina en probeer het opnieuw.");
  }

  $("loading").hidden = true;
  document.body.classList.add("running");
  renderProgress();

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    for (const poster of posters) {
      const slot = poster.slots[poster.current];
      if (!slot.holder.visible) continue;
      if (slot.werkBij) slot.werkBij();
      else if (slot.work.spin !== false) slot.holder.rotation.y += dt * 0.6;
      const s = slot.holder.scale.x;
      slot.holder.scale.setScalar(s + (1 - s) * Math.min(1, dt * 8));
      slot.mixer?.update(dt);
    }
    renderer.render(scene, camera);
  });
}

$("start-button").addEventListener("click", start);
$("prev").addEventListener("click", () => step(-1));
$("next").addEventListener("click", () => step(1));

// Vegen over het beeld bladert ook door de verzameling.
let touchX = null;
$("ar").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
$("ar").addEventListener(
  "touchend",
  (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  },
  { passive: true },
);
