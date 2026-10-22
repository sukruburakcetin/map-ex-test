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
    console.log("Coverage year legend extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "year-legend-" + Date.now() + "-" + process.pid);
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
  console.log("Coverage year legend extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check date colors, year selection and click-to-clear behavior.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
