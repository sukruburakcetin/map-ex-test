#!/usr/bin/env node
'use strict';
/** Sequence loading clarity installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests skips test file writes/removals; it does not run tests.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx sequence clarity block 1",
          "before": "  turboUpdatingVisible?: boolean;\n  coverageHelpOpen?: boolean;\n  sequenceRouteProgress?: string;\n  sequenceRouteLoading?: boolean;\n",
          "after": "  turboUpdatingVisible?: boolean;\n  coverageHelpOpen?: boolean;\n  nearbyFramesHintVisible?: boolean;\n  sequenceRouteProgress?: string;\n  sequenceRouteLoading?: boolean;\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 2",
          "before": "  private _lastSuccessfulSelection: any = null;\n  private _coverageNoticeHidden = false;\n  private _coverageHelpButton = React.createRef<HTMLButtonElement>();\n  private _focusCoverageHelp = (node: HTMLDivElement | null) => node?.focus();\n",
          "after": "  private _lastSuccessfulSelection: any = null;\n  private _coverageNoticeHidden = false;\n  private _nearbyFramesHintSeen = false;\n  private _nearbyFramesHintTimer: ReturnType<typeof setTimeout> | null = null;\n  private _coverageHelpButton = React.createRef<HTMLButtonElement>();\n  private _focusCoverageHelp = (node: HTMLDivElement | null) => node?.focus();\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 3",
          "before": "      }\n      if (current() && batch.length) this.ensureActiveSequenceLayer(view).addMany(batch);\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Could not draw nearby route markers:', error); }\n  }\n",
          "after": "      }\n      if (current() && batch.length) this.ensureActiveSequenceLayer(view).addMany(batch);\n      if (current()) this.announceNearbyFrames();\n    } catch (error) { if (current()) console.warn('[Mapillary sequence] Could not draw nearby route markers:', error); }\n  }\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 4",
          "before": "  }\n\n  private getCoverageBarPresentation(): { text: string; action?: \"show\" | \"data\" | \"tilt\" | \"zoom\" | \"retry\"; label?: string } {\n    const view = this.state.jimuMapView?.view;\n    const zoom = view?.zoom ?? 0;\n    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: \"Enter a valid organization ID\" };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: \"Zoom closer for organization coverage\", action: \"show\", label: \"Zoom to coverage\" };\n    if (this.state.coverageFrameResolving) return { text: \"Finding nearby image\u2026\" };\n    if (this.state.isLoading) return { text: \"Opening image\u2026\" };\n    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? `Image ready \u00b7 Sequence ${this.state.sequenceRouteProgress}` : \"Image ready \u00b7 Loading sequence\u2026\" };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? \"Image ready \u00b7 Sequence unavailable\" : \"Image could not load\" };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: \"Zoom closer for travel-method coverage\", action: \"show\", label: \"Zoom to images\" };\n",
          "after": "  }\n\n  private getCoverageBarPresentation(): { text: string; action?: \"show\" | \"data\" | \"tilt\" | \"zoom\" | \"retry\"; label?: string; busy?: boolean } {\n    const view = this.state.jimuMapView?.view;\n    const zoom = view?.zoom ?? 0;\n    if (this.state.coverageFrameResolving) return { text: \"Finding nearby image\u2026\", busy: true };\n    if (this.state.isLoading) return { text: \"Opening image\u2026\", busy: true };\n    if (this.state.imageId && this.state.sequenceRouteLoading) return { text: this.state.sequenceRouteProgress ? `Profile route \u00b7 ${this.state.sequenceRouteProgress}` : \"Loading profile route\u2026\", busy: true };\n    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: \"Loading coverage\u2026\", busy: !!this.state.turboUpdatingVisible };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: \"Enter a valid organization ID\" };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: \"Zoom closer for organization coverage\", action: \"show\", label: \"Zoom to coverage\" };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? \"Image ready \u00b7 Sequence unavailable\" : \"Image could not load\" };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: \"Zoom closer for travel-method coverage\", action: \"show\", label: \"Zoom to images\" };\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 5",
          "before": "    }\n    if (this.state.turboModeActive && zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n    if (this.state.turboLoading || this.state.turboUpdatingVisible) return { text: \"Updating coverage\u2026\" };\n    const error = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice() && !this.state.turboWarningIsHelp;\n    if (error && this.state.turboWarningAction === \"retry\") return { text: \"Coverage unavailable\", action: \"retry\", label: \"Retry\" };\n",
          "after": "    }\n    if (this.state.turboModeActive && zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n    const error = !!this.state.zoomWarningMessage && this.shouldShowCoverageNotice() && !this.state.turboWarningIsHelp;\n    if (error && this.state.turboWarningAction === \"retry\") return { text: \"Coverage unavailable\", action: \"retry\", label: \"Retry\" };\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 6",
          "before": "    if (error) return { text: \"Coverage needs attention\", ...(this.state.turboWarningAction === \"zoom\" ? { action: \"zoom\" as const, label: \"Move closer\" } : {}) };\n    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? \"Select a traffic sign, object or image point\" : this.state.trafficSignsActive ? \"Select a traffic sign or image point\" : \"Select an object or image point\" };\n    if (this.state.imageId) return { text: \"Select another point to explore\" };\n    if (this._turboCloseReady && zoom >= TURBO_LIMITS.closeZoom) return { text: this._turboCloseGraphics.size ? \"Image points available\" : \"No image points here\" };\n",
          "after": "    if (error) return { text: \"Coverage needs attention\", ...(this.state.turboWarningAction === \"zoom\" ? { action: \"zoom\" as const, label: \"Move closer\" } : {}) };\n    if (this.state.trafficSignsActive || this.state.objectsActive) return { text: this.state.trafficSignsActive && this.state.objectsActive ? \"Select a traffic sign, object or image point\" : this.state.trafficSignsActive ? \"Select a traffic sign or image point\" : \"Select an object or image point\" };\n    if (this.state.imageId && this.state.nearbyFramesHintVisible) return { text: \"Blue dots: nearby frames\" };\n    if (this.state.imageId) return { text: \"Select another point to explore\" };\n    if (this._turboCloseReady && zoom >= TURBO_LIMITS.closeZoom) return { text: this._turboCloseGraphics.size ? \"Image points available\" : \"No image points here\" };\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 7",
          "before": "    if (this._turboCloseReady && !this._turboCloseGraphics.size) return \"Try another area or adjust your filters\";\n    return \"Hover to preview \u00b7 Click to open\";\n  }\n\n",
          "after": "    if (this._turboCloseReady && !this._turboCloseGraphics.size) return \"Try another area or adjust your filters\";\n    return \"Hover to preview \u00b7 Click to open\";\n  }\n\n  /** Explain actual nearby dots once per tab/widget, using the existing guide bar.\n   * No network work, overlay, or playback timer is introduced by this hint.\n   */\n  private announceNearbyFrames(): void {\n    if (this._nearbyFramesHintSeen || !this.shouldShowCoverageBar() || this.state.coverageHelpOpen ||\n      this.state.isLoading || this.state.coverageFrameResolving || this.state.sequenceRouteLoading ||\n      this.state.turboLoading || this.state.turboUpdatingVisible || this.state.selectionError) return;\n    const view = this.state.jimuMapView?.view, overlay = this._activeSequenceOverlay;\n    if (!view || view.destroyed || view.zoom < LIVE_SEQUENCE_LIMITS.markerZoom || overlay?.view !== view || !overlay.points.size) return;\n    // Avoid a hint hidden behind higher-priority feature guidance.\n    if (this.getCoverageBarPresentation().text !== \"Select another point to explore\") return;\n    const key = `mapillary-nearby-frames-hint-v1:${this.props.id || 'explorer'}`;\n    this._nearbyFramesHintSeen = true;\n    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* Session storage is optional. */ }\n    this.setState({ nearbyFramesHintVisible: true });\n    this._nearbyFramesHintTimer = setTimeout(() => {\n      this._nearbyFramesHintTimer = null; this.setState({ nearbyFramesHintVisible: false });\n    }, 7000);\n  }\n\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 8",
          "before": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (this.state.isElevationProfileActive && (prevState.sequenceImages !== this.state.sequenceImages ||\n      prevState.jimuMapView?.view !== this.state.jimuMapView?.view)) void this.updateElevationProfile();\n",
          "after": "\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.isLoading !== this.state.isLoading || prevState.coverageFrameResolving !== this.state.coverageFrameResolving ||\n      prevState.sequenceRouteLoading !== this.state.sequenceRouteLoading || prevState.turboLoading !== this.state.turboLoading ||\n      prevState.turboUpdatingVisible !== this.state.turboUpdatingVisible || prevState.coverageHelpOpen !== this.state.coverageHelpOpen)\n      this.announceNearbyFrames();\n    if (this.state.isElevationProfileActive && (prevState.sequenceImages !== this.state.sequenceImages ||\n      prevState.jimuMapView?.view !== this.state.jimuMapView?.view)) void this.updateElevationProfile();\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 9",
          "before": "  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._sceneTerrain?.dispose(); this._sceneTerrain = null;\n    this._organizationNameDisposed = true; ++this._organizationNameRevision;\n",
          "after": "  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    if (this._nearbyFramesHintTimer !== null) clearTimeout(this._nearbyFramesHintTimer);\n    this._nearbyFramesHintTimer = null;\n    this._sceneTerrain?.dispose(); this._sceneTerrain = null;\n    this._organizationNameDisposed = true; ++this._organizationNameRevision;\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 10",
          "before": "            <img src={MAPILLARY_IMAGE} alt=\"\" aria-hidden=\"true\" style={coverageNoticeStyles.statusIcon} />\n            <div role=\"status\" aria-live=\"polite\" aria-atomic=\"true\" style={coverageNoticeStyles.status}>\n              {(this.state.turboUpdatingVisible || this.state.isLoading || this.state.coverageFrameResolving || this.state.sequenceRouteLoading) && <svg width=\"12\" height=\"12\" viewBox=\"0 0 16 16\" aria-hidden=\"true\" style={{ flexShrink: 0, display: \"block\" }}>\n                <circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"none\" stroke=\"#436052\" strokeWidth=\"2\" />\n                <path d=\"M8 2 A6 6 0 0 1 14 8\" fill=\"none\" stroke=\"#91d9b5\" strokeWidth=\"2\" strokeLinecap=\"round\">\n",
          "after": "            <img src={MAPILLARY_IMAGE} alt=\"\" aria-hidden=\"true\" style={coverageNoticeStyles.statusIcon} />\n            <div role=\"status\" aria-live=\"polite\" aria-atomic=\"true\" style={coverageNoticeStyles.status}>\n              {coveragePresentation.busy && <svg width=\"12\" height=\"12\" viewBox=\"0 0 16 16\" aria-hidden=\"true\" style={{ flexShrink: 0, display: \"block\" }}>\n                <circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"none\" stroke=\"#436052\" strokeWidth=\"2\" />\n                <path d=\"M8 2 A6 6 0 0 1 14 8\" fill=\"none\" stroke=\"#91d9b5\" strokeWidth=\"2\" strokeLinecap=\"round\">\n"
        },
        {
          "label": "src/runtime/widget.tsx sequence clarity block 11",
          "before": "            <div style={{ ...coverageNoticeStyles.message, marginBottom: 6 }}><strong>{coveragePresentation.text}</strong></div>\n            <div style={coverageNoticeStyles.message}>{this.state.turboFilterOnFoot !== undefined ? \"Travel-method coverage starts at regional zoom; zoom closer to see matching coverage lines. \" : \"At the farthest zooms, hover an overview dot to preview its representative image; tap or click to open it. \"}At regional zooms, click a coverage line to open a representative image. Zoom closer to select individual images. Hover a point to preview it; tap or click to open imagery.</div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n            {coverageNoticeVisible && !this.state.turboWarningIsHelp && <p style={coverageNoticeStyles.message}>{this.state.zoomWarningMessage}</p>}\n",
          "after": "            <div style={{ ...coverageNoticeStyles.message, marginBottom: 6 }}><strong>{coveragePresentation.text}</strong></div>\n            <div style={coverageNoticeStyles.message}>{this.state.turboFilterOnFoot !== undefined ? \"Travel-method coverage starts at regional zoom; zoom closer to see matching coverage lines. \" : \"At the farthest zooms, hover an overview dot to preview its representative image; tap or click to open it. \"}At regional zooms, click a coverage line to open a representative image. Zoom closer to select individual images. Hover a point to preview it; tap or click to open imagery.</div>\n            <div aria-label=\"Selected sequence symbols\" style={{ ...coverageNoticeStyles.message, marginTop: 8 }}>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7 }}><span aria-hidden=\"true\" style={{ width: 18, borderTop: \"2px solid #739dff\", flexShrink: 0 }} /><span>Blue line \u00b7 Selected sequence</span></div>\n              <div style={{ display: \"flex\", alignItems: \"center\", gap: 7, marginTop: 3 }}><span aria-hidden=\"true\" style={{ width: 6, height: 6, margin: \"0 6px\", borderRadius: \"50%\", background: \"blue\", border: \"1px solid #e3da30\", flexShrink: 0 }} /><span>Blue dots \u00b7 Nearby frames</span></div>\n              <p style={{ margin: \"5px 0 0\" }}>More imagery may continue beyond the dots. Select coverage elsewhere to explore. Route previews follow available coverage tiles.</p>\n            </div>\n            {!!guideContext.length && <div style={{ ...coverageNoticeStyles.message, marginTop: 8 }}><strong>Active settings</strong><ul style={{ margin: \"4px 0\", paddingLeft: 18 }}>{guideContext.map(item => <li key={item}>{item}</li>)}</ul></div>}\n            {coverageNoticeVisible && !this.state.turboWarningIsHelp && <p style={coverageNoticeStyles.message}>{this.state.zoomWarningMessage}</p>}\n"
        }
      ],
      "absentAfterUninstall": [
        "announceNearbyFrames",
        "nearbyFramesHintVisible",
        "Selected sequence symbols"
      ],
      "requiredOccurrences": [
        {
          "text": "announceNearbyFrames",
          "count": 3
        },
        {
          "text": "nearbyFramesHintVisible",
          "count": 4
        },
        {
          "text": "Selected sequence symbols",
          "count": 1
        }
      ]
    },
    {
      "file": "src/components/Legend.tsx",
      "blocks": [
        {
          "label": "src/components/Legend.tsx sequence clarity block 1",
          "before": "\n            <div style={{ display: \"flex\", flexDirection: \"column\" }}>\n                {turboModeActive ? (\n                    <React.Fragment>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#00ff00\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Active Frame</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"blue\"), border: \"1px solid #e3da30\" }}></span> <span style={legendTextStyle}>Sequence Images</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#a52a2a\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Coverage</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"transparent\"), border: \"1.5px solid cyan\" }}></span> <span style={legendTextStyle}>First Selected</span></div>\n",
          "after": "\n            <div style={{ display: \"flex\", flexDirection: \"column\" }}>\n                <div style={legendRowStyle}><span aria-hidden=\"true\" style={{ width: 12, borderTop: \"2px solid blue\", flexShrink: 0 }} /><span style={legendTextStyle}>Selected Sequence</span></div>\n                {turboModeActive ? (\n                    <React.Fragment>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#00ff00\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Active Frame</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"blue\"), border: \"1px solid #e3da30\" }}></span> <span style={legendTextStyle}>Nearby Frames</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#a52a2a\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Coverage</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"transparent\"), border: \"1.5px solid cyan\" }}></span> <span style={legendTextStyle}>First Selected</span></div>\n"
        },
        {
          "label": "src/components/Legend.tsx sequence clarity block 2",
          "before": "                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"black\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Clicked Point</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#00ff00\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Active Frame</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"blue\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Active Sequence</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"yellow\"), border: \"2px solid orange\" }}></span> <span style={legendTextStyle}>Next Frame</span></div>\n                        \n",
          "after": "                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"black\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Clicked Point</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"#00ff00\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Active Frame</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"blue\"), border: \"1px solid white\" }}></span> <span style={legendTextStyle}>Nearby Frames</span></div>\n                        <div style={legendRowStyle}><span style={{ ...legendCircleStyle(\"yellow\"), border: \"2px solid orange\" }}></span> <span style={legendTextStyle}>Next Frame</span></div>\n                        \n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    },
    {
      "file": "src/features/map-graphics/MapSymbolLegend.ts",
      "blocks": [
        {
          "label": "src/features/map-graphics/MapSymbolLegend.ts sequence clarity block 1",
          "before": "        uniqueValueInfos: [\n          { value: \"active\", label: \"Active Image\", symbol: { type: \"simple-marker\", color: \"#00ff00\", size: 9, outline: { color: \"white\", width: 1 } } },\n          { value: \"sequence\", label: \"Active Sequence Images\", symbol: { type: \"simple-marker\", color: \"blue\", size: 7, outline: { color: \"yellow\", width: 1 } } },\n          { value: \"hover\", label: \"Hovered Image\", symbol: { type: \"simple-marker\", color: \"brown\", size: 7, outline: { color: \"white\", width: 1 } } },\n          { value: \"first\", label: \"First Selected Image\", symbol: { type: \"simple-marker\", color: [0,0,0,0], size: 7, outline: { color: \"cyan\", width: 1.5 } } },\n",
          "after": "        uniqueValueInfos: [\n          { value: \"active\", label: \"Active Image\", symbol: { type: \"simple-marker\", color: \"#00ff00\", size: 9, outline: { color: \"white\", width: 1 } } },\n          { value: \"sequence\", label: \"Nearby Frames\", symbol: { type: \"simple-marker\", color: \"blue\", size: 7, outline: { color: \"yellow\", width: 1 } } },\n          { value: \"hover\", label: \"Hovered Image\", symbol: { type: \"simple-marker\", color: \"brown\", size: 7, outline: { color: \"white\", width: 1 } } },\n          { value: \"first\", label: \"First Selected Image\", symbol: { type: \"simple-marker\", color: [0,0,0,0], size: 7, outline: { color: \"cyan\", width: 1.5 } } },\n"
        }
      ],
      "absentAfterUninstall": [],
      "requiredOccurrences": []
    }
  ],
  "modules": []
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'sequence-loading-clarity-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-sequence-loading-clarity.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited organization filter references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Sequence loading clarity is already uninstalled. No files changed.' : 'Sequence loading clarity is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'sequence-loading-clarity', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Sequence loading clarity ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. The guide explains selected-route lines and nearby-frame dots. Busy indicators name the active operation. A brief nearby-frame hint appears once per tab/widget.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
