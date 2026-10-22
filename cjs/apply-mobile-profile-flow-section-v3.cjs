#!/usr/bin/env node
'use strict';
/** In-flow mobile profile section installer. Plain source payload.
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
          "label": "src/runtime/widget.tsx mobile flow section block 1",
          "before": "export default class Widget extends React.PureComponent<AllWidgetProps<any>, State> {\n  viewerContainer = React.createRef<HTMLDivElement>();\n  minimapContainer = React.createRef<HTMLDivElement>();\n\n",
          "after": "export default class Widget extends React.PureComponent<AllWidgetProps<any>, State> {\n  viewerContainer = React.createRef<HTMLDivElement>();\n  private _profileFlowHost: HTMLDivElement | null = null;\n  private setProfileFlowHost = (node: HTMLDivElement | null): void => {\n    this._profileFlowHost = node;\n    this._elevationProfile?.refreshLayout();\n  };\n  minimapContainer = React.createRef<HTMLDivElement>();\n\n"
        },
        {
          "label": "src/runtime/widget.tsx mobile flow section block 2",
          "before": "  private ensureElevationProfileOwner(): ElevationProfileController {\n    this._elevationProfile ??= new ElevationProfileController(\n      ids => loadArcGISJSAPIModules(ids), () => this.ArcGISModules.Graphic,\n    );\n    return this._elevationProfile;\n",
          "after": "  private ensureElevationProfileOwner(): ElevationProfileController {\n    this._elevationProfile ??= new ElevationProfileController(\n      ids => loadArcGISJSAPIModules(ids), () => this.ArcGISModules.Graphic, () => this._profileFlowHost,\n    );\n    return this._elevationProfile;\n"
        },
        {
          "label": "src/runtime/widget.tsx mobile flow section block 3",
          "before": "        )}\n\n        <div className=\"mly-viewer-workspace\" style={{ flex: \"1 1 0\", minHeight: 0, minWidth: 0, position: \"relative\", isolation: \"isolate\", zIndex: 0, display: \"flex\", flexDirection: \"column\", overflow: \"hidden\" }}>\n        {viewerArea}\n",
          "after": "        )}\n\n        {/* Empty React-owned host: the SDK profile reserves its own space above imagery on mobile. */}\n        <div ref={this.setProfileFlowHost} className=\"mly-profile-flow-dock\" style={{ display: \"none\", flex: \"0 0 auto\", width: \"100%\", minHeight: 0, minWidth: 0, overflow: \"hidden\", boxSizing: \"border-box\", borderBottom: \"1px solid rgba(127,127,127,0.25)\" }} />\n        <div className=\"mly-viewer-workspace\" style={{ flex: \"1 1 0\", minHeight: 0, minWidth: 0, position: \"relative\", isolation: \"isolate\", zIndex: 0, display: \"flex\", flexDirection: \"column\", overflow: \"hidden\" }}>\n        {viewerArea}\n"
        }
      ],
      "absentAfterUninstall": [
        "_profileFlowHost",
        "setProfileFlowHost"
      ],
      "requiredOccurrences": [
        {
          "text": "_profileFlowHost",
          "count": 3
        },
        {
          "text": "setProfileFlowHost",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/elevation/profileIndicator.ts",
      "blocks": [
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 1",
          "before": "import { axisPixel, sampledElevation, sampledPath } from './profileTracking';\nimport type { FrameDistanceIndex, FramePosition, ProfileSample } from './profileTracking';\nexport type { ElevationIndicatorImage } from './profileTracking';\n",
          "after": "import { axisPixel, sampledElevation, sampledPath } from './profileTracking';\nimport { useFlowProfile } from './ProfileFlowDock';\nimport type { FrameDistanceIndex, FramePosition, ProfileSample } from './profileTracking';\nexport type { ElevationIndicatorImage } from './profileTracking';\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 2",
          "before": "}\nconst svgNS = 'http://www.w3.org/2000/svg';\n/** Own the distance axis instead of inferring it from SDK SVG/canvas internals.\n * The SDK still owns profile generation, progress UI, legend and statistics.\n",
          "after": "}\nconst svgNS = 'http://www.w3.org/2000/svg';\nlet mobileProfileId = 0;\nexport interface ProfileMobileLayout {\n  container: HTMLElement | null;\n  getDock(): HTMLElement | null;\n  getExpanded(): boolean;\n  setExpanded(expanded: boolean): void;\n  move(mobile: boolean): void;\n}\nconst mobileProfileCss = `\n.mly-profile-summary, .mly-profile-mobile-altitudes, .mly-profile-mobile-toolbar, .mly-profile-mobile-layers { display: none; }\n/* The flow wrapper belongs to React, so SDK class/style updates cannot reset it. */\n.mly-profile-flow-dock > *,\n.mly-profile-flow-dock .esri-elevation-profile,\n.mly-profile-flow-dock .esri-elevation-profile.esri-component.esri-widget--panel {\n  position: relative !important; inset: auto !important; width: 100% !important; max-width: 100% !important;\n  margin: 0 !important; padding: 0 !important; max-height: none !important; height: auto !important;\n  box-sizing: border-box; overflow: hidden; box-shadow: none;\n}\n.mly-profile-flow-dock .esri-elevation-profile__main-container { height: auto !important; }\n.mly-profile-flow-dock .esri-elevation-profile__header,\n.mly-profile-flow-dock .esri-elevation-profile-legend { display: none !important; }\n.mly-profile-frame-chart.mly-profile-mobile { padding: 0 !important; display: flex; flex-direction: column; min-height: 0; max-height: var(--mly-profile-max-height); overflow: hidden; }\n.mly-profile-mobile .mly-profile-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; flex: 0 0 44px; padding: 0 10px; border: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 600; line-height: 1.3; font-family: inherit; cursor: pointer; text-align: start; }\n.mly-profile-summary span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-profile-mobile .mly-profile-body { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 6px; }\n.mly-profile-mobile.mly-profile-collapsed .mly-profile-body { display: none; }\n.mly-profile-mobile .mly-profile-frame-label, .mly-profile-mobile .mly-profile-desktop-controls { display: none !important; }\n.mly-profile-mobile .mly-profile-mobile-altitudes { display: flex; flex-wrap: wrap; gap: 4px 10px; min-height: 28px; align-items: center; padding: 4px; font-size: 11px; line-height: 1.3; }\n.mly-profile-mobile .mly-profile-loading:empty { display: none; }\n.mly-profile-mobile .mly-profile-loading { display: none; }\n.mly-profile-mobile .mly-profile-summary[aria-busy=\"true\"]::after { content: \"\u2026\"; }\n.mly-profile-plot { position: relative; flex: 0 0 auto; }\n.mly-profile-mobile .mly-profile-inspection { position: absolute; left: 48px; right: 4px; bottom: 22px; min-height: 0 !important; max-height: 40px; overflow: auto; padding: 2px 4px !important; font-size: 10px !important; background: var(--calcite-color-foreground-1, #faf8f8); opacity: .95 !important; pointer-events: none; }\n.mly-profile-mobile .mly-profile-inspection:empty { display: none; }\n.mly-profile-mobile .mly-profile-mobile-toolbar { display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-height: 44px; flex: 0 0 44px; position: sticky; bottom: 0; z-index: 1; background: var(--calcite-color-foreground-1, #faf8f8); }\n.mly-profile-mobile-toolbar button { min-width: 44px; min-height: 44px; padding: 0 8px; color: inherit; background: transparent; border: 1px solid rgba(127,127,127,.45); border-radius: 4px; font: inherit; font-size: 11px; cursor: pointer; }\n.mly-profile-mobile .mly-profile-mobile-layers:not([hidden]) { display: block; flex: 0 0 auto; max-height: max(44px, calc(var(--mly-profile-max-height) - 88px)); overflow-y: auto; overscroll-behavior: contain; }\n.mly-profile-mobile-layers label { display: flex; align-items: center; gap: 8px; min-height: 44px; box-sizing: border-box; padding: 6px 8px; font-size: 11px; line-height: 1.3; cursor: pointer; }\n.mly-profile-mobile-layers input { width: 18px; height: 18px; flex-shrink: 0; margin: 0; }\n`;\n/** Own the distance axis instead of inferring it from SDK SVG/canvas internals.\n * The SDK still owns profile generation, progress UI, legend and statistics.\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 3",
          "before": "  private start = 0;\n  private end: number;\n  private readonly height = 200;\n  private readonly left = 50;\n  private readonly top = 12;\n",
          "after": "  private start = 0;\n  private end: number;\n  private height = 200;\n  private mobile = false;\n  private mobileExpanded = false;\n  private mobileSummary: HTMLSpanElement | null = null;\n  private summaryButton: HTMLButtonElement | null = null;\n  private mobileAltitudes: HTMLDivElement | null = null;\n  private mobileResize: ResizeObserver | null = null;\n  private dockResize: ResizeObserver | null = null;\n  private observedDockParent: HTMLElement | null = null;\n  private readonly layerChecks = new Map<ProfileLine, HTMLInputElement>();\n  private readonly left = 50;\n  private readonly top = 12;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 4",
          "before": "  private root: HTMLElement | null = null;\n  private readonly cameraLines: ProfileLine[];\n  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex) {\n    this.end = index.total;\n    this.cameraLines = ([\n",
          "after": "  private root: HTMLElement | null = null;\n  private readonly cameraLines: ProfileLine[];\n  constructor(private readonly widget: ElevationIndicatorWidget, private readonly index: FrameDistanceIndex, private readonly layout?: ProfileMobileLayout) {\n    this.end = index.total;\n    this.cameraLines = ([\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 5",
          "before": "      // SDK legend/status updates do not change profile geometry. Remount only\n      // if its chart node was replaced; sample changes have their own watch.\n      if (!this.host?.isConnected || !this.native?.isConnected) this.refresh();\n    });\n    this.observer.observe(this.root, { childList: true, subtree: true });\n    this.mount(); this.refresh();\n  }\n",
          "after": "      // SDK legend/status updates do not change profile geometry. Remount only\n      // if its chart node was replaced; sample changes have their own watch.\n      if (!this.host || !this.root?.contains(this.host) || !this.native || !this.root.contains(this.native)) this.refresh();\n    });\n    this.observer.observe(this.root, { childList: true, subtree: true });\n    this.mobileExpanded = this.layout?.getExpanded() ?? false;\n    if (this.layout?.container && win.ResizeObserver) {\n      this.mobileResize = new win.ResizeObserver(this.updateResponsive);\n      this.mobileResize.observe(this.layout.container);\n    }\n    if (win.ResizeObserver) this.dockResize = new win.ResizeObserver(this.updateResponsive);\n    win.addEventListener('resize', this.updateResponsive);\n    this.mount(); this.refresh();\n  }\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 6",
          "before": "    const native = this.root.querySelector<HTMLElement>('.esri-elevation-profile__chart-container');\n    if (!native) return;\n    if (this.host?.isConnected && this.native === native) return;\n    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();\n    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';\n",
          "after": "    const native = this.root.querySelector<HTMLElement>('.esri-elevation-profile__chart-container');\n    if (!native) return;\n    if (this.host && this.root.contains(this.host) && this.native === native) return;\n    this.restoreNative(); this.host?.remove(); this.resize?.disconnect();\n    this.native = native; this.nativeDisplay = native.style.display; native.style.display = 'none';\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 7",
          "before": "    host.className = 'mly-profile-frame-chart';\n    Object.assign(host.style, { padding: '4px 8px 0', boxSizing: 'border-box', width: '100%', minWidth: '0', flex: '0 0 auto' });\n    const label = doc.createElement('div'); this.frameLabel = label;\n    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '30px', lineHeight: '1.35', marginBottom: '4px', overflowWrap: 'anywhere', color: 'inherit' });\n    const loading = doc.createElement('div'); this.loadingLabel = loading;\n    Object.assign(loading.style, { fontSize: '10px', lineHeight: '1.3', minHeight: '14px', opacity: '0.8' });\n    loading.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations\u2026' : '';\n    const controls = doc.createElement('div');\n    Object.assign(controls.style, { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' });\n    for (const [text, title, action] of [\n",
          "after": "    host.className = 'mly-profile-frame-chart';\n    Object.assign(host.style, { padding: '4px 8px 0', boxSizing: 'border-box', width: '100%', minWidth: '0', flex: '0 0 auto' });\n    const style = doc.createElement('style'); style.textContent = mobileProfileCss;\n    const summary = doc.createElement('button'); this.summaryButton = summary;\n    summary.type = 'button'; summary.className = 'mly-profile-summary';\n    summary.style.fontSize = '11px'; summary.style.fontWeight = '600';\n    summary.setAttribute('aria-label', 'Expand or collapse elevation profile');\n    const summaryText = doc.createElement('span'); this.mobileSummary = summaryText;\n    const chevron = doc.createElement('span'); chevron.textContent = '\u2303'; chevron.setAttribute('aria-hidden', 'true');\n    summary.append(summaryText, chevron);\n    summary.addEventListener('click', () => {\n      this.mobileExpanded = !this.mobileExpanded; this.layout?.setExpanded(this.mobileExpanded);\n      this.updateResponsive(); this.refresh();\n    });\n    const body = doc.createElement('div'); body.className = 'mly-profile-body'; body.id = `mly-profile-body-${++mobileProfileId}`;\n    summary.setAttribute('aria-controls', body.id);\n    const altitudes = doc.createElement('div'); altitudes.className = 'mly-profile-mobile-altitudes'; this.mobileAltitudes = altitudes;\n    host.append(style, summary, body);\n    const label = doc.createElement('div'); this.frameLabel = label;\n    label.className = 'mly-profile-frame-label';\n    Object.assign(label.style, { fontSize: '11px', fontWeight: '600', minHeight: '30px', lineHeight: '1.35', marginBottom: '4px', overflowWrap: 'anywhere', color: 'inherit' });\n    const loading = doc.createElement('div'); this.loadingLabel = loading; loading.className = 'mly-profile-loading';\n    Object.assign(loading.style, { fontSize: '10px', lineHeight: '1.3', minHeight: '14px', opacity: '0.8' });\n    loading.textContent = this.widget.viewModel.progress < 1 ? 'Sampling elevations\u2026' : '';\n    const controls = doc.createElement('div'); controls.className = 'mly-profile-desktop-controls';\n    Object.assign(controls.style, { display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' });\n    for (const [text, title, action] of [\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 8",
          "before": "    Object.assign(svg.style, { display: 'block', width: '100%', height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px`, overflow: 'hidden' });\n    svg.addEventListener('pointermove', this.inspect);\n    svg.addEventListener('pointerleave', this.clearInspection);\n    const inspect = doc.createElement('div'); this.inspectLabel = inspect;\n    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    host.append(label, loading, controls, svg, inspect);\n    const cameraLegend = doc.createElement('div');\n    cameraLegend.className = 'esri-elevation-profile-legend';\n",
          "after": "    Object.assign(svg.style, { display: 'block', width: '100%', height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px`, overflow: 'hidden' });\n    svg.addEventListener('pointermove', this.inspect);\n    svg.addEventListener('pointerdown', event => { if (this.mobile) { event.stopPropagation(); this.inspect(event); } });\n    svg.addEventListener('click', event => { if (this.mobile) event.stopPropagation(); });\n    svg.style.touchAction = 'pan-y';\n    svg.addEventListener('pointerleave', () => { if (!this.mobile) this.clearInspection(); });\n    const inspect = doc.createElement('div'); this.inspectLabel = inspect; inspect.className = 'mly-profile-inspection';\n    Object.assign(inspect.style, { fontSize: '10px', lineHeight: '1.35', minHeight: '26px', paddingTop: '4px', overflowWrap: 'anywhere', opacity: '0.85' });\n    inspect.textContent = 'Move over the chart to inspect sampled elevations.';\n    const plot = doc.createElement('div'); plot.className = 'mly-profile-plot'; plot.append(svg, inspect);\n    body.append(label, loading, controls, plot);\n    const cameraLegend = doc.createElement('div');\n    cameraLegend.className = 'esri-elevation-profile-legend';\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 9",
          "before": "      Object.assign(unavailable.style, { fontSize: '10px', lineHeight: '1.35', padding: '4px 0' }); cameraLegend.appendChild(unavailable);\n    }\n    host.appendChild(cameraLegend); native.before(host);\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n",
          "after": "      Object.assign(unavailable.style, { fontSize: '10px', lineHeight: '1.35', padding: '4px 0' }); cameraLegend.appendChild(unavailable);\n    }\n    body.appendChild(cameraLegend);\n    const layers = doc.createElement('div'); layers.className = 'mly-profile-mobile-layers'; layers.hidden = true; layers.id = `${body.id}-layers`; layers.setAttribute('role', 'region'); layers.setAttribute('aria-label', 'Profile layers');\n    layers.appendChild(altitudes);\n    this.layerChecks.clear();\n    for (const line of [...this.widget.profiles.toArray(), ...this.cameraLines]) {\n      const row = doc.createElement('label'); row.style.borderLeft = `3px solid ${line.color.toCss()}`;\n      const check = doc.createElement('input'); check.type = 'checkbox'; check.checked = line.visible;\n      check.setAttribute('aria-label', line.title || 'Elevation layer');\n      check.addEventListener('change', () => { line.visible = check.checked; this.refresh(); });\n      const name = doc.createElement('span'); name.textContent = line.title || 'Elevation layer';\n      row.append(check, name); layers.appendChild(row); this.layerChecks.set(line, check);\n    }\n    const toolbar = doc.createElement('div'); toolbar.className = 'mly-profile-mobile-toolbar';\n    for (const [text, title, action] of [\n      ['\u2212', 'Zoom out along the sequence', () => this.zoom(2)],\n      ['+', 'Zoom in along the sequence', () => this.zoom(0.5)],\n      ['Reset', 'Reset the chart distance axis', () => { this.start = 0; this.end = this.index.total; this.render(); }],\n    ] as const) {\n      const button = doc.createElement('button'); button.type = 'button'; button.textContent = text; button.setAttribute('aria-label', title);\n      button.addEventListener('click', action); toolbar.appendChild(button);\n    }\n    const layerButton = doc.createElement('button'); layerButton.type = 'button'; layerButton.textContent = 'Layers';\n    layerButton.setAttribute('aria-expanded', 'false'); layerButton.setAttribute('aria-controls', layers.id);\n    layerButton.addEventListener('click', () => {\n      layers.hidden = !layers.hidden; layerButton.setAttribute('aria-expanded', String(!layers.hidden));\n      // Scroll only the sheet body so opening Layers immediately reveals its\n      // checkboxes without moving the map, viewer or document.\n      body.scrollTop = layers.hidden ? 0 : body.scrollHeight;\n    });\n    toolbar.appendChild(layerButton); body.append(layers, toolbar); native.before(host);\n    this.updateResponsive();\n    const win = doc.defaultView;\n    if (win?.ResizeObserver) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 10",
          "before": "  private lines(): ProfileLine[] { return [...this.widget.profiles.toArray(), ...this.cameraLines].filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || this.disposed) return;\n    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.\n    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;\n",
          "after": "  private lines(): ProfileLine[] { return [...this.widget.profiles.toArray(), ...this.cameraLines].filter(line => line.visible); }\n  private render(): void {\n    if (!this.svg || !this.host || !this.root?.isConnected || this.disposed) return;\n    for (const [line, check] of this.layerChecks) check.checked = line.visible;\n    this.summaryButton?.setAttribute('aria-busy', String(this.widget.viewModel.progress < 1));\n    if (this.mobile && !this.mobileExpanded) return;\n    // SVG viewBox coordinates use local CSS pixels, not transformed screen pixels.\n    const measured = this.svg.clientWidth || this.svg.getBoundingClientRect().width;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 11",
          "before": "    for (let i = 0; i <= 4; i++) {\n      const y = this.top + i / 4 * plotHeight;\n      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });\n      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');\n      const tickStride = plotWidth < 180 ? 4 : plotWidth < 360 ? 2 : 1;\n      if (i % tickStride === 0) {\n",
          "after": "    for (let i = 0; i <= 4; i++) {\n      const y = this.top + i / 4 * plotHeight;\n      if (!this.mobile || i % 2 === 0) {\n      element('line', { x1: this.left, x2: this.width - this.right, y1: y, y2: y, stroke: '#aaa', 'stroke-opacity': 0.2 });\n      element('text', { x: this.left - 6, y: y + 3, 'text-anchor': 'end', 'font-size': 10, fill: 'currentColor' }, available ? `${Math.round(max - i / 4 * (max - min))} m` : '');\n      }\n      const tickStride = plotWidth < 180 ? 4 : plotWidth < 360 ? 2 : 1;\n      if (i % tickStride === 0) {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 12",
          "before": "  private updateFrame(): void {\n    const frame = this.frame;\n    if (this.frameLabel) {\n      this.frameLabel.textContent = frame\n",
          "after": "  private updateFrame(): void {\n    const frame = this.frame;\n    if (this.mobileSummary) this.mobileSummary.textContent = frame\n      ? `Profile \u00b7 Frame ${frame.ordinal.toLocaleString()}/${this.index.images.length.toLocaleString()} \u00b7 ${frame.distance >= 1000 ? (frame.distance / 1000).toFixed(2) + ' km' : Math.round(frame.distance) + ' m'}`\n      : 'Profile \u00b7 Waiting for current image';\n    if (this.mobileAltitudes && this.mobile && this.mobileExpanded) {\n      const chips: HTMLSpanElement[] = [];\n      if (frame) for (const [name, value, color, fullName] of [\n        ['Computed', frame.computedAltitude, '#9a5800', 'Computed camera altitude'],\n        ['Reported', frame.reportedAltitude, '#8b46b2', 'Reported camera altitude'],\n      ] as const) {\n        if (value === undefined) continue;\n        const chip = this.mobileAltitudes.ownerDocument.createElement('span'); chip.style.color = color;\n        chip.textContent = `${name}: ${value.toFixed(1)} m`; chip.title = fullName; chips.push(chip);\n      }\n      this.mobileAltitudes.replaceChildren(...chips);\n      if (!chips.length) this.mobileAltitudes.textContent = 'Camera altitude unavailable';\n    }\n    if (this.frameLabel) {\n      this.frameLabel.textContent = frame\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 13",
          "before": "  private clearInspection = (): void => {\n    this.inspectionLine?.setAttribute('visibility', 'hidden');\n    if (this.inspectLabel) this.inspectLabel.textContent = 'Move over the chart to inspect sampled elevations.';\n  };\n  private zoom(factor: number): void {\n",
          "after": "  private clearInspection = (): void => {\n    this.inspectionLine?.setAttribute('visibility', 'hidden');\n    if (this.inspectLabel) this.inspectLabel.textContent = this.mobile ? '' : 'Move over the chart to inspect sampled elevations.';\n  };\n  private zoom(factor: number): void {\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 14",
          "before": "    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();\n  }\n  private restoreNative(): void {\n    if (this.native) this.native.style.display = this.nativeDisplay;\n",
          "after": "    const span = this.end - this.start; this.start = Math.max(0, Math.min(this.index.total - span, this.start + span * factor)); this.end = this.start + span; this.render();\n  }\n  /** React calls this when the normal-mode flow host mounts or disappears. */\n  refreshLayout(): void { this.updateResponsive(); this.refresh(); }\n  private updateResponsive = (): void => {\n    if (!this.root || !this.host || this.disposed) return;\n    const win = this.root.ownerDocument.defaultView; if (!win) return;\n    const map = this.layout?.container;\n    const dockParent = this.layout?.getDock()?.parentElement || null;\n    if (dockParent !== this.observedDockParent) {\n      this.dockResize?.disconnect(); this.observedDockParent = dockParent;\n      if (dockParent) this.dockResize?.observe(dockParent);\n    }\n    const mobile = useFlowProfile(map || null, this.layout?.getDock() || null, win);\n    this.mobile = mobile; this.layout?.move(mobile);\n    // Only mutate our own chart wrapper, never the SDK-managed class attribute.\n    this.host.classList.toggle('mly-profile-mobile', mobile);\n    this.host.classList.toggle('mly-profile-collapsed', mobile && !this.mobileExpanded);\n    this.summaryButton?.setAttribute('aria-expanded', String(this.mobileExpanded));\n    if (this.summaryButton?.lastElementChild) this.summaryButton.lastElementChild.textContent = this.mobileExpanded ? '\u2304' : '\u2303';\n    // Reserve at least 112px of the widget for imagery and its existing footer.\n    // Short panes scroll within the profile; the map never loses space or moves.\n    const widgetHeight = dockParent?.clientHeight || win.innerHeight;\n    const panelMaxHeight = Math.max(44, Math.min(200, widgetHeight - 112));\n    const oldHeight = this.height;\n    this.height = mobile ? Math.max(80, Math.min(112, panelMaxHeight - 88)) : 200;\n    if (mobile) this.host.style.setProperty('--mly-profile-max-height', `${panelMaxHeight}px`);\n    else this.host.style.removeProperty('--mly-profile-max-height');\n    if (this.svg) {\n      this.svg.setAttribute('height', String(this.height));\n      Object.assign(this.svg.style, { height: `${this.height}px`, minHeight: `${this.height}px`, flex: `0 0 ${this.height}px` });\n    }\n    this.updateFrame(); this.clearInspection();\n    if (oldHeight !== this.height || this.svg && this.svg.clientWidth !== this.width) this.refresh();\n  };\n  private restoreNative(): void {\n    if (this.native) this.native.style.display = this.nativeDisplay;\n"
        },
        {
          "label": "src/features/elevation/profileIndicator.ts mobile flow section block 15",
          "before": "  }\n  dispose(): void {\n    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect();\n    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);\n    if (this.refreshTimer !== null) this.root?.ownerDocument.defaultView?.clearTimeout(this.refreshTimer);\n",
          "after": "  }\n  dispose(): void {\n    this.disposed = true; this.observer?.disconnect(); this.resize?.disconnect(); this.mobileResize?.disconnect(); this.dockResize?.disconnect();\n    this.root?.ownerDocument.defaultView?.removeEventListener('resize', this.updateResponsive);\n    this.layerChecks.clear();\n    if (this.raf !== null) this.root?.ownerDocument.defaultView?.cancelAnimationFrame(this.raf);\n    if (this.refreshTimer !== null) this.root?.ownerDocument.defaultView?.clearTimeout(this.refreshTimer);\n"
        }
      ],
      "absentAfterUninstall": [
        "ProfileFlowDock",
        "useFlowProfile"
      ],
      "requiredOccurrences": [
        {
          "text": "ProfileFlowDock",
          "count": 1
        },
        {
          "text": "useFlowProfile",
          "count": 2
        }
      ]
    },
    {
      "file": "src/features/elevation/ElevationProfileController.ts",
      "blocks": [
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 1",
          "before": "import { ProfileFrameChart } from './profileIndicator';\nimport type { ElevationIndicatorWidget } from './profileIndicator';\nimport { frameDistanceIndex, sameProfileInput } from './profileTracking';\n",
          "after": "import { ProfileFrameChart } from './profileIndicator';\nimport { ProfileFlowDock, useFlowProfile } from './ProfileFlowDock';\nimport type { ElevationIndicatorWidget } from './profileIndicator';\nimport { frameDistanceIndex, sameProfileInput } from './profileTracking';\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 2",
          "before": "export interface ElevationProfileView {\n  type: string;\n  destroyed?: boolean;\n  map?: { ground?: { layers?: { length: number } } } | null;\n  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };\n}\ninterface ProfileWidget extends ElevationIndicatorWidget {\n",
          "after": "export interface ElevationProfileView {\n  type: string;\n  container?: HTMLElement | string | null;\n  destroyed?: boolean;\n  map?: { ground?: { layers?: { length: number } } } | null;\n  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown; move?(widget: any, position: string): unknown };\n}\ninterface ProfileWidget extends ElevationIndicatorWidget {\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 3",
          "before": "  input: any;\n  destroy(): void;\n}\ntype SDKConstructor = new (properties: any) => any;\n",
          "after": "  input: any;\n  destroy(): void;\n  when?(): Promise<unknown>;\n}\ntype SDKConstructor = new (properties: any) => any;\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 4",
          "before": "  private chartWatch: { remove(): void } | null = null;\n  private confirmedImageId: string | null = null;\n  constructor(private readonly loadModules: (ids: string[]) => Promise<any[]>, private readonly getGraphic: () => SDKConstructor) {}\n\n  track(imageId: string | null): void {\n",
          "after": "  private chartWatch: { remove(): void } | null = null;\n  private confirmedImageId: string | null = null;\n  private mobileExpanded = false;\n  private dock: ProfileFlowDock | null = null;\n  constructor(private readonly loadModules: (ids: string[]) => Promise<any[]>, private readonly getGraphic: () => SDKConstructor,\n    private readonly getFlowHost: () => HTMLElement | null = () => null) {}\n\n  refreshLayout(): void { this.chart?.refreshLayout(); }\n\n  track(imageId: string | null): void {\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 5",
          "before": "        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];\n      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      this.widget = new ElevationProfile({ view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n        visibleElements: { chart: false, selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });\n      this.widget!.viewModel.hoveredChartPosition = null;\n      this.images = snapshot; this.pendingImages = null;\n      view.ui.add(this.widget, 'bottom-leading');\n      this.chart = new ProfileFrameChart(this.widget!, index);\n      this.chart.setFrame(this.confirmedImageId);\n      this.chartWatch = reactiveUtils.watch(() => [this.widget?.viewModel.progress,\n",
          "after": "        : { type: 'ground', title: 'Terrain Surface', color: '#2ecc71', viewVisualizationEnabled: false }];\n      if (view.type === '3d') profiles.push({ type: 'view', title: '3D Infrastructure', color: '#3498db', viewVisualizationEnabled: false });\n      const doc = this.getFlowHost()?.ownerDocument || (typeof document !== 'undefined' ? document : null);\n      const renderContainer = doc?.createElement('div');\n      this.widget = new ElevationProfile({ container: renderContainer, view, profiles, input: inputGraphic, unit: 'meters', unitOptions: ['meters'],\n        visibleElements: { chart: false, selectButton: false, sketchButton: false, settingsButton: false, clearButton: false, uniformChartScalingToggle: false } });\n      this.widget!.viewModel.hoveredChartPosition = null;\n      this.images = snapshot; this.pendingImages = null;\n      const widget = this.widget!;\n      const container = typeof view.container === 'string' ? document.getElementById(view.container) : view.container || null;\n      this.dock = new ProfileFlowDock(view, widget, this.getFlowHost);\n      const node = widget.container;\n      const win = node && typeof node !== 'string' ? node.ownerDocument.defaultView : null;\n      this.dock.place(win ? useFlowProfile(container, this.getFlowHost(), win) : false);\n      await widget.when?.();\n      if (!current()) return;\n      this.chart = new ProfileFrameChart(widget, index, {\n        container,\n        getDock: this.getFlowHost,\n        getExpanded: () => this.mobileExpanded,\n        setExpanded: expanded => { this.mobileExpanded = expanded; },\n        move: mobile => {\n          if (view.destroyed || this.widget !== widget) return;\n          try { this.dock?.place(mobile); }\n          catch (error) { if (!view.destroyed) console.warn('[Mapillary profile] Could not reposition profile:', error); }\n        },\n      });\n      this.chart.setFrame(this.confirmedImageId);\n      this.chartWatch = reactiveUtils.watch(() => [this.widget?.viewModel.progress,\n"
        },
        {
          "label": "src/features/elevation/ElevationProfileController.ts mobile flow section block 6",
          "before": "    this.chartWatch?.remove(); this.chartWatch = null;\n    this.chart?.dispose(); this.chart = null;\n    const widget = this.widget, view = this.view;\n    this.widget = null; this.view = null; this.images = null; this.pendingImages = null; this.confirmedImageId = null;\n    try {\n      if (widget) {\n        try { view?.ui.remove(widget); } finally { widget.destroy(); }\n      }\n    } catch (error) { if (!transferring) throw error; }\n",
          "after": "    this.chartWatch?.remove(); this.chartWatch = null;\n    this.chart?.dispose(); this.chart = null;\n    const widget = this.widget, view = this.view, dock = this.dock; this.dock = null;\n    this.widget = null; this.view = null; this.images = null; this.pendingImages = null; this.confirmedImageId = null;\n    try {\n      if (widget) {\n        try { if (dock) dock.dispose(); else view?.ui.remove(widget); } finally { widget.destroy(); }\n      }\n    } catch (error) { if (!transferring) throw error; }\n"
        }
      ],
      "absentAfterUninstall": [
        "ProfileFlowDock",
        "useFlowProfile",
        "getFlowHost"
      ],
      "requiredOccurrences": [
        {
          "text": "ProfileFlowDock",
          "count": 4
        },
        {
          "text": "useFlowProfile",
          "count": 2
        },
        {
          "text": "getFlowHost",
          "count": 5
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/elevation/ProfileFlowDock.ts",
      "content": "/** Move the optional mobile profile into widget-owned flow, never onto the map. */\nexport interface DockedProfileWidget { container?: HTMLElement | string | null; }\nexport interface ProfileDockView {\n  destroyed?: boolean;\n  ui: { add(widget: any, position: string): unknown; remove(widget: any): unknown };\n}\nexport class ProfileFlowDock {\n  private registered: boolean;\n  private host: HTMLElement | null = null;\n  private parking: HTMLElement | null = null;\n  private disposed = false;\n  constructor(private readonly view: ProfileDockView, private readonly widget: DockedProfileWidget,\n    private readonly getHost: () => HTMLElement | null, registered = false) { this.registered = registered; }\n\n  place(mobile: boolean): void {\n    if (this.disposed || this.view.destroyed) return;\n    const node = this.widget.container;\n    if (mobile) {\n      if (!node || typeof node === 'string') return;\n      const host = this.getHost();\n      if (this.registered) { this.view.ui.remove(this.widget); this.registered = false; }\n      if (this.host && this.host !== host) this.host.style.display = 'none';\n      this.host = host;\n      if (host) {\n        host.style.display = 'block';\n        if (node.parentElement !== host) host.appendChild(node);\n      } else {\n        // Normal layout may disappear during fullscreen or a React remount.\n        // Keep the live widget detached until its own flow host is available.\n        this.parking ??= node.ownerDocument.createElement('div');\n        if (node.parentElement !== this.parking) this.parking.appendChild(node);\n      }\n    } else {\n      if (!this.registered) { this.view.ui.add(this.widget, 'bottom-leading'); this.registered = true; }\n      if (this.host) this.host.style.display = 'none';\n      this.host = null;\n    }\n  }\n\n  dispose(): void {\n    if (this.disposed) return;\n    this.disposed = true;\n    if (this.host) this.host.style.display = 'none';\n    if (this.registered && !this.view.destroyed) this.view.ui.remove(this.widget);\n    const node = this.widget.container;\n    if (!this.registered && node && typeof node !== 'string') node.remove();\n    this.host = null; this.parking = null;\n  }\n}\n\n/** Use map/viewport width, including touch landscape; narrow desktop sidebars stay desktop. */\nexport function useFlowProfile(map: HTMLElement | null, _dock: HTMLElement | null, win: Window): boolean {\n  const width = Math.min(map?.clientWidth || win.innerWidth, win.innerWidth);\n  return width <= 768 || width <= 900 && win.matchMedia('(pointer: coarse)').matches;\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'mobile-profile-flow-section-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-mobile-profile-flow-section.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
    console.log(uninstall ? 'Mobile profile flow section is already uninstalled. No files changed.' : 'Mobile profile flow section is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'mobile-profile-flow-section', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Mobile profile flow section ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder before testing. On phones, the profile occupies its own section above imagery. The map stays unobstructed; collapse the row to return space to the image. Desktop retains bottom-leading placement.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
