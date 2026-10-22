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
    console.log("Coverage analysis launch extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "coverage-analysis-trigger-" + Date.now() + "-" + process.pid);
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
  console.log("Coverage analysis launch extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check analysis launch at low/high zoom, loading state and hover reset.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
