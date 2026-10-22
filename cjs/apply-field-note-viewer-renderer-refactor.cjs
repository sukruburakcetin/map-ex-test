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
    console.log("Field-note viewer renderer extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "field-note-viewer-renderer-" + Date.now() + "-" + process.pid);
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
  console.log("Field-note viewer renderer extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check imagery note-marker alignment, navigation and repeated viewer activation/removal.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
