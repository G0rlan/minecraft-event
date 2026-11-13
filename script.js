/*
 * Skóre se načítá z tabulky (CSV).
 *  - Lokálně: soubor scores.csv vedle index.html
 *  - Google Sheets: Soubor → Sdílet → Publikovat na webu → CSV, a URL vložit do SCORES_URL
 *
 * Očekávaný formát CSV (první řádek je hlavička):
 *   tym,skore
 *   red,0
 *   blue,0
 */
const SCORES_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtlDJP_Kzo1vFt__PgfcPSCp6dmrDCLDeIPgZX62fkfHGarSwlw-FXXpQkh99Yo2mqnfV2eU3e-9e8/pub?gid=0&single=true&output=csv";
const REFRESH_MS = 30_000;          // jak často znovu načíst tabulku
const FALLBACK = { red: 0, blue: 0 }; // když se tabulku nepodaří načíst

const els = {
  red: document.querySelector('[data-team="red"] .score__value'),
  blue: document.querySelector('[data-team="blue"] .score__value'),
};

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map(r => r.split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, "")));
  const result = {};
  for (const [name = "", value = ""] of rows.slice(1)) {
    const key = name.toLowerCase();
    const num = parseInt(value.replace(/\s/g, ""), 10);
    if (Number.isNaN(num)) continue;
    if (/^(red|červ|cerv)/.test(key)) result.red = num;
    else if (/^(blue|modr)/.test(key)) result.blue = num;
  }
  return result;
}

function setScore(team, value) {
  const el = els[team];
  if (!el || value === undefined || el.textContent === String(value)) return;
  el.textContent = value;
  el.classList.remove("bump");
  void el.offsetWidth; // restart animace
  el.classList.add("bump");
}

async function loadScores() {
  try {
    const res = await fetch(`${SCORES_URL}${SCORES_URL.includes("?") ? "&" : "?"}t=${Date.now()}`);
    if (!res.ok) throw new Error(res.status);
    const data = parseCsv(await res.text());
    setScore("red", data.red);
    setScore("blue", data.blue);
  } catch (err) {
    console.warn("Skóre se nepodařilo načíst, používám výchozí hodnoty.", err);
    setScore("red", FALLBACK.red);
    setScore("blue", FALLBACK.blue);
  }
}

loadScores();
setInterval(loadScores, REFRESH_MS);
