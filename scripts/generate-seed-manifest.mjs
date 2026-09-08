// Generates scripts/seed-manifest.json from supabase/seed.sql.
//
// The manifest exists so check-seed-drift.mjs can tell "still holding
// its seeded value" apart from "the client edited this" — that's what
// makes REALISTIC seed content ("Mara Ellison", real-sounding project
// titles) safe rather than a risk of shipping to a client unnoticed
// (DECISIONS.md).
//
// Generated, not hand-maintained: hand-duplicating seed.sql's values
// into a second file is exactly how the two drift apart. Run this
// whenever seed.sql changes, and commit the regenerated manifest.
//
// Usage: node scripts/generate-seed-manifest.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "..", "supabase", "seed.sql");
const outPath = join(__dirname, "seed-manifest.json");

// Strip whole-line SQL comments before parsing. Required because one
// of them contains a literal semicolon ("A fork swaps these for its
// own; nothing here is hardcoded.") — without this, a naive
// values...(;) regex stops at that comment instead of the real
// statement terminator, silently truncating the parsed rows. Found by
// generating the manifest and getting 30 keys instead of 35.
const sql = readFileSync(seedPath, "utf-8")
  .split("\n")
  .filter((line) => !/^\s*--/.test(line))
  .join("\n");

// Tokenises one `insert into <table> (<cols>) values <tuples>;` block
// into an array of tuples, each an array of raw SQL scalars. Handles
// single-quoted strings with '' escaping, bare numbers, and `null` —
// the only scalar shapes seed.sql actually uses. No nested parens
// inside a tuple, which holds for every table here.
function parseTuples(block) {
  const tuples = [];
  let i = 0;
  while (i < block.length) {
    if (block[i] !== "(") {
      i++;
      continue;
    }
    const values = [];
    i++; // past '('
    while (block[i] !== ")") {
      while (/\s/.test(block[i])) i++;
      if (block[i] === "'") {
        i++;
        let str = "";
        while (!(block[i] === "'" && block[i + 1] !== "'")) {
          if (block[i] === "'" && block[i + 1] === "'") {
            str += "'";
            i += 2;
          } else {
            str += block[i];
            i++;
          }
        }
        i++; // closing quote
        values.push(str);
      } else {
        let raw = "";
        while (block[i] !== "," && block[i] !== ")") {
          raw += block[i];
          i++;
        }
        raw = raw.trim();
        values.push(raw === "null" ? null : Number.isNaN(Number(raw)) ? raw : Number(raw));
      }
      while (/\s/.test(block[i])) i++;
      if (block[i] === ",") i++;
    }
    tuples.push(values);
    i++; // past ')'
  }
  return tuples;
}

function extractBlock(table) {
  const re = new RegExp(
    `insert into public\\.${table}\\s*\\(([^)]*)\\)\\s*values\\s*([\\s\\S]*?);`,
    "i",
  );
  const match = sql.match(re);
  if (!match) throw new Error(`Could not find INSERT block for ${table}`);
  const columns = match[1].split(",").map((c) => c.trim());
  const tuples = parseTuples(match[2]);
  return { columns, tuples };
}

// --- site_settings: key/value, value is a JSON literal -------------
const settingsBlock = extractBlock("site_settings");
const site_settings = {};
for (const [key, jsonValue] of settingsBlock.tuples) {
  site_settings[key] = JSON.parse(jsonValue);
}

// --- content tables: keep only the columns that IDENTIFY a seed row,
// not every column (display_order gets renumbered by reordering,
// which is not drift) -----------------------------------------------
function rowsOf(table, identifyingColumns) {
  const { columns, tuples } = extractBlock(table);
  return tuples.map((tuple) => {
    const row = {};
    for (const col of identifyingColumns) {
      const idx = columns.indexOf(col);
      row[col] = tuple[idx];
    }
    return row;
  });
}

const manifest = {
  generated_from: "supabase/seed.sql",
  generated_at: new Date().toISOString().slice(0, 10),
  site_settings,
  skills: rowsOf("skills", ["name"]),
  experiences: rowsOf("experiences", ["title", "org", "start_date"]),
  works: rowsOf("works", ["title", "external_url"]),
  testimonials: rowsOf("testimonials", ["name", "quote"]),
  stats: rowsOf("stats", ["label", "number"]),
};

writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${outPath}`);
console.log(
  `  site_settings: ${Object.keys(site_settings).length} keys, ` +
    `${manifest.skills.length} skills, ${manifest.experiences.length} experiences, ` +
    `${manifest.works.length} works, ${manifest.testimonials.length} testimonials, ` +
    `${manifest.stats.length} stats`,
);
