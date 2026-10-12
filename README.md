# AR Expo (MindAR)

Bezoekers scannen bij de ingang een QR-code, komen op `index.html`, starten de camera en zien bij elke
poster een verzameling 3D-werken waar ze doorheen kunnen bladeren (knoppen of vegen).

## Bestanden

| Bestand | Waarvoor |
| --- | --- |
| `index.html`, `js/ar.js`, `css/style.css` | De bezoekerspagina |
| `js/config.js` | Titel, posters en 3D-werken: het enige bestand dat je hoeft aan te passen |
| `tools/compile.html` | Maakt van je posterafbeeldingen één `targets.mind` |
| `tools/qr.html` | Maakt de QR-code voor de ingang |
| `serve.mjs` | Lokale testserver (`node serve.mjs`) |

## Eigen posters en werken toevoegen

1. Open `tools/compile.html`, kies de afbeeldingen van alle posters en download `targets.mind`.
   Zet dat bestand in `assets/targets/`.
2. Zet je 3D-modellen als `.glb` in `assets/models/`.
3. Pas `js/config.js` aan: `targets: "assets/targets/targets.mind"` en per poster de lijst `works` met
   `src: "assets/models/naam.glb"`. De volgorde van `posters` moet gelijk zijn aan de nummering in de
   compile-tool.

## Online zetten

Het is een statische site: upload de hele map naar een host met **https** (Netlify, GitHub Pages of je
eigen webruimte). Zonder https geeft de telefoon geen cameratoegang. Open daarna `tools/qr.html` op de
online site, controleer het adres en print de QR-code.

## Tips

- Posters met veel detail en contrast worden het best herkend; egale vlakken en herhalende patronen slecht.
- Houd `.glb`-bestanden klein (liefst onder 5 MB per stuk); ze worden pas geladen als de poster in beeld is.
- Mat papier en gelijkmatig licht voorkomen spiegeling.
