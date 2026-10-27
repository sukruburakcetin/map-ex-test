#!/usr/bin/env node
'use strict';
/**
 * Native map-feature interaction and filter UI v6.3. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/utils/constants.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/utils/constants.ts block 1",
              "before": "\n// Zoom level thresholds\nexport const ZOOM = {\n  /** Minimum zoom to show traffic sign / object VT coverage icons */\n  FEATURES_COVERAGE: 13,\n\n  /** Minimum zoom to load and show clickable FeatureLayer popups */\n  FEATURES_INTERACTIVE: 16,\n\n  /** Minimum zoom for Turbo Mode coverage points */\n  TURBO_MIN: 0,\n\n",
              "after": "\n// Zoom level thresholds\nexport const ZOOM = {\n  /** Minimum zoom to show traffic sign / object VT coverage icons */\n  FEATURES_COVERAGE: 14,\n\n  /** Native traffic-sign/object tiles expose individual features at source zoom 14. */\n  FEATURES_INTERACTIVE: 14,\n\n  /** Minimum zoom for Turbo Mode coverage points */\n  TURBO_MIN: 0,\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/FilterBar.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/FilterBar.tsx block 1",
              "before": "    * Each group is only rendered when its corresponding `show*FilterBox` flag is true.\n*/\nconst SpriteSize: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (\n    <label className=\"mly-filter-size\" title={`${label} icon size`} style={{ display: \"flex\", alignItems: \"center\", gap: 3, fontSize: 9, color: \"#e4eee8\", flexShrink: 0 }}>\n      Size<select aria-label={`${label} icon size`} value={value} onChange={event => onChange(Number(event.target.value))} style={{ height: 22, fontSize: 10, padding: \"0 2px\", borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n        {[0.75, 1, 1.25, 1.5, 2].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}\n      </select>\n    </label>\n);\n",
              "after": "    * Each group is only rendered when its corresponding `show*FilterBox` flag is true.\n*/\nconst SpriteSize: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (\n    <label className=\"mly-filter-size\" title={`${label} icon size`} style={{ display: \"flex\", alignItems: \"center\", gap: 3, fontSize: 9, color: \"#e4eee8\", flexShrink: 0 }}>\n      Size<select aria-label={`${label} icon size`} value={value} onChange={event => onChange(Number(event.target.value))} style={{ height: 22, minWidth: 64, flexShrink: 0, fontSize: 10, padding: \"0 4px\", borderRadius: 4, border: \"1px solid #ffffff35\", background: \"#214d36\", color: \"white\" }}>\n        {[0.75, 1, 1.25, 1.5, 2].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}\n      </select>\n    </label>\n);\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/components/FilterScrollRegion.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/FilterScrollRegion.tsx block 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; margin-top:1px; border:1px solid #416756; border-radius:8px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:32px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:30px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from 'jimu-core';\n\nconst filterPanelCss = `\n.mly-filter-panel { display:flex; align-items:center; gap:3px; width:100%; max-width:100%; min-width:0; height:38px; flex:0 0 38px; box-sizing:border-box; padding:2px 3px; background:linear-gradient(135deg,#142d26,#10231e); color:#e1f2e8; pointer-events:auto; z-index:10001; }\n.mly-filter-scroll-wrap { position:relative; flex:1 1 0; min-width:0; height:32px; }\n.mly-filter-panel .mly-filter-scroll { width:100%; min-width:0; height:30px; overflow-x:auto; overflow-y:hidden; scrollbar-width:none !important; -ms-overflow-style:none; overscroll-behavior-x:contain; touch-action:pan-x pan-y; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar { display:none !important; width:0 !important; height:0 !important; }\n.mly-filter-panel .mly-filter-scroll::-webkit-scrollbar-button { display:none !important; width:0 !important; height:0 !important; }\n"
            },
            {
              "label": "src/components/FilterScrollRegion.tsx block 2",
              "before": ".mly-filter-group input[type=\"text\"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }\n.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }\n.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }\n.mly-filter-size { height:24px; white-space:nowrap; }\n.mly-filter-size select { width:52px; min-width:52px; }\n.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }\n.mly-filter-group--features [role=\"combobox\"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }\n.mly-filter-group button { box-sizing:border-box; }\n.mly-filter-dates { display:flex; align-items:center; gap:3px; }\n",
              "after": ".mly-filter-group input[type=\"text\"] { height:24px !important; min-height:24px !important; padding-top:0 !important; padding-bottom:0 !important; box-sizing:border-box; border-radius:5px !important; border-color:#456b58 !important; background:#122c22 !important; }\n.mly-filter-group select { display:block; height:24px !important; min-height:24px !important; max-height:24px !important; box-sizing:border-box; margin:0; border:1px solid #507d64 !important; border-radius:5px; padding:0 4px !important; font-size:10px !important; line-height:normal; background:#173d2b !important; color:#edf7f0; color-scheme:dark; }\n.mly-filter-group .mly-filter-travel select { width:88px; min-width:0; }\n.mly-filter-size { height:24px; white-space:nowrap; }\n.mly-filter-size select { width:64px; min-width:64px; flex:0 0 64px; }\n.mly-filter-group--features > div:first-child { flex:0 0 180px !important; width:180px !important; min-width:0; }\n.mly-filter-group--features [role=\"combobox\"] { height:24px; min-height:24px; max-height:24px; padding:0 6px; border-color:#507d64; border-radius:5px; background:#173d2b; }\n.mly-filter-group button { box-sizing:border-box; }\n.mly-filter-dates { display:flex; align-items:center; gap:3px; }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/imagery/hoverCard.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/imagery/hoverCard.ts block 1",
              "before": "  svg.appendChild(path); svg.style.flexShrink = '0'; return svg;\n}\n/** Build a non-interactive preview with textContent, stable dimensions and no HTML interpolation. */\nexport function renderImageryHoverCard(host: HTMLElement, data: any, fallbackDate?: unknown, loading = false): void {\n  Object.assign(host.style, styles.shell); if (!host.style.width) host.style.width = '240px'; host.style.display = 'block'; host.setAttribute('role', 'tooltip');\n  host.textContent = ''; const doc = host.ownerDocument;\n  const portal = doc.fullscreenElement || doc.body;\n  if (portal && host.parentNode !== portal) portal.appendChild(host);\n  const user = doc.createElement('div'); Object.assign(user.style, styles.creator);\n",
              "after": "  svg.appendChild(path); svg.style.flexShrink = '0'; return svg;\n}\n/** Build a non-interactive preview with textContent, stable dimensions and no HTML interpolation. */\nexport function renderImageryHoverCard(host: HTMLElement, data: any, fallbackDate?: unknown, loading = false): void {\n  Object.assign(host.style, styles.shell); if (!host.style.width || host.style.width === 'max-content') host.style.width = '240px'; host.style.display = 'block'; host.setAttribute('role', 'tooltip');\n  host.textContent = ''; const doc = host.ownerDocument;\n  const portal = doc.fullscreenElement || doc.body;\n  if (portal && host.parentNode !== portal) portal.appendChild(host);\n  const user = doc.createElement('div'); Object.assign(user.style, styles.creator);\n"
            },
            {
              "label": "src/features/imagery/hoverCard.ts block 2",
              "before": "  const right = Math.max(left, Math.min(viewport.innerWidth - 8, bounds.right)), bottom = Math.max(top, Math.min(viewport.innerHeight - 8, bounds.bottom));\n  const width = Math.min(240, Math.max(0, right - left)), height = Math.min(200, Math.max(0, bottom - top));\n  Object.assign(host.style, { width: `${width}px`, maxHeight: `${bottom - top}px`, left: `${Math.max(left, Math.min(x + 16 + width <= right ? x + 16 : x - width - 16, right - width))}px`, top: `${Math.max(top, Math.min(y + 16, bottom - height))}px` });\n}\n",
              "after": "  const right = Math.max(left, Math.min(viewport.innerWidth - 8, bounds.right)), bottom = Math.max(top, Math.min(viewport.innerHeight - 8, bounds.bottom));\n  const width = Math.min(240, Math.max(0, right - left)), height = Math.min(200, Math.max(0, bottom - top));\n  Object.assign(host.style, { width: `${width}px`, maxHeight: `${bottom - top}px`, left: `${Math.max(left, Math.min(x + 16 + width <= right ? x + 16 : x - width - 16, right - width))}px`, top: `${Math.max(top, Math.min(y + 16, bottom - height))}px` });\n}\n\nconst featureLabelSizes = new WeakMap<HTMLElement, { text: string; maxWidth: number; maxHeight: number; width: number; height: number }>();\n\n/** The shared tooltip also hosts image previews. Reset preview dimensions for a\n * text-only feature label; measure once per label/available width, then reuse it.\n */\nexport function renderMapFeatureHoverLabel(host: HTMLElement, text: string,\n  bounds: { left: number; right: number; top: number; bottom: number }, x: number, y: number): void {\n  const doc = host.ownerDocument, viewport = doc.defaultView || { innerWidth: bounds.right, innerHeight: bounds.bottom };\n  const left = Math.max(8, bounds.left), top = Math.max(8, bounds.top);\n  const right = Math.max(left, Math.min(viewport.innerWidth - 8, bounds.right));\n  const bottom = Math.max(top, Math.min(viewport.innerHeight - 8, bounds.bottom));\n  const maxWidth = right - left, maxHeight = bottom - top, previous = featureLabelSizes.get(host);\n  const reuse = previous?.text === text && previous.maxWidth === maxWidth && previous.maxHeight === maxHeight && host.style.width === 'max-content';\n  const portal = doc.fullscreenElement || doc.body;\n  if (portal && host.parentNode !== portal) portal.appendChild(host);\n  if (!reuse) Object.assign(host.style, styles.shell, { width: 'max-content', maxWidth: `${maxWidth}px`,\n    maxHeight: `${bottom - top}px`, height: 'auto', whiteSpace: 'normal', overflowWrap: 'anywhere' });\n  host.textContent = text;\n  host.style.display = 'block'; host.setAttribute('role', 'tooltip');\n  const measured = reuse ? previous : host.getBoundingClientRect();\n  const width = Math.min(measured.width, maxWidth), height = Math.min(measured.height, bottom - top);\n  featureLabelSizes.set(host, { text, maxWidth, maxHeight, width, height });\n  Object.assign(host.style, {\n    left: `${Math.max(left, Math.min(x + 15 + width <= right ? x + 15 : x - width - 15, right - width))}px`,\n    top: `${Math.max(top, Math.min(y + 15, bottom - height))}px`,\n  });\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/runtime/widget.tsx block 1",
              "before": "import type { TurboBbox, TurboFilters, TurboPoint } from \"../utils/turboCoverageUtils\";\nimport { findNearbySequenceFrame } from \"../features/coverage/nearbySequenceFrame\";\nimport { CoverageFrameLookup, coverageFrameKey } from \"../features/coverage/CoverageFrameLookup\";\nimport { RepresentativePickCache } from \"../features/coverage/RepresentativePickCache\";\nimport { renderImageryHoverCard, positionImageryHoverCard } from \"../features/imagery/hoverCard\";\nimport { fetchGraphJson } from '../services/mapillary/graphJson';\nimport { queryEnterpriseNotesPage } from '../features/field-notes/enterpriseList';\nimport { matchesEnterpriseLayerUrl, resolveEnterpriseNotesEndpoint } from '../features/field-notes/enterpriseEndpoint';\nimport { buildEnterpriseNoteAttributes } from '../features/field-notes/enterpriseAttributes';\n",
              "after": "import type { TurboBbox, TurboFilters, TurboPoint } from \"../utils/turboCoverageUtils\";\nimport { findNearbySequenceFrame } from \"../features/coverage/nearbySequenceFrame\";\nimport { CoverageFrameLookup, coverageFrameKey } from \"../features/coverage/CoverageFrameLookup\";\nimport { RepresentativePickCache } from \"../features/coverage/RepresentativePickCache\";\nimport { renderImageryHoverCard, positionImageryHoverCard, renderMapFeatureHoverLabel } from \"../features/imagery/hoverCard\";\nimport { fetchGraphJson } from '../services/mapillary/graphJson';\nimport { queryEnterpriseNotesPage } from '../features/field-notes/enterpriseList';\nimport { matchesEnterpriseLayerUrl, resolveEnterpriseNotesEndpoint } from '../features/field-notes/enterpriseEndpoint';\nimport { buildEnterpriseNoteAttributes } from '../features/field-notes/enterpriseAttributes';\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {\n    const stationary = () => view.stationary !== false;\n    if (view.zoom < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;\n    const radius = 12;\n    const ground = view.toMap(screen) as __esri.Point;\n    if (!ground) return null;\n    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));\n",
              "after": "\n  /** Inspect only pointer-local source tiles; keep bytes, not decoded feature collections. */\n  private async pickMapFeature(screen: { x: number; y: number }, view: __esri.MapView | __esri.SceneView, signal: AbortSignal): Promise<any | null> {\n    const stationary = () => view.stationary !== false;\n    // SceneView can report 13.99999 for a settled zoom-14 target.\n    if (view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE || !stationary() || signal.aborted) return null;\n    const radius = 12;\n    const ground = view.toMap(screen) as __esri.Point;\n    if (!ground) return null;\n    const corners = [[-radius,-radius],[radius,-radius],[radius,radius],[-radius,radius]].map(([x,y]) => view.toMap({x:screen.x+x,y:screen.y+y}) as __esri.Point).filter(p => p && Number.isFinite(p.longitude) && Number.isFinite(p.latitude));\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "\n      }\n      if (!active() || code !== this._mapFeatureFilterCodes.get(kind)) return null;\n    }\n    if (signal.aborted || this.state.jimuMapView?.view !== view || !nearest || !stationary() || view.zoom < ZOOM.FEATURES_INTERACTIVE) return null;\n    if (!(nearest.kind === \"signs\" ? this.state.trafficSignsActive : this.state.objectsActive) || nearest.code !== this._mapFeatureFilterCodes.get(nearest.kind)) return null;\n    return {layer:nearest.layer,graphic:new this.ArcGISModules.Graphic({geometry:nearest.geometry,attributes:nearest.attributes})};\n  }\n\n",
              "after": "\n      }\n      if (!active() || code !== this._mapFeatureFilterCodes.get(kind)) return null;\n    }\n    if (signal.aborted || this.state.jimuMapView?.view !== view || !nearest || !stationary() || view.zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) return null;\n    if (!(nearest.kind === \"signs\" ? this.state.trafficSignsActive : this.state.objectsActive) || nearest.code !== this._mapFeatureFilterCodes.get(nearest.kind)) return null;\n    return {layer:nearest.layer,graphic:new this.ArcGISModules.Graphic({geometry:nearest.geometry,attributes:nearest.attributes})};\n  }\n\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: \"Enter a valid organization ID\" };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: \"Zoom closer for organization coverage\", action: \"show\", label: \"Zoom to coverage\" };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? \"Image ready \u00b7 Sequence unavailable\" : \"Image could not load\" };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: \"Zoom closer for travel-method coverage\", action: \"show\", label: \"Zoom to images\" };\n    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom < ZOOM.FEATURES_INTERACTIVE) {\n      const data = this.state.trafficSignsActive && this.state.objectsActive ? \"traffic signs and objects\" : this.state.trafficSignsActive ? \"traffic signs\" : \"objects\";\n      return { text: `Zoom in to display ${data}`, action: \"data\", label: \"Zoom to data\" };\n    }\n    if (this.state.turboModeActive && zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n",
              "after": "    if (this.state.turboModeActive && this.getTurboOrganizationId() === -1) return { text: \"Enter a valid organization ID\" };\n    if (this.state.turboModeActive && this.getTurboOrganizationId() !== undefined && zoom < 6) return { text: \"Zoom closer for organization coverage\", action: \"show\", label: \"Zoom to coverage\" };\n    if (this.state.imageId && this.state.selectionError) return { text: this.state.selectionError.startsWith(\"Image is open\") ? \"Image ready \u00b7 Sequence unavailable\" : \"Image could not load\" };\n    if (this.state.turboModeActive && this.state.turboFilterOnFoot !== undefined && zoom < 6) return { text: \"Zoom closer for travel-method coverage\", action: \"show\", label: \"Zoom to images\" };\n    if ((this.state.trafficSignsActive || this.state.objectsActive) && zoom + 1e-4 < ZOOM.FEATURES_INTERACTIVE) {\n      const data = this.state.trafficSignsActive && this.state.objectsActive ? \"traffic signs and objects\" : this.state.trafficSignsActive ? \"traffic signs\" : \"objects\";\n      return { text: `Zoom in to display ${data}`, action: \"data\", label: \"Zoom to data\" };\n    }\n    if (this.state.turboModeActive && zoom < 14) return { text: \"Zoom closer for image points\", action: \"show\", label: \"Zoom to images\" };\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "            featureOwnsHover = true;\n            this.clearTurboHoverDetails();\n            const attrs = (mapFeature as any).graphic.attributes || {};\n            if (this.tooltipDiv) {\n              this.tooltipDiv.textContent = attrs.name || attrs.value || \"Map feature\";\n              this.tooltipDiv.style.left = `${globalX + 15}px`;\n              this.tooltipDiv.style.top = `${globalY + 15}px`;\n              this.tooltipDiv.style.display = \"block\";\n            }\n            return; // Stop here, don't trigger Turbo hover\n          }\n\n",
              "after": "            featureOwnsHover = true;\n            this.clearTurboHoverDetails();\n            const attrs = (mapFeature as any).graphic.attributes || {};\n            if (this.tooltipDiv) {\n              const bounds = view.container?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };\n              renderMapFeatureHoverLabel(this.tooltipDiv, attrs.name || attrs.value || \"Map feature\", bounds, globalX, globalY);\n            }\n            return; // Stop here, don't trigger Turbo hover\n          }\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/mapFeatureInteraction.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst root=path.resolve(__dirname,'..'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction load(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,'src',rel+'.ts'),'utf8')))(id=>load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id))),m,m.exports);return m.exports;}\nconst {ZOOM,TILE_URLS,DEFAULT_FILTER_LABELS}=load('utils/constants'),{turboTiles,turboFootprintBboxes}=load('utils/turboCoverageUtils'),{lonLatToWebMercator}=load('utils/geoUtils');\nconst {renderMapFeatureHoverLabel,renderImageryHoverCard,positionImageryHoverCard}=load('features/imagery/hoverCard');\nconst source=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='Widget'),method=widget.members.find(n=>n.name?.getText(sf)==='pickMapFeature').getText(sf);\nlet reads=0;const feature={extent:4096,properties:{id:'feature-1',value:'object--support--utility-pole'},loadGeometry:()=>[[{x:0,y:0}]]};\nconst Runtime=new Function('ZOOM','TILE_URLS','DEFAULT_FILTER_LABELS','turboTiles','turboFootprintBboxes','lonLatToWebMercator','VectorTile','Pbf','TurboSpatialIndex','formatTrafficSignName','objectNameMap',compile('class Runtime{'+method+'}')+';return Runtime;')(ZOOM,TILE_URLS,DEFAULT_FILTER_LABELS,turboTiles,turboFootprintBboxes,lonLatToWebMercator,class{constructor(){const layer={length:1,feature:()=>{reads++;return feature;}};this.layers={traffic_sign:layer,point:layer};}},class{},class{static bytes(){return 0;}},v=>'Sign '+v,{});\nfor(const type of ['2d','3d'])for(const kind of ['signs','objects'])for(const zoom of [13.999,13.99999,14,16])test(`${type} ${kind}: native feature picking at map zoom ${zoom}`,async()=>{\n reads=0;const w=new Runtime(),layer={visible:true},view={type,zoom,stationary:true,map:{layers:{includes:l=>l===layer}},toMap:()=>({longitude:0,latitude:0,z:100}),toScreen:()=>({x:100,y:100})};\n w.state={jimuMapView:{view},trafficSignsActive:kind==='signs',objectsActive:kind==='objects'};w.mapillaryTrafficSignsLayer=kind==='signs'?layer:null;w.mapillaryObjectsLayer=kind==='objects'?layer:null;w._mapFeatureFilterCodes=new Map();w._mapFeatureTiles={get:()=>new ArrayBuffer(1)};w._mapFeatureIndexes={get:()=>undefined,reserve:()=>false};w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p);}},Graphic:class{constructor(p){Object.assign(this,p);}}};\n const result=await w.pickMapFeature({x:100,y:100},view,new AbortController().signal);\n if(zoom<13.9999){assert.equal(result,null);assert.equal(reads,0);}else{assert.equal(result.graphic.attributes.id,'feature-1');assert.equal(result.layer,layer);assert.equal(reads,1);}\n});\ntest('cancelled or moving views cannot pick a source-zoom-14 feature',async()=>{\n const w=new Runtime(),view={zoom:14,stationary:false};w.state={jimuMapView:{view}};assert.equal(await w.pickMapFeature({x:0,y:0},view,new AbortController().signal),null);view.stationary=true;const controller=new AbortController();controller.abort();assert.equal(await w.pickMapFeature({x:0,y:0},view,controller.signal),null);\n});\n\nfunction documentHost(){\n const doc={defaultView:{innerWidth:500,innerHeight:300},fullscreenElement:null,createElement:tag=>node(tag)};\n function node(tag){return{tag,style:{},children:[],textContent:'',ownerDocument:doc,parentNode:null,attributes:{},setAttribute(k,v){this.attributes[k]=v;},appendChild(child){this.children.push(child);child.parentNode=this;}};}\n doc.body=node('body');const host=node('div');doc.body.appendChild(host);host.measures=0;host.getBoundingClientRect=()=>{host.measures++;const width=Math.min(host.textContent.length*6+26,parseFloat(host.style.maxWidth)||500);return{width,height:Math.ceil((host.textContent.length*6+26)/width)*18+26};};return{doc,host};\n}\ntest('a short feature label replaces the old 240px imagery width and safely displays literal text',()=>{\n const {host}=documentHost();host.style.width='240px';host.style.maxHeight='200px';renderMapFeatureHoverLabel(host,'Pole',{left:0,right:500,top:0,bottom:300},40,40);assert.equal(host.style.width,'max-content');assert.equal(host.textContent,'Pole');assert(host.getBoundingClientRect().width<100);assert.equal(host.attributes.role,'tooltip');\n renderMapFeatureHoverLabel(host,'<img src=x onerror=alert(1)>',{left:0,right:500,top:0,bottom:300},40,40);assert.equal(host.children.length,0);assert.equal(host.textContent,'<img src=x onerror=alert(1)>');\n});\ntest('same label reuses its measurement after pointer clearing; longer labels and narrower maps remeasure and clamp',()=>{\n const {host}=documentHost(),bounds={left:0,right:500,top:0,bottom:300};renderMapFeatureHoverLabel(host,'Pole',bounds,450,270);const firstWidth=parseFloat(host.style.left);assert(firstWidth<450);assert(parseFloat(host.style.top)<270);host.textContent='';host.style.display='none';renderMapFeatureHoverLabel(host,'Pole',bounds,200,100);assert.equal(host.measures,1);\n renderMapFeatureHoverLabel(host,'Warning School-zone G2',bounds,200,100);assert.equal(host.measures,2);renderMapFeatureHoverLabel(host,'Warning School-zone G2',{...bounds,right:150},140,270);assert.equal(host.measures,3);assert.equal(host.style.maxWidth,'142px');assert(parseFloat(host.style.left)>=8);assert.equal(host.style.overflowWrap,'anywhere');renderMapFeatureHoverLabel(host,'Warning School-zone G2',{...bounds,right:150,bottom:150},140,140);assert.equal(host.measures,4);assert.equal(host.style.maxHeight,'142px');\n});\ntest('switching from a feature label back to imagery restores preview dimensions and invalidates label measurement',()=>{\n const {host}=documentHost(),bounds={left:0,right:500,top:0,bottom:300};renderMapFeatureHoverLabel(host,'Pole',bounds,40,40);positionImageryHoverCard(host,bounds,40,40);renderImageryHoverCard(host,{creator:{username:'Example'},captured_at:1700000000000});assert.equal(host.style.width,'240px');assert.equal(host.children.length,3);host.children=[];renderMapFeatureHoverLabel(host,'Pole',bounds,40,40);assert.equal(host.style.width,'max-content');assert.equal(host.measures,2);\n});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'map-feature-ui-fix-v6-3-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
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


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.3 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'map-feature-ui-fix-v6-3' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.3 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.3 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.3 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-map-feature-ui-fix-v6-3.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Map feature UI v6.3 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
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
  const manifest = { installer: 'map-feature-ui-fix-v6-3', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Map feature UI v6.3 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
