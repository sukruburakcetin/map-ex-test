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
  if (block.importAfter) {
    const added = block.importAfter;
    const already = text.split(added).length - 1;
    if (already === 1) return text;
    if (already > 1) throw Error("Conflict: duplicate adaptive controller imports. No files changed.");
    const existingController = /^import\s*\{[^{};]*\}\s*from\s*(['"])\.\.\/features\/point-cloud\/PointCloudAdaptiveDisplay\1[\t ]*;?/gm;
    if (existingController.test(text)) throw Error("Conflict: adaptive controller is already imported with a different declaration. No files changed.");
    const imports = [...text.matchAll(/^import\s*\{[^{};]*\}\s*from\s*(['"])\.\.\/utils\/pointCloudUtils\1[\t ]*;?/gm)];
    if (imports.length !== 1 || !/\bpointCloudDisplayExpression\b/.test(imports[0][0]))
      throw Error("Cannot locate the existing point-cloud display-policy import. No files changed.");
    const match = imports[0],
      end = match.index + match[0].length;
    return text.slice(0, end) + "\n" + added + text.slice(end);
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
    console.log("Adaptive point-cloud display controller extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "adaptive-display-controller-" + Date.now() + "-" + process.pid);
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
  console.log("Adaptive point-cloud display controller extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check adaptive movement/settling, tools, cloud clear and view switching.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
