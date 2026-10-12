// Dit bestand wordt gemaakt door omzetten/maak_config.py uit namen.csv; pas het niet met de hand aan.
//
// - `targets`  : het .mind-bestand met alle posters, in dezelfde volgorde als `posters` hieronder.
// - `posters`  : één item per poster. `verhouding` is hoogte gedeeld door breedte.
// - `works`    : de werken die bij die poster verschijnen.
//     portaal : maakt van de poster een raam waardoor je de kamer in kijkt
//               (afstellen per kamer in omzetten/portalen.json, uitproberen met tools/portaal-test.html)

export const config = {
  title: "AR Expo",
  intro: "Richt je camera op een poster en kijk de kamer van de maker in.",
  targets: "assets/targets/targets.mind",
  posters: [
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Ruben Boersma",
          src: "assets/models/Kamer_Boersma.glb",
          portaal: { kijk: 270, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Bryen van de Ven",
          src: "assets/models/Kamer_bryen_vandeven.glb",
          portaal: { kijk: 0, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Rachel Cronje",
          src: "assets/models/Kamer_Cronje.glb",
          portaal: { kijk: 90, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Renar Gassly",
          src: "assets/models/Kamer_Gassly.glb",
          portaal: { kijk: 0, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Dylan Hernandez Willems",
          src: "assets/models/Kamer_Hernandez.glb",
          portaal: { kijk: 90, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
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
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Yannieck Kersten",
          src: "assets/models/Kamer_Kersten.glb",
          portaal: { kijk: 90, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Matthew Konior",
          src: "assets/models/kamer_konior.glb",
          portaal: { kijk: 90, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 0.707,
      works: [
        {
          title: "Slaapkamer",
          maker: "Daan van Lent",
          src: "assets/models/Kamer_lent.glb",
          portaal: { kijk: 180, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Finn Timmermans",
          src: "assets/models/Kamer_Timmermans.glb",
          portaal: { kijk: 0, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 1.415,
      works: [
        {
          title: "Slaapkamer",
          maker: "Thanael van de Heuvel",
          src: "assets/models/kamer_van_den_Heuvel.glb",
          portaal: { kijk: 90, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
    {
      title: "VR-slaapkamer",
      verhouding: 0.562,
      works: [
        {
          title: "Slaapkamer",
          maker: "Milo Veltman",
          src: "assets/models/kamer_veltman.glb",
          portaal: { kijk: 180, zoom: 1.25, insnijden: 0.1, omhoog: 0 },
        },
      ],
    },
  ],
};
