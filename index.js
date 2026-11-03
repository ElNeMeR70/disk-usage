#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const root = process.argv[2] || ".";
const IGNORE = new Set(["node_modules", ".git"]);

function getDirSize(dir) {
  let total = 0;
  try {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        if (!IGNORE.has(f.name)) total += getDirSize(full);
      } else if (f.isFile()) {
        try { total += fs.statSync(full).size; } catch {}
      }
    }
  } catch {}
  return total;
}

const entries = [];
try {
  for (const item of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, item.name);
    const size = item.isDirectory() ? getDirSize(full) : fs.statSync(full).size;
    entries.push({ name: item.name, isDir: item.isDirectory(), size });
  }
  entries.sort((a, b) => b.size - a.size);
  console.log(`\x1b[36mDisk Usage for ${path.resolve(root)}:\x1b[0m\n`);
  entries.forEach(e => {
    const mb = (e.size / (1024 * 1024)).toFixed(2);
    console.log(`  \x1b[33m${mb.padStart(8)} MB\x1b[0m  ${e.isDir ? "\x1b[34m" + e.name + "/\x1b[0m" : e.name}`);
  });
} catch (e) {
  console.error("Error reading directory: " + e.message);
  process.exit(1);
}
