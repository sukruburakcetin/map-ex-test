#!/usr/bin/env node
/** Check local inline Markdown links from each guide's actual location. No dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', '.refactor-backups', 'node_modules', '__pycache__']);
const documents = [];
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.startsWith('.venv')) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.isFile() && file.endsWith('.md')) documents.push(file);
  }
}
scan(root);
let links = 0;
const errors = [];
for (const file of documents) {
  // Ignore examples: Python expressions such as publisher["create_plan"](... ) are not links.
  const text = fs.readFileSync(file, 'utf8')
    .replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm, block => block.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, code => ' '.repeat(code.length));
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split(' "')[0].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    links++;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) {
      const line = text.slice(0, match.index).split('\n').length;
      errors.push(`${path.relative(root, file)}:${line}: missing ${target}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
console.log(`${documents.length} Markdown files, ${links} local links, ${errors.length} broken links.`);
