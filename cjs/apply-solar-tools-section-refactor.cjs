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
    console.log("Solar tools extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "solar-tools-" + Date.now() + "-" + process.pid);
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
  console.log("Solar tools extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check solar feature visibility, toggle and active help text.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
