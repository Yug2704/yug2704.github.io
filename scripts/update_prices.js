// scripts/update_prices.js
// Lit src/data/master_prices.csv et met à jour src/data/countries/*.json

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CSV_PATH      = path.resolve(__dirname, "../src/data/master_prices.csv");
const COUNTRIES_DIR = path.resolve(__dirname, "../src/data/countries");

// Util : parse "européen" -> number (1 234,56 -> 1234.56)
function parseEU(n) {
  if (n === "" || n == null) return null;
  const s = String(n).trim().replace(/\s/g, "").replace(",", ".");
  const val = Number(s);
  return Number.isFinite(val) ? val : null;
}

// Lecture CSV -> Map<slug, {kpis}>
function readCSV(fp) {
  const raw = fs.readFileSync(fp, "utf8").trim();
  const lines = raw.split(/\r?\n/);
  if (lines.length === 0) throw new Error("CSV vide");

  const header = lines[0].split(",").map(s => s.trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  // Permet d'être tolérant si certaines colonnes manquent
  const has = (col) => Object.prototype.hasOwnProperty.call(idx, col);

  const map = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const cells = line.split(",").map(s => s.trim());
    const slug = (cells[idx.slug] || "").toLowerCase();
    if (!slug) continue;

    const kpis = {
      restaurant:   has("restaurant")   ? parseEU(cells[idx.restaurant])   : null,
      salaireNet:   has("salaireNet")   ? parseEU(cells[idx.salaireNet])   : null,
      loyer:        has("loyer")        ? parseEU(cells[idx.loyer])        : null,
      essence:      has("essence")      ? parseEU(cells[idx.essence])      : null,

      // ✅ nouvelle KPI
      cigarettes:   has("cigarettes")   ? parseEU(cells[idx.cigarettes])   : null,

      cinema:       has("cinema")       ? parseEU(cells[idx.cinema])       : null,
      hotel:        has("hotel")        ? parseEU(cells[idx.hotel])        : null,
      habiterIndex: has("habiterIndex") ? parseEU(cells[idx.habiterIndex]) : null,
    };

    map.set(slug, kpis);
  }

  return map;
}

// Met à jour un fichier country.json avec les nouvelles valeurs (sans écraser les null)
function updateJsonFile(fp, newKpis) {
  const json = JSON.parse(fs.readFileSync(fp, "utf8"));
  if (!json.kpis) json.kpis = {};
  let changed = false;

  for (const [key, val] of Object.entries(newKpis)) {
    if (val == null) continue; // ignore cellules vides
    if (json.kpis[key] !== val) {
      json.kpis[key] = val;
      changed = true;
    }
  }

  // estampille (optionnel)
  json.meta = { ...(json.meta || {}), lastUpdated: new Date().toISOString() };

  if (changed) {
    fs.writeFileSync(fp, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
  return changed;
}

// Programme principal
function main() {
  console.log("Lecture CSV:", CSV_PATH);
  const map = readCSV(CSV_PATH);

  const files = fs.readdirSync(COUNTRIES_DIR).filter(f => f.endsWith(".json"));
  let totalChanged = 0;

  for (const f of files) {
    const fp = path.join(COUNTRIES_DIR, f);
    const current = JSON.parse(fs.readFileSync(fp, "utf8"));
    const slug = (current.slug || path.basename(f, ".json")).toLowerCase();

    const fromCsv = map.get(slug);
    if (!fromCsv) {
      console.log(`- ${slug}: pas de ligne CSV → ignoré`);
      continue;
    }

    const changed = updateJsonFile(fp, fromCsv);
    console.log(`- ${slug}: ${changed ? "MISE À JOUR" : "aucun changement"}`);
    if (changed) totalChanged++;
  }

  console.log(totalChanged === 0 ? "Aucun fichier modifié." : `${totalChanged} fichier(s) mis à jour.`);
}

main();
