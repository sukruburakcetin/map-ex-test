#!/usr/bin/env node
"use strict";

// Generates a corrected installer without changing application source.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = fs.realpathSync(process.cwd());
const originalName = "apply-shared-map-startup-fix.cjs";
const outputName = "apply-shared-map-startup-fix-v2.cjs";
const legendName = "src/features/map-graphics/MapSymbolLegend.ts";
const normalize = (text) => text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

function checked(relative, missing = false) {
  let file = root;
  const parts = relative.split("/");

  for (let i = 0; i < parts.length; i++) {
    file = path.join(file, parts[i]);
    let stat;

    try {
      stat = fs.lstatSync(file);
    } catch (error) {
      if (missing && i === parts.length - 1 && error.code === "ENOENT") return file;
      throw error;
    }

    if (stat.isSymbolicLink() || (i === parts.length - 1 ? !stat.isFile() : !stat.isDirectory())) {
      throw new Error("Unsupported path: " + relative);
    }
  }

  return file;
}

function replaceCode(text, label, expression, lines) {
  const matches = [...text.matchAll(expression)];

  if (matches.length !== 1) {
    throw new Error("Conflict in " + label + ". App source unchanged.");
  }

  const match = matches[0];
  const lineStart = text.lastIndexOf("\n", match.index - 1) + 1;
  const indentation = text.slice(lineStart, match.index);

  if (!/^[ \t\u00a0]*$/.test(indentation)) {
    throw new Error("Unfamiliar formatting in " + label + ". App source unchanged.");
  }

  const replacement = lines.map((line, index) => (index ? indentation : "") + line).join("\n");

  return text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
}

try {
  if (process.argv.length > 2) {
    throw new Error("Run without flags: node repair-shared-map-startup-installer.cjs");
  }

  const output = checked(outputName, true);

  if (fs.existsSync(output)) {
    new vm.Script(fs.readFileSync(output, "utf8"), {
      filename: outputName,
    });
    console.log(outputName + " already exists; preserved.");
    console.log("Next: node " + outputName + " --skip-tests --dry-run");
    process.exit(0);
  }

  const original = normalize(fs.readFileSync(checked(originalName), "utf8"));

  new vm.Script(original, { filename: originalName });

  const startMarker = "const payload = ";
  const endMarker = "const root = fs.realpathSync(process.cwd());";
  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker);

  if (start < 0 || end <= start || original.indexOf(startMarker, start + 1) !== -1 || original.indexOf(endMarker, end + 1) !== -1) {
    throw new Error("Original installer layout differs. App source unchanged.");
  }

  // Read only the payload declaration in an isolated context.
  const encoded = vm.runInNewContext(
    original.slice(start, end) + "\nJSON.stringify(payload)",
    {},
    {
      timeout: 1000,
      contextCodeGeneration: { strings: false, wasm: false },
    },
  );

  const payload = JSON.parse(encoded);
  const expectedFiles = ["src/runtime/widget.tsx", legendName];

  if (
    !Array.isArray(payload.entries) ||
    payload.entries.length !== 2 ||
    !Array.isArray(payload.modules) ||
    payload.modules.length ||
    expectedFiles.some((file) => payload.entries.filter((entry) => entry.file === file).length !== 1)
  ) {
    throw new Error("Unexpected original installer targets. App source unchanged.");
  }

  const before = normalize(fs.readFileSync(checked(legendName), "utf8"));

  if (/\bprivate\s+map\b|\bthis\s*\.\s*map\b/.test(before)) {
    throw new Error("Legend already has map ownership or local changes. " + "App source unchanged.");
  }

  let after = replaceCode(before, "legend view field", /\bprivate\s+view\s*:\s*V\s*\|\s*null\s*=\s*null\s*;/g, [
    'private map: NonNullable<SymbolLegendView<L>["map"]> | null = null;',
  ]);

  after = replaceCode(
    after,
    "legend reuse guard",
    /\bif\s*\(\s*this\s*\.\s*view\s*!==\s*view\s*\)\s*this\s*\.\s*clear\s*\(\s*\)\s*;\s*if\s*\(\s*this\s*\.\s*layer\s*\)\s*return\s*;/g,
    ["const map = view?.map;", "if (!map) { this.clear(); return; }", "if (this.map !== map) this.clear();", "if (this.layer) return;"],
  );

  after = replaceCode(after, "legend map attachment", /\bthis\s*\.\s*view\s*=\s*view\s*;\s*view\s*\.\s*map\s*!\s*\.\s*add\s*\(\s*this\s*\.\s*layer\s*\)\s*;/g, [
    "this.map = map;",
    "try { map.add(this.layer); }",
    "catch (error) {",
    "  try { this.clear(); } catch (_) {}",
    "  throw error;",
    "}",
  ]);

  after = replaceCode(
    after,
    "legend teardown",
    /\bif\s*\(\s*this\s*\.\s*layer\s*\)\s*\{\s*this\s*\.\s*view\s*\?\.\s*map\s*\?\.\s*remove\s*\(\s*this\s*\.\s*layer\s*\)\s*;\s*this\s*\.\s*layer\s*\.\s*destroy\s*\(\s*\)\s*;\s*\}\s*this\s*\.\s*layer\s*=\s*null\s*;\s*this\s*\.\s*view\s*=\s*null\s*;/g,
    ["const layer = this.layer, map = this.map;", "this.layer = null; this.map = null;", "if (layer) {", "  try { map?.remove(layer); }", "  finally { layer.destroy(); }", "}"],
  );

  if (/\bthis\s*\.\s*view\b/.test(after)) {
    throw new Error("Additional legend view logic found. App source unchanged.");
  }

  const entry = payload.entries.find((value) => value.file === legendName);

  entry.blocks = [
    {
      label: "Legend map ownership, preserving local comments and formatting",
      wholeFile: true,
      before,
      after,
    },
  ];

  delete entry.absentAfterUninstall;
  delete entry.requiredOccurrences;

  const result = original.slice(0, start) + "const payload = " + JSON.stringify(payload, null, 2) + ";\n\n" + original.slice(end);

  new vm.Script(result, { filename: outputName });

  const descriptor = fs.openSync(output, "wx");
  let complete = false;

  try {
    fs.writeFileSync(descriptor, result);
    fs.fsyncSync(descriptor);
    complete = true;
  } finally {
    fs.closeSync(descriptor);
    if (!complete) fs.unlinkSync(output);
  }

  console.log("Created " + outputName + ". App source unchanged.");
  console.log("Next: node " + outputName + " --skip-tests --dry-run");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
