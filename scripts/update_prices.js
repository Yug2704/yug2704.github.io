// scripts/update_prices.js
// Met à jour src/data/countries/*.json depuis src/data/master_prices.csv
// - Tolérant aux cellules vides (n'écrase pas les valeurs existantes avec null)
// - Crée le JSON pays s'il manque, à partir d'un gabarit
// - Estampille meta.lastUpdated

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CSV_PATH       = path.resolve(__dirname, "../src/data/master_prices.csv");
const COUNTRIES_DIR  = path.resolve(__dirname, "../src/data/countries");
const CATEGORIES_FP  = path.resolve(__dirname, "../src/data/categories.json");

// Parse “européen” -> number (1 234,56 -> 1234.56)
function parseEU(n) {
  if (n === "" || n == null) return null;
  const s = String(n).trim().replace(/\s/g, "").replace(",", ".");
  const val = Number(s);
  return Number.isFinite(val) ? val : null;
}

function readCSV(fp) {
  const raw = fs.readFileSync(fp, "utf8").trim();
  if (!raw) throw new Error("CSV vide");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const header = lines[0].split(",").map(s => s.trim());
  const idx    = Object.fromEntries(header.map((h,i)=>[h,i]));

  if (!("slug" in idx)) throw new Error("Colonne 'slug' absente du CSV");

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map(s=>s.trim());
    const slug = (cells[idx.slug] || "").toLowerCase();
    if (!slug) continue;
    const rowObj = { slug };
    for (const h of header) {
      if (h === "slug") continue;
      rowObj[h] = parseEU(cells[idx[h]]);
    }
    rows.push(rowObj);
  }
  return rows;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function loadCategories() {
  try {
    const raw = fs.readFileSync(CATEGORIES_FP, "utf8");
    const arr = JSON.parse(raw);
    // On accepte soit des slugs directs, soit des objets {slug: "..."}
    return arr.map(x => (typeof x === "string" ? x : x.slug)).filter(Boolean);
  } catch {
    // fallback si le fichier n'existe pas
    return ["restaurant","salaire","loyer","essence","cigarettes","cinema","hotel","habiter","eau1l","transportLocal","billetAvion","train","forfaitMobile"];
  }
}

function countryTemplate(slug) {
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    slug,
    name,
    banner: `/banners/${slug}.jpg`,
    aboutTitle: `À savoir sur ${name}`,
    kpis: {
      restaurant: null,
      salaireNet: null,
      loyer: null,
      essence: null,
      cigarettes: null,
      cinema: null,
      hotel: null,
      habiterIndex: null,
      eau1l: null,
      transportLocal: null,
      billetAvion: null,
      train: null,
      forfaitMobile: null
    },
    notes: [
      `Quelques repères de prix pour ${name}. Les valeurs peuvent varier selon la ville et la saison.`,
      `Ajoute ou ajuste les informations au besoin.`
    ]
  };
}

function updateJson(json, incoming, categoryKeys) {
  if (!json.kpis) json.kpis = {};
  let changed = false;

  for (const key of Object.keys(incoming)) {
    if (key === "slug") continue;
    // On n'écrit que si la valeur est non nulle ET si c'est une clé connue (ou déjà présente)
    const val = incoming[key];
    const isKnownKpi = categoryKeys.includes(key) || key === "salaireNet" || key === "habiterIndex";
    if (val == null || !isKnownKpi) continue;

    if (json.kpis[key] !== val) {
      json.kpis[key] = val;
      changed = true;
    }
  }

  json.meta = { ...(json.meta || {}), lastUpdated: new Date().toISOString() };
  return changed;
}

function main() {
  console.log("Lecture CSV:", CSV_PATH);
  ensureDir(COUNTRIES_DIR);

  const categoryKeys = loadCategories()
    // catégories “métier” → clés kpi attendues côté JSON
    .map(c => c === "salaire" ? "salaireNet"
           : c === "habiter" ? "habiterIndex"
           : c);

  const rows = readCSV(CSV_PATH);
  let totalChanged = 0;
  let totalCreated = 0;

  for (const row of rows) {
    const slug = row.slug;
    const fp   = path.join(COUNTRIES_DIR, `${slug}.json`);

    let json;
    if (!fs.existsSync(fp)) {
      json = countryTemplate(slug);
      totalCreated++;
    } else {
      json = JSON.parse(fs.readFileSync(fp, "utf8"));
    }

    const changed = updateJson(json, row, categoryKeys);

    if (changed || !fs.existsSync(fp)) {
      fs.writeFileSync(fp, JSON.stringify(json, null, 2) + "\n", "utf8");
      if (changed) totalChanged++;
      console.log(`- ${slug}: ${fs.existsSync(fp) ? "MISE À JOUR" : "CRÉÉ"}`);
    } else {
      console.log(`- ${slug}: aucun changement`);
    }
  }

  console.log(
    totalCreated || totalChanged
      ? `${totalCreated} créé(s), ${totalChanged} mis à jour.`
      : "Aucune modification."
  );
}

main();
