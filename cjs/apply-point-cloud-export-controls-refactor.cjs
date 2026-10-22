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
    const pattern = (value) =>
      new RegExp(
        value
          .split("\n")
          .map((line) => "^[\\t \\u00a0]*" + line.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\t \\u00a0]*$")
          .join("\n"),
        "gm",
      );
    const previous = pattern(block.before),
      next = pattern(block.after);
    const oldMatches = [...text.matchAll(previous)],
      newMatches = [...text.matchAll(next)];
    if (newMatches.length === 1 && oldMatches.length === 0) return text;
    if (oldMatches.length !== 1 || newMatches.length !== 0) throw Error("Conflict in " + block.label + ". No files changed.");
    return text.replace(previous, () => block.after);
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
    console.log("Point-cloud export controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "point-cloud-export-controls-" + Date.now() + "-" + process.pid);
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
  console.log("Point-cloud export controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check CSV/PLY/LAS selection, download and exporting state.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
