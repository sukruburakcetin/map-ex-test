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
  if (block.wholeFile) {
    const canonical = (value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");
    if (canonical(text) === canonical(block.after)) return text;
    if (canonical(text) !== canonical(block.before)) throw Error("Conflict in " + block.label + ". No files changed. Preserve local edits, including any appended code.");
    return block.after;
  }
  if (block.formatOnly) {
    // Compare complete nonblank lines. Only indentation/blank lines may differ;
    // executable text, comments, literal contents and internal spacing stay exact.
    const find = (value) => {
      const wanted = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      let offset = 0;
      const lines = text
        .split("\n")
        .map((line) => {
          const entry = { value: line.trim(), start: offset, end: offset + line.length };
          offset += line.length + 1;
          return entry;
        })
        .filter((line) => line.value);
      const hits = [];
      for (let i = 0; i <= lines.length - wanted.length; i++) {
        if (wanted.every((line, j) => line === lines[i + j].value)) hits.push({ start: lines[i].start, end: lines[i + wanted.length - 1].end });
      }
      return hits;
    };
    const next = find(block.after);
    if (next.length === 1) return text;
    const previous = find(block.before);
    if (previous.length !== 1 || next.length !== 0)
      throw Error("Conflict in " + block.label + ". No files changed. Code or comments differ beyond indentation/blank lines; preserve local edits.");
    const match = previous[0];
    return text.slice(0, match.start) + block.after + text.slice(match.end);
  }
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
    console.log("Share link browser operation consolidation is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "share-link-copy-" + Date.now() + "-" + process.pid);
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
  console.log("Share link browser operation consolidation installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check Share in secure/insecure contexts, clipboard fallback and framed Experience Builder.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
