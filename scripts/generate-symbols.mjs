import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const checkMode = process.argv.includes('--check');

const sourceExt = new Set(['.ts', '.tsx']);
const exportPattern = /export\s+(?:const|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
const exportListPattern = /export\s*\{\s*([^}]+)\s*\}/gm;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(srcRoot).filter((f) => sourceExt.has(path.extname(f)));
const records = [];

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const text = fs.readFileSync(file, 'utf8');
  const symbols = new Set();

  let match;
  while ((match = exportPattern.exec(text)) !== null) {
    symbols.add(match[1]);
  }

  let listMatch;
  while ((listMatch = exportListPattern.exec(text)) !== null) {
    const names = listMatch[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.split(/\s+as\s+/i)[1] ?? part.split(/\s+as\s+/i)[0]);

    for (const name of names) {
      if (name !== 'default') symbols.add(name);
    }
  }

  if (/export\s+default\s+/m.test(text)) {
    symbols.add('default');
  }

  records.push({ file: rel, symbols: Array.from(symbols).sort() });
}

records.sort((a, b) => a.file.localeCompare(b.file));

const output = {
  generatedAt: new Date().toISOString(),
  source: 'scripts/generate-symbols.mjs',
  files: records,
};

const outPath = path.join(root, 'symbols.json');
const nextJson = `${JSON.stringify(output, null, 2)}\n`;

if (checkMode) {
  const currentJson = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  let currentComparable = currentJson;
  let nextComparable = nextJson;
  try {
    const currentObj = currentJson ? JSON.parse(currentJson) : null;
    const nextObj = JSON.parse(nextJson);
    if (currentObj) currentObj.generatedAt = '__IGNORED__';
    nextObj.generatedAt = '__IGNORED__';
    currentComparable = currentObj ? JSON.stringify(currentObj, null, 2) : '';
    nextComparable = JSON.stringify(nextObj, null, 2);
  } catch {
    // fall back to raw string compare when JSON parsing fails
  }

  if (currentComparable !== nextComparable) {
    console.error('symbols.json is out of date. Run: npm run symbols:generate');
    process.exit(1);
  }
  console.log(`symbols.json is up to date (${records.length} files).`);
} else {
  fs.writeFileSync(outPath, nextJson, 'utf8');
  console.log(`Wrote ${outPath} with ${records.length} files.`);
}
