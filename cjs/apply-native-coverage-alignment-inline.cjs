#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const skipTests = args.includes("--skip-tests") || args.includes("--skip-test");
const uninstall = args.includes("--uninstall");
const root = fs.realpathSync(process.cwd());
const normalize = (value) =>
  String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = "native-coverage-alignment-";
const encoded = [
  "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",
].join("");
const payload = JSON.parse(zlib.gunzipSync(Buffer.from(encoded, "base64")).toString("utf8"));
function conflict(label) {
  throw new Error("Conflict in " + label + ". No source files changed. Preserve local edits.");
}
function targetFor(relative) {
  if (typeof relative !== "string" || !relative || relative.includes("\\") || relative.includes(":") || relative.includes("\0")) throw new Error("Invalid patch path.");
  const parts = relative.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) throw new Error("Invalid patch path.");
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith(".." + path.sep) || path.isAbsolute(relation)) throw new Error("Patch path escapes the widget folder.");
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try {
      stat = fs.lstatSync(parent);
    } catch (error) {
      if (error.code === "ENOENT") break;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error("Symbolic links are not supported: " + relative + ". No source files changed.");
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error("Parent path is not a folder: " + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error("Unsupported target type: " + relative);
  }
  return target;
}
function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error("Target is not a regular file: " + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    if (required) throw new Error("Required file missing: " + relative + ". No source files changed.");
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}
function formatLike(text, original) {
  const raw = original.toString("utf8");
  const bom = raw.startsWith("\uFEFF") ? "\uFEFF" : "";
  return Buffer.from(bom + (raw.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text));
}
function transformBlock(text, block, reverse) {
  const before = normalize(block.before),
    after = normalize(block.after);
  if (!before || !after || before === after) throw new Error("Invalid block: " + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some((name) => text.includes(name))) conflict(block.label + " (partially edited diagnostic)");
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some((name) => text.includes(name))) conflict(block.label + " (existing declaration)");
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}
function ensureParents(relative) {
  const segments = relative.split("/");
  segments.pop();
  let current = "";
  for (const segment of segments) {
    current = current ? current + "/" + segment : segment;
    const directory = targetFor(current);
    try {
      fs.mkdirSync(directory);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Unsafe parent directory: " + current);
  }
}
function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error("File changed during validation: " + item.relative + ". No source files changed.");
  }
}
function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error("File write made no progress.");
    offset += written;
  }
}
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original))
      throw new Error("File changed before write: " + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}
function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error("Created file replaced by another process.");
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, "wx", item.mode & 0o777);
        try {
          fs.writeFileSync(descriptor, item.original);
        } finally {
          fs.closeSync(descriptor);
        }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try {
          fs.ftruncateSync(descriptor, 0);
          writeExact(descriptor, item.original);
        } finally {
          fs.closeSync(descriptor);
        }
      }
    } catch (error) {
      errors.push(item.relative + ": " + error.message);
    }
  }
  return errors;
}
try {
  const allowed = ["--dry-run", "--skip-tests", "--skip-test", "--uninstall"];
  if (args.some((arg) => !allowed.includes(arg))) throw new Error("Usage: node apply-native-coverage-alignment-inline.cjs [--dry-run] [--skip-tests] [--uninstall]");
  readTarget("src/runtime/widget.tsx", true);
  const writes = [],
    seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error("Duplicate patch path: " + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString("utf8"));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some((marker) => text.includes(marker))) {
      conflict(entry.file + " (edited diagnostic references remain)");
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some((rule) => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + " (diagnostic references differ)");
    }
    if (text !== normalize(current.bytes.toString("utf8"))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error("Duplicate patch path: " + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString("utf8")) !== normalize(module.content)) conflict(module.file + " (existing module)");
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  if (skipTests) console.log("Test file writes/removals skipped. Existing tests are preserved; tests are not run by this installer.");
  if (!writes.length) {
    console.log(uninstall ? "Diagnostic is already uninstalled. No files changed." : "Diagnostic is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log(
      "Dry run passed. Would " +
        (uninstall ? "uninstall" : "install") +
        ":\n" +
        writes.map((item) => "  " + (item.content === null ? "remove " : item.original === null ? "create " : "update ") + item.relative).join("\n"),
    );
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  const backupRelative = ".refactor-backups/" + prefix + (uninstall ? "uninstall-" : "") + Date.now() + "-" + process.pid;
  ensureParents(backupRelative + "/changes.json");
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + "/" + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), "wx");
    try {
      fs.writeFileSync(descriptor, item.original);
    } finally {
      fs.closeSync(descriptor);
    }
  }
  const manifest = writes.map((item) => ({
    file: item.relative,
    operation: item.content === null ? "remove" : item.original === null ? "create" : "update",
    originalSha256: item.original === null ? null : digest(item.original),
    resultSha256: item.content === null ? null : digest(item.content),
  }));
  fs.writeFileSync(path.join(backup, "changes.json"), JSON.stringify({ installer: "native-coverage-alignment-diagnostic", uninstall, changes: manifest }, null, 2) + "\n", {
    flag: "wx",
  });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), "wx");
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev;
        item.createdIno = stat.ino;
        item.started = true;
        try {
          fs.writeFileSync(descriptor, item.content);
        } finally {
          fs.closeSync(descriptor);
        }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + "\nRollback needs attention; original bytes are in " + backupRelative + ":\n" + errors.join("\n"));
    throw new Error(error.message + "\nInstaller writes rolled back. Original source files restored. Backup: " + backupRelative);
  }
  console.log("Native coverage alignment diagnostic " + (uninstall ? "uninstalled" : "installed") + ".");
  console.log("Backup: " + backupRelative);
  console.log("Rebuild/reload Experience Builder; enable with window.__mlyCoverageAlignment.enable() in the browser console.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
// END OF INSTALLER
