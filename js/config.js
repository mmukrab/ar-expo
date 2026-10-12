// Alles wat je per tentoonstelling aanpast staat in dit bestand.
//
// - `targets`  : het .mind-bestand met alle posters (maak het met tools/compile.html).
// - `posters`  : één item per poster, in DEZELFDE volgorde als in het .mind-bestand.
// - `works`    : de verzameling 3D-werken die bij die poster verschijnt.
//     src   : pad naar een .glb/.gltf-bestand, bv. "assets/models/vaas.glb"
//     size  : grootte t.o.v. de posterbreedte (1 = even breed als de poster)
//     spin  : false om het werk niet te laten ronddraaien
//     shape : alleen voor de demo, zolang er nog geen `src` is
//             (knot | ico | torus | cone | box | sphere)
//     portaal : maakt van de poster een raam waardoor je een kamer in kijkt, bv.
//             portaal: { kijk: 90, zoom: 1, insnijden: 0.05, omhoog: 0 }
//             (stel dit per kamer af met tools/portaal-test.html)
// - `verhouding` per poster: hoogte gedeeld door breedte (staand A-formaat = 1.414).

export const config = {
  title: "AR Expo",
  intro: "Richt je camera op een poster en ontdek het 3D-werk dat erachter schuilt.",

  // Demo-targets van MindAR (wasbeer + beer). Vervang door "assets/targets/targets.mind".
  targets:
    "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/band-example/band.mind",

  posters: [
    {
      title: "Poster 1",
      verhouding: 1, // de demo-afbeeldingen zijn vierkant
      works: [
        {
          title: "Slaapkamer",
          maker: "Jonah Hughes",
          src: "assets/models/Kamer_hughes.glb",
          portaal: { kijk: 0, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "Poster 2",
      verhouding: 1,
      works: [
        { title: "Werk D", maker: "Naam maker", shape: "cone", color: "#80ed99" },
        { title: "Werk E", maker: "Naam maker", shape: "box", color: "#c77dff" },
        { title: "Werk F", maker: "Naam maker", shape: "sphere", color: "#ff9f1c" },
      ],
    },
  ],
};
