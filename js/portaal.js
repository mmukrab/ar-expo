// Portaal: de poster wordt een raam waardoor je een kamer in kijkt.
//
// Twee trucs samen:
// - een onzichtbaar vlak ter grootte van de poster schrijft in de stencilbuffer; de kamer wordt
//   alleen getekend waar dat vlak staat, dus je ziet hem alleen "door" de poster;
// - een snijvlak op de poster haalt alles weg wat vóór de poster uitsteekt, waaronder de muur
//   aan de kijkkant. Daardoor hoeft het model zelf geen open wand te hebben.

import * as THREE from "three";

const STENCIL = 1;

// Maakt van een geladen kamer een portaal op een poster van 1 breed en `hoogte` hoog.
//   kijk      : draait de kamer om zijn verticale as (graden), om te kiezen door welke wand je kijkt
//   zoom      : groter dan 1 haalt de kamer dichterbij
//   insnijden : welk deel van de kamerdiepte vóór de poster wordt weggesneden (0.05 = 5%)
//   omhoog    : verschuift de kamer verticaal, als deel van de posterhoogte
// Geeft { groep, werkBij }; roep werkBij() elke frame aan vóór het renderen.
export function maakPortaal(kamer, { hoogte = 1.414, kijk = 0, zoom = 1, insnijden = 0.05, omhoog = 0 } = {}) {
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
  const doos = new THREE.Box3().setFromObject(draai);
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
    }
  });

  // Het snijvlak ligt op de poster en houdt alles erachter (z < 0 in posterruimte).
  const basis = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  function werkBij() {
    groep.updateWorldMatrix(true, false);
    snijvlak.copy(basis).applyMatrix4(groep.matrixWorld);
  }

  return { groep, werkBij };
}
