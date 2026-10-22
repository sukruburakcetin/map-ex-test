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
    console.log("Persistent waypoint controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "route-point-controls-" + Date.now() + "-" + process.pid);
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
  console.log("Persistent waypoint controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check retained A/B labels, Clear A/B and visibility after results clear or 2D/3D switching.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
