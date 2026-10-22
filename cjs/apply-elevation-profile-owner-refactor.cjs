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
    console.log("Elevation profile owner extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "elevation-owner-" + Date.now() + "-" + process.pid);
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
  console.log("Elevation profile owner extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check profile toggling, sequence playback, flat-map terrain and 2D/3D view switches.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
