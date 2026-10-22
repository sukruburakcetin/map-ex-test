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
    console.log("Viewer note selection extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "field-note-viewer-selection-" + Date.now() + "-" + process.pid);
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
  console.log("Viewer note selection extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check imagery note selection, image navigation and marker clearing.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
