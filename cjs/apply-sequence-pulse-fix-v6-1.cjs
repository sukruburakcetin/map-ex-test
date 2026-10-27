#!/usr/bin/env node
'use strict';
// Applies only the green-pulse lifecycle fix in src/runtime/widget.tsx.
// Run from the widget root. Already-applied manual changes are left untouched.
const fs = require('node:fs');
const path = require('node:path');
const blocks = [
  {
    "label": "pulse lifecycle change 1",
    "before": "        this._selectionRetry = null;\n        return;\n      }\n\n      if (previous?.sequenceId && previous.sequenceId !== sequenceId) this.clearActiveSequenceGraphics(previous.sequenceId);\n      this.clearActiveSequenceLayer();\n      this.setState({ isLoading: false });\n      const active = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || selected;\n      if (!this._liveSequenceFrames.current && String(active.id) === String(this.state.imageId)) {\n",
    "after": "        this._selectionRetry = null;\n        return;\n      }\n\n      if (previous?.sequenceId && previous.sequenceId !== sequenceId) this.clearActiveSequenceGraphics(previous.sequenceId, true);\n      this.clearActiveSequenceLayer();\n      this.setState({ isLoading: false });\n      const active = this._liveSequenceFrames.current || this._liveSequenceFrames.find(this.state.imageId) || selected;\n      if (!this._liveSequenceFrames.current && String(active.id) === String(this.state.imageId)) {\n"
  },
  {
    "label": "pulse lifecycle change 2",
    "before": "  }\n\n  /**\n   * Removes cone graphics and point markers for the given sequence ID\n   * (keeps polylines/text), and clears the pulsing point.\n   */\n  private clearActiveSequenceGraphics(sequenceId: string) {\n    this.clearActiveSequenceLayer();\n    const { jimuMapView, availableSequences } = this.state;\n    if (!jimuMapView) return;\n    const { view } = jimuMapView;\n\n    // Remove cones & blue active sequence markers\n    const toRemove: __esri.Graphic[] = [];\n    view.graphics.forEach((g) => {\n      if ((g as any).__isCone) {\n        toRemove.push(g);\n      }\n      if ((g as any).__isSequenceOverlay && g.attributes?.sequenceId === sequenceId) {\n        if (g.geometry.type !== \"polyline\" && g.symbol?.type !== \"text\") {\n",
    "after": "  }\n\n  /**\n   * Removes cone graphics and point markers for the given sequence ID\n   * (keeps polylines/text). Retiring an old route can preserve the current image marker/cone.\n   */\n  private clearActiveSequenceGraphics(sequenceId: string, preserveActiveImage = false) {\n    this.clearActiveSequenceLayer();\n    const { jimuMapView, availableSequences } = this.state;\n    if (!jimuMapView) return;\n    const { view } = jimuMapView;\n\n    // Remove cones & blue active sequence markers\n    const toRemove: __esri.Graphic[] = [];\n    view.graphics.forEach((g) => {\n      if ((g as any).__isCone && !preserveActiveImage) {\n        toRemove.push(g);\n      }\n      if ((g as any).__isSequenceOverlay && g.attributes?.sequenceId === sequenceId) {\n        if (g.geometry.type !== \"polyline\" && g.symbol?.type !== \"text\") {\n"
  },
  {
    "label": "pulse lifecycle change 3",
    "before": "        view.graphics.add(pointGraphic);\n      });\n    }\n\n    // Clear pulsing green point\n    this.clearGreenPulse();\n    this.clearConeGraphics();\n  }\n\n  /**\n   * Clears all sequence graphics and resets related state values.\n",
    "after": "        view.graphics.add(pointGraphic);\n      });\n    }\n\n    if (!preserveActiveImage) {\n      this.clearGreenPulse();\n      this.clearConeGraphics();\n    }\n  }\n\n  /**\n   * Clears all sequence graphics and resets related state values.\n"
  },
  {
    "label": "pulse lifecycle change 4",
    "before": "\n        // Restore bearing\n        this._lastBearing = currentBearing;\n\n        // Redraw graphics\n        if (currentImageCoords) {\n          this.currentGreenGraphic = this.drawPulsingPoint(currentImageCoords.lon, currentImageCoords.lat, [0, 255, 0, 1]);\n\n",
    "after": "\n        // Restore bearing\n        this._lastBearing = currentBearing;\n\n        // Binding clears old map feedback; restore the current image only afterward.\n        this.bindMapillaryEvents();\n\n        // Redraw graphics\n        if (currentImageCoords) {\n          this.currentGreenGraphic = this.drawPulsingPoint(currentImageCoords.lon, currentImageCoords.lat, [0, 255, 0, 1]);\n\n"
  },
  {
    "label": "pulse lifecycle change 5",
    "before": "          this.drawCone(currentImageCoords.lon, currentImageCoords.lat, currentBearing, length, spread);\n        }\n\n        this.applyCustomCameraAngle();\n        // Bind events\n        this.bindMapillaryEvents();\n\n        if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {\n          this.addViewerPointCloudRenderer({ ...this._pointCloudAcquisition.result, points: this._filteredPointCloudPoints }, currentImageId);\n        }\n        if (this.state.isMeasureMode) {\n",
    "after": "          this.drawCone(currentImageCoords.lon, currentImageCoords.lat, currentBearing, length, spread);\n        }\n\n        this.applyCustomCameraAngle();\n        if (this.state.pointCloudVisible && this._pointCloudAcquisition.result) {\n          this.addViewerPointCloudRenderer({ ...this._pointCloudAcquisition.result, points: this._filteredPointCloudPoints }, currentImageId);\n        }\n        if (this.state.isMeasureMode) {\n"
  }
];
const normalize = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const count = (text, part) => text.split(part).length - 1;
try {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--dry-run')) throw new Error('Supported option: --dry-run. Run from the widget root.');
  const root = process.cwd();
  for (const relative of ['src', 'src/runtime', 'src/runtime/widget.tsx']) {
    if (fs.lstatSync(path.join(root, relative)).isSymbolicLink()) throw new Error('Refusing a symlink: ' + relative);
  }
  const file = path.join(root, 'src/runtime/widget.tsx');
  const original = fs.readFileSync(file, 'utf8');
  let updated = normalize(original);
  for (const block of blocks) {
    const oldCount = count(updated, block.before), newCount = count(updated, block.after);
    if (oldCount === 0 && newCount === 1) continue;
    if (oldCount !== 1 || newCount !== 0) throw new Error('Conflicting or unrecognized source at ' + block.label + '. No files changed.');
    updated = updated.replace(block.before, block.after);
  }
  if (updated === normalize(original)) {
    console.log('Green pulse fix is already applied. No files changed.');
  } else if (args.includes('--dry-run')) {
    console.log('Would update only src/runtime/widget.tsx (green pulse lifecycle fix).');
  } else {
    const backupRoot = path.join(root, '.refactor-backups');
    if (fs.existsSync(backupRoot) && fs.lstatSync(backupRoot).isSymbolicLink()) throw new Error('Refusing a symlink backup directory.');
    const backup = path.join(backupRoot, 'sequence-pulse-fix-v6-1-' + Date.now() + '-' + process.pid);
    fs.mkdirSync(backup, { recursive: true });
    fs.writeFileSync(path.join(backup, 'widget.tsx'), original, { flag: 'wx' });
    const content = (original.startsWith('\uFEFF') ? '\uFEFF' : '') + updated.replace(/\n/g, original.includes('\r\n') ? '\r\n' : original.includes('\r') ? '\r' : '\n');
    const temporary = file + '.pulse-fix-' + process.pid + '.tmp';
    let ownsTemporary = false;
    try {
      fs.writeFileSync(temporary, content, { flag: 'wx', mode: fs.statSync(file).mode });
      ownsTemporary = true;
      fs.renameSync(temporary, file);
      ownsTemporary = false;
    } finally { if (ownsTemporary) fs.unlinkSync(temporary); }
    console.log('Updated only src/runtime/widget.tsx. Backup: ' + path.relative(root, path.join(backup, 'widget.tsx')));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
