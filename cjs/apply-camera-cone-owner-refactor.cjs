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
    console.log("Camera-cone resource owner extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "camera-cone-owner-" + Date.now() + "-" + process.pid);
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
  console.log("Camera-cone resource owner extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check camera cone geometry/reuse, terrain placement, clearing and view transfer.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
