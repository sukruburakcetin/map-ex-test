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
    console.log("InfoBox nearby-controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "infobox-nearby-tools-" + Date.now() + "-" + process.pid);
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
  console.log("InfoBox nearby-controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check nearby loading/count, tray toggle, InfoBox scrolling and mobile layout.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
