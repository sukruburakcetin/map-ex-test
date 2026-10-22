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
    console.log("Hybrid coverage handoff fix is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "hybrid-handoff-" + Date.now() + "-" + process.pid);
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
  console.log("Hybrid coverage handoff fix installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check coverage at close zoom, tilted playback and rapid zoom changes.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
