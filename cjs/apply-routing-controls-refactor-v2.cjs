#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  zlib = require("node:zlib");
const data = JSON.parse(
  zlib.gunzipSync(
    Buffer.from(
      "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",
      "base64",
    ),
  ),
);
const root = process.cwd(),
  dry = process.argv.includes("--dry-run"),
  skipTests = process.argv.includes("--skip-tests");
const normalize = (s) =>
  s
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
function replaceOnce(text, block) {
  if (block.flexibleIndent) {
    const pattern = (value) => {
      const lines = block.allowBlankLines ? value.split("\n").filter((line) => line.trim()) : value.split("\n");
      const separator = block.allowBlankLines ? "\n(?:[\\t \\u00a0]*\n)*" : "\n";
      return new RegExp(lines.map((line) => "^[\\t \\u00a0]*" + line.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\t \\u00a0]*$").join(separator), "gm");
    };
    const variants = (block.beforeAlternatives || [block.before]).map(pattern),
      next = pattern(block.after);
    const matches = variants.flatMap((previous) => [...text.matchAll(previous)].map((match) => ({ previous, index: match.index })));
    const newMatches = [...text.matchAll(next)];
    if (newMatches.length === 1 && matches.length === 0) return text;
    if (matches.length !== 1 || newMatches.length !== 0) throw Error("Conflict in " + block.label + ". No files changed.");
    return text.replace(matches[0].previous, () => block.after);
  }
  const count = (value) => text.split(value).length - 1;
  const expected = block.count || 1;
  if (count(block.after) === expected) return text;
  if (count(block.before) !== expected || count(block.after) !== 0)
    throw Error("Conflict in " + block.label + ". No files changed. Preserve local edits; merge from review source.");
  return text.split(block.before).join(block.after);
}
try {
  for (const arg of process.argv.slice(2))
    if (!["--dry-run", "--skip-tests"].includes(arg)) throw Error("Unknown option: " + arg + ". Supported options: --dry-run, --skip-tests (plural).");
  if (!fs.existsSync(path.join(root, "src/runtime/widget.tsx"))) throw Error("Run from the widget project root.");
  for (const relative of data.requiredFiles || [])
    if (!fs.existsSync(path.join(root, relative))) throw Error("Required earlier step missing: " + relative + ". Apply apply-field-notes-editor-component-refactor-v2.cjs first.");
  const writes = [];
  for (const entry of data.entries) {
    const file = path.join(root, entry.file);
    if (entry.test && (skipTests || !fs.existsSync(file))) {
      console.log("Test adapter preserved/skipped: " + entry.file + ". Merge it before running local lifecycle tests.");
      continue;
    }
    if (!fs.existsSync(file)) throw Error("Required file missing: " + entry.file + ". No files changed.");
    const original = fs.readFileSync(file, "utf8");
    let updated = normalize(original);
    for (const block of entry.blocks) updated = replaceOnce(updated, block);
    for (const block of entry.optionalBlocks || []) {
      if (updated.split(block.before).length === 2) updated = updated.replace(block.before, block.after);
    }
    if (updated !== normalize(original))
      writes.push({ file, content: (original.startsWith("\uFEFF") ? "\uFEFF" : "") + updated.replace(/\n/g, original.includes("\r\n") ? "\r\n" : "\n") });
  }
  for (const module of data.modules || []) {
    if (module.test && skipTests) {
      console.log("Test module skipped: " + module.file);
      continue;
    }
    const target = path.join(root, module.file);
    if (fs.existsSync(target)) {
      if (normalize(fs.readFileSync(target, "utf8")) !== normalize(module.content)) throw Error("Conflict in " + module.file + ". No files changed.");
    } else writes.push({ file: target, content: module.content });
  }
  if (!writes.length) {
    console.log("Routing controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "routing-controls-" + Date.now() + "-" + process.pid);
  fs.mkdirSync(backup, { recursive: true });
  const originals = writes.map((x) => ({ ...x, bytes: fs.existsSync(x.file) ? fs.readFileSync(x.file) : null }));
  for (const x of originals)
    if (x.bytes !== null) {
      const dest = path.join(backup, path.relative(root, x.file));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, x.bytes);
    }
  fs.writeFileSync(
    path.join(backup, "changes.json"),
    JSON.stringify(
      originals.map((x) => ({ file: path.relative(root, x.file), created: x.bytes === null })),
      null,
      2,
    ),
  );
  try {
    for (const x of writes) {
      fs.mkdirSync(path.dirname(x.file), { recursive: true });
      fs.writeFileSync(x.file, x.content);
    }
  } catch (error) {
    for (const x of originals)
      if (x.bytes === null) {
        if (fs.existsSync(x.file)) fs.unlinkSync(x.file);
      } else fs.writeFileSync(x.file, x.bytes);
    throw error;
  }
  console.log("Routing controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check engine/mode selection, A/B points, time presets, route progress, GPX/reset and fullscreen menu placement.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
