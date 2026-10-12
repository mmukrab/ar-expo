// Intro: de naam van de maker klapt letter voor letter in beeld voordat het werk verschijnt.

const LETTER_VERTRAGING = 45; // ms tussen twee letters
const LETTER_DUUR = 900; // ms dat één letter erover doet om open te klappen
const LEESTIJD = 1400; // ms dat de volledige naam blijft staan
const UITFADEN = 600;

let timer = null;

// Zet tekst om in losse letters. Woorden blijven heel, zodat een naam nooit midden in een woord afbreekt.
function letters(element, tekst) {
  element.replaceChildren();
  let nummer = 0;
  for (const woord of tekst.trim().split(/\s+/)) {
    const groep = document.createElement("span");
    groep.className = "woord";
    for (const teken of woord) {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = teken;
      letter.style.animationDelay = `${nummer++ * LETTER_VERTRAGING}ms`;
      groep.append(letter);
    }
    element.append(groep, " ");
  }
  return nummer;
}

// Toont de intro en geeft terug na hoeveel milliseconden het werk mag verschijnen.
export function toonIntro(naam, titel) {
  const intro = document.getElementById("intro");
  if (!intro || !naam) return 0;
  clearTimeout(timer);

  const aantal = letters(document.getElementById("intro-naam"), naam);
  document.getElementById("intro-titel").textContent = titel ?? "";

  // Opnieuw starten, ook als de vorige intro nog bezig was.
  intro.classList.remove("zichtbaar", "weg");
  void intro.offsetWidth;
  intro.classList.add("zichtbaar");

  const opgebouwd = aantal * LETTER_VERTRAGING + LETTER_DUUR;
  timer = setTimeout(() => {
    intro.classList.add("weg");
    timer = setTimeout(() => intro.classList.remove("zichtbaar", "weg"), UITFADEN);
  }, opgebouwd + LEESTIJD);

  // Het werk komt op terwijl de naam nog staat, zodat de twee in elkaar overlopen.
  return opgebouwd + LEESTIJD / 2;
}

export function stopIntro() {
  clearTimeout(timer);
  document.getElementById("intro")?.classList.remove("zichtbaar", "weg");
}
