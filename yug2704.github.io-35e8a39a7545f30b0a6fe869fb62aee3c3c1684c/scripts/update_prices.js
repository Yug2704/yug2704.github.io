// scripts/update_prices.js
// Lit src/data/master_prices.csv et met à jour src/data/countries/*.json
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CSV_PATH     = path.resolve(__dirname, "../src/data/master_prices.csv");
const COUNTRIES_DIR= path.resolve(__dirname, "../src/data/countries");

function parseEU(n) {
  if (n === "" || n == null) return null;
  const s = String(n).trim().replace(/\s/g, "").replace(",", ".");
  const val = Number(s);
  return Number.isFinite(val) ? val : null;
}

function readCSV(fp) {
  const raw = fs.readFileSync(fp, "utf8").trim();
  const lines = raw.split(/\r?\n/);
  const header = lines[0].split(",").map(s => s.trim());
  const idx = Object.fromEntries(header.map((h,i)=>[h,i]));
  const map = new Map();
  for (let i=1;i<lines.length;i++){
    if(!lines[i].trim()) continue;
    const cells = lines[i].split(",").map(s=>s.trim());
    const slug = (cells[idx.slug]||"").toLowerCase();
    if (!slug) continue;
    map.set(slug, {
      restaurant:    parseEU(cells[idx.restaurant]),
      salaireNet:    parseEU(cells[idx.salaireNet]),
      loyer:         parseEU(cells[idx.loyer]),
      essence:       parseEU(cells[idx.essence]),
      cinema:        parseEU(cells[idx.cinema]),
      hotel:         parseEU(cells[idx.hotel]),
      habiterIndex:  parseEU(cells[idx.habiterIndex]),
    });
  }
  return map;
}

function updateJsonFile(fp, newKpis) {
  const json = JSON.parse(fs.readFileSync(fp, "utf8"));
  if (!json.kpis) json.kpis = {};
  let changed = false;

  for (const [key, val] of Object.entries(newKpis)) {
    if (val == null) continue;              // ignore cellules vides
    if (json.kpis[key] !== val) {           // met à jour si différent
      json.kpis[key] = val;
      changed = true;
    }
  }
  // estampille (optionnel)
  json.meta = { ...(json.meta||{}), lastUpdated: new Date().toISOString() };

  if (changed) fs.writeFileSync(fp, JSON.stringify(json, null, 2) + "\n", "utf8");
  return changed;
}

function main(){
  console.log("Lecture CSV:", CSV_PATH);
  const map = readCSV(CSV_PATH);

  const files = fs.readdirSync(COUNTRIES_DIR).filter(f=>f.endsWith(".json"));
  let totalChanged = 0;

  for (const f of files) {
    const fp = path.join(COUNTRIES_DIR, f);
    const current = JSON.parse(fs.readFileSync(fp,"utf8"));
    const slug = (current.slug || path.basename(f, ".json")).toLowerCase();

    const fromCsv = map.get(slug);
    if (!fromCsv) { console.log(`- ${slug}: pas de ligne CSV → ignoré`); continue; }

    const changed = updateJsonFile(fp, fromCsv);
    console.log(`- ${slug}: ${changed ? "MISE À JOUR" : "aucun changement"}`);
    if (changed) totalChanged++;
  }

  if (totalChanged === 0) {
    console.log("Aucun fichier modifié.");
    return;
  }
  console.log(`${totalChanged} fichier(s) mis à jour.`);
}

main();
