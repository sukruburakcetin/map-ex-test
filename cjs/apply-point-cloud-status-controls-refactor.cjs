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
    console.log("Point-cloud status controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "point-cloud-status-controls-" + Date.now() + "-" + process.pid);
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
  console.log("Point-cloud status controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check Adaptive on/off, cloud details/previous label and Retry/Resume/loading behavior.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
