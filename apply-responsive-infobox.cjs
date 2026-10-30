#!/usr/bin/env node
'use strict';
/** Responsive infobox installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
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
      "file": "src/styles/infoBox.ts",
      "blocks": [
        {
          "label": "src/styles/infoBox.ts responsive infobox 1",
          "before": "\n/** Discovery footer styles; compact-container overrides remain in the InfoBox shell. */\nexport function infoFooterPanelStyle(isOverflowing: boolean, canScrollDown: boolean): React.CSSProperties { return { pointerEvents: \"auto\", width: 96, boxSizing: \"border-box\", marginTop: 3, marginRight: isOverflowing ? 4 : 0, alignSelf: \"flex-end\", flexShrink: 0, borderRadius: 5, border: \"1px solid rgba(167,213,190,0.25)\", background: \"rgba(18,31,27,0.94)\", boxShadow: canScrollDown ? \"0 -5px 8px rgba(18,31,27,0.35)\" : \"none\" }; }\nexport const infoFooterRowStyle: React.CSSProperties = { display: \"flex\", gap: 2 };\nexport function infoFooterUpStyle(canScrollDown: boolean): React.CSSProperties { return { flex: canScrollDown ? \"0 0 22px\" : \"1 1 auto\", minHeight: 26, padding: \"3px 2px\", border: \"none\", background: \"transparent\", borderRadius: 4, color: \"#d6ebdf\", fontSize: 8, cursor: \"pointer\" }; }\nexport const infoFooterDownStyle: React.CSSProperties = { flex: \"1 1 auto\", minHeight: 26, padding: \"3px 2px\", border: \"none\", background: \"transparent\", borderRadius: 4, color: \"#d6ebdf\", fontSize: 8, cursor: \"pointer\", whiteSpace: \"nowrap\" };\nexport const infoFooterHintCss = `\n            @keyframes mly-info-more-hint { 50% { transform: translateY(2px); } }\n            .mly-info-more-hint { display: inline-block; animation: mly-info-more-hint 800ms ease-out 2; }\n",
          "after": "\n/** Discovery footer styles; compact-container overrides remain in the InfoBox shell. */\nexport function infoFooterPanelStyle(isOverflowing: boolean, canScrollDown: boolean): React.CSSProperties { return { pointerEvents: \"auto\", width: 96, boxSizing: \"border-box\", marginTop: 3, marginRight: isOverflowing ? 4 : 0, alignSelf: \"flex-end\", flexShrink: 0, borderRadius: 5, border: \"1px solid rgba(167,213,190,0.25)\", background: \"rgba(18,31,27,0.94)\", boxShadow: canScrollDown ? \"0 -5px 8px rgba(18,31,27,0.35)\" : \"none\" }; }\nexport const infoFooterRowStyle: React.CSSProperties = { display: \"grid\", gap: 2, minWidth: 0 };\nexport function infoFooterUpStyle(canScrollDown: boolean): React.CSSProperties { return { flex: canScrollDown ? \"0 0 22px\" : \"1 1 auto\", minWidth: 0, boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", minHeight: 26, padding: \"3px 2px\", border: \"none\", background: \"transparent\", borderRadius: 4, color: \"#d6ebdf\", fontSize: 8, cursor: \"pointer\" }; }\nexport const infoFooterDownStyle: React.CSSProperties = { minWidth: 0, boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", gap: 2, textAlign: \"center\", flex: \"1 1 auto\", minHeight: 26, padding: \"3px 2px\", border: \"none\", background: \"transparent\", borderRadius: 4, color: \"#d6ebdf\", fontSize: 8, cursor: \"pointer\", whiteSpace: \"normal\" };\nexport const infoFooterHintCss = `\n            @keyframes mly-info-more-hint { 50% { transform: translateY(2px); } }\n            .mly-info-more-hint { display: inline-block; animation: mly-info-more-hint 800ms ease-out 2; }\n"
        },
        {
          "label": "src/styles/infoBox.ts responsive infobox 2",
          "before": "\n/** Compact location-first card aligned with the existing 96px tool sections. */\nexport const infoDetailsCss = `\n.mly-info-panel { font-family: \"Segoe UI\", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }\n.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; min-height: 24px; border: 0; border-radius: 0; background: rgba(18,31,27,.7); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 10px; cursor: pointer; }\n.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border-radius: 0; background: rgba(18,31,27,.62); backdrop-filter: blur(8px); padding: 0; }\n",
          "after": "\n/** Compact location-first card aligned with the existing 96px tool sections. */\nexport const infoDetailsCss = `\n.mly-info-panel { container: mly-info / inline-size; min-width: 0; box-sizing: border-box; font-family: \"Segoe UI\", sans-serif; width: 96px; max-width: calc(100% - 44px); gap: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 3px 10px #0003; }\n.mly-info-toggle { pointer-events: auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 4px; padding: 4px 5px; min-height: 24px; border: 0; border-radius: 0; background: rgba(18,31,27,.7); backdrop-filter: blur(8px); color: #d6f1df; font: inherit; font-size: 10px; cursor: pointer; }\n.mly-info-location { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.mly-info-body { min-height: 0; display: flex; flex-direction: column; pointer-events: auto; border-radius: 0; background: rgba(18,31,27,.62); backdrop-filter: blur(8px); padding: 0; }\n"
        },
        {
          "label": "src/styles/infoBox.ts responsive infobox 3",
          "before": "  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n}\n`;\n",
          "after": "  .mly-info-panel { max-height: min(58%, calc(100% - 12px)) !important; }\n  .mly-info-panel .info-box button { min-height: 24px; }\n}\n\n/* Analysis/routing cards fit their actual parent in every host and input mode.\n * Named queries measure the infobox itself, including a compact Widget Controller. */\n.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) { width: 100% !important; max-width: 100%; min-width: 0; box-sizing: border-box; flex-shrink: 0; }\n.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) :is(div,span,label,button,select) { min-width: 0; box-sizing: border-box; }\n.mly-info-panel :is(.mly-coverage-results,.mly-route-controls,.mly-route-points) button { max-width: 100%; white-space: normal; overflow-wrap: anywhere; }\n.mly-info-panel .mly-coverage-tier-line { display: grid !important; grid-template-columns: minmax(0,1fr) auto; gap: 3px; }\n.mly-info-panel .mly-coverage-tier-label { flex-wrap: wrap; column-gap: 3px; row-gap: 0; }\n.mly-info-panel .mly-coverage-tier-percent { white-space: nowrap; }\n.mly-info-panel .mly-route-choice select { width: 100%; max-width: 100%; }\n.mly-info-panel .mly-route-metric-row { flex-wrap: wrap; gap: 2px 4px; }\n.mly-info-panel .mly-route-result-actions { display: grid !important; grid-template-columns: minmax(0,1fr) auto; }\n@container mly-info (max-width: 115px) {\n .mly-route-choice { display: grid !important; grid-template-columns: minmax(0,1fr); gap: 2px !important; }\n .mly-route-choice select { min-height: 24px; }\n .mly-route-pick-buttons { display: grid !important; grid-template-columns: repeat(2,minmax(0,1fr)); }\n .mly-route-pick-buttons button { min-height: 24px; }\n .mly-coverage-results > div:first-child { flex-wrap: wrap; gap: 2px; }\n .mly-route-metric-row { align-items: flex-start !important; }\n}\n\n/* Every disclosure tool shares the infobox content width, including its scrollbar gutter. */\n.mly-info-panel .mly-info-more { min-width: 0; max-width: 100%; }\n.mly-info-panel .mly-info-more > :not(summary) { width: 100% !important; max-width: 100%; min-width: 0; box-sizing: border-box; flex-shrink: 0; }\n.mly-info-panel .mly-info-more :is(div,span,label,button,select,input) { min-width: 0; box-sizing: border-box; }\n.mly-info-panel .mly-info-more :is(button,select,input[type=\"range\"]) { max-width: 100%; }\n.mly-info-panel .mly-info-more button { white-space: normal; overflow-wrap: anywhere; }\n.mly-info-panel .mly-info-more button > span { white-space: normal !important; overflow-wrap: anywhere; }\n.mly-info-panel .mly-cloud-export > :is(button,select) { width: 100% !important; }\n.mly-info-panel .mly-info-footer button { min-width: 0; box-sizing: border-box; text-align: center; }\n@container mly-info (max-width: 115px) {\n .mly-info-more button > span { display: block !important; }\n .mly-info-more button > span > svg { vertical-align: middle; }\n}\n`;\n"
        }
      ],
      "absentAfterUninstall": [
        "container: mly-info / inline-size"
      ],
      "requiredOccurrences": [
        {
          "text": "container: mly-info / inline-size",
          "count": 1
        }
      ]
    },
    {
      "file": "src/styles/coverageAnalysis.ts",
      "blocks": [
        {
          "label": "src/styles/coverageAnalysis.ts responsive infobox 1",
          "before": "    border: \"1px solid rgba(30, 144, 255, 0.3)\",\n    backdropFilter: \"blur(5px)\",\n    pointerEvents: \"auto\",\n    width: \"96px\",\n    boxSizing: \"border-box\",\n};\nexport const coverageResultsHeaderStyle: React.CSSProperties = {\n",
          "after": "    border: \"1px solid rgba(30, 144, 255, 0.3)\",\n    backdropFilter: \"blur(5px)\",\n    pointerEvents: \"auto\",\n    width: \"100%\",\n    minWidth: 0,\n    maxWidth: \"100%\",\n    boxSizing: \"border-box\",\n};\nexport const coverageResultsHeaderStyle: React.CSSProperties = {\n"
        }
      ],
      "absentAfterUninstall": [
        "    minWidth: 0,\n    maxWidth: \"100%\","
      ],
      "requiredOccurrences": [
        {
          "text": "    minWidth: 0,\n    maxWidth: \"100%\",",
          "count": 1
        }
      ]
    },
    {
      "file": "src/styles/routing.ts",
      "blocks": [
        {
          "label": "src/styles/routing.ts responsive infobox 1",
          "before": "/** Preserved waypoint controls remain usable independently of coverage-analysis results. */\nexport const routePointsCardStyle: React.CSSProperties = {\n    marginTop: \"4px\",\n    width: \"96px\",\n    padding: \"4px\",\n    boxSizing: \"border-box\",\n    background: \"rgba(20, 20, 20, 0.65)\",\n",
          "after": "/** Preserved waypoint controls remain usable independently of coverage-analysis results. */\nexport const routePointsCardStyle: React.CSSProperties = {\n    marginTop: \"4px\",\n    width: \"100%\",\n    minWidth: 0,\n    maxWidth: \"100%\",\n    padding: \"4px\",\n    boxSizing: \"border-box\",\n    background: \"rgba(20, 20, 20, 0.65)\",\n"
        }
      ],
      "absentAfterUninstall": [
        "    maxWidth: \"100%\","
      ],
      "requiredOccurrences": [
        {
          "text": "    maxWidth: \"100%\",",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/coverage/CoverageAnalysisResults.tsx",
      "blocks": [
        {
          "label": "src/features/coverage/CoverageAnalysisResults.tsx responsive infobox 1",
          "before": "\n                  const row = (color: string, label: string, age: string, pct: number, km: number) => (\n                    <div style={coverageResultsTierRowStyle}>\n                      <div style={coverageResultsTierLineStyle}>\n                        <div style={coverageResultsTierLabelGroupStyle}>\n                          <div style={getCoverageResultsTierDotStyle(color)} />\n                          <span style={coverageResultsTierLabelStyle}>{label}</span>\n                          <span style={coverageResultsTierAgeStyle}>{age}</span>\n                        </div>\n                        <span style={coverageResultsTierPercentStyle}>{pct}%</span>\n                      </div>\n                      <div style={coverageResultsTierDistanceStyle}>{km} km</div>\n                    </div>\n",
          "after": "\n                  const row = (color: string, label: string, age: string, pct: number, km: number) => (\n                    <div style={coverageResultsTierRowStyle}>\n                      <div className=\"mly-coverage-tier-line\" style={coverageResultsTierLineStyle}>\n                        <div className=\"mly-coverage-tier-label\" style={coverageResultsTierLabelGroupStyle}>\n                          <div style={getCoverageResultsTierDotStyle(color)} />\n                          <span style={coverageResultsTierLabelStyle}>{label}</span>\n                          <span style={coverageResultsTierAgeStyle}>{age}</span>\n                        </div>\n                        <span className=\"mly-coverage-tier-percent\" style={coverageResultsTierPercentStyle}>{pct}%</span>\n                      </div>\n                      <div style={coverageResultsTierDistanceStyle}>{km} km</div>\n                    </div>\n"
        }
      ],
      "absentAfterUninstall": [
        "mly-coverage-tier-line"
      ],
      "requiredOccurrences": [
        {
          "text": "mly-coverage-tier-line",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/routing/RouteControls.tsx",
      "blocks": [
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 1",
          "before": "      {/* Runtime Routing Engine */}\n      {runtimeRoutingEngine && (\n        <div\n          style={routeChoiceRowStyle}\n        >\n          <span\n            style={routeChoiceLabelStyle}\n",
          "after": "      {/* Runtime Routing Engine */}\n      {runtimeRoutingEngine && (\n        <div\n          className=\"mly-route-choice\" style={routeChoiceRowStyle}\n        >\n          <span\n            style={routeChoiceLabelStyle}\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 2",
          "before": "      {/* Runtime Travel Mode */}\n      {runtimeTravelMode && (\n        <div\n          style={routeChoiceRowStyle}\n        >\n          <span\n            style={routeChoiceLabelStyle}\n",
          "after": "      {/* Runtime Travel Mode */}\n      {runtimeTravelMode && (\n        <div\n          className=\"mly-route-choice\" style={routeChoiceRowStyle}\n        >\n          <span\n            style={routeChoiceLabelStyle}\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 3",
          "before": "      {!routeData ? (\n        <div style={routeDraftStyle}>\n          {/* Point A and B Selection Buttons */}\n          <div style={routePointButtonsStyle}>\n            <button\n              onClick={() => onSetRoutePickMode?.(routePickMode === \"start\" ? null : \"start\")}\n              title=\"Select Start Point (A) on map\"\n",
          "after": "      {!routeData ? (\n        <div style={routeDraftStyle}>\n          {/* Point A and B Selection Buttons */}\n          <div className=\"mly-route-pick-buttons\" style={routePointButtonsStyle}>\n            <button\n              onClick={() => onSetRoutePickMode?.(routePickMode === \"start\" ? null : \"start\")}\n              title=\"Select Start Point (A) on map\"\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 4",
          "before": "           * --------------------------------------------------------\n           */}\n          <div\n            style={routeResultHeaderStyle}\n          >\n            <span>A \u2794 B CAPTURE</span>\n\n",
          "after": "           * --------------------------------------------------------\n           */}\n          <div\n            className=\"mly-route-metric-row\" style={routeResultHeaderStyle}\n          >\n            <span>A \u2794 B CAPTURE</span>\n\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 5",
          "before": "           */}\n          {routeData.targetRealizationPercent != null && (\n            <div\n              style={routeRealizationStyle}\n            >\n              <span\n                style={routeMutedLabelStyle}\n",
          "after": "           */}\n          {routeData.targetRealizationPercent != null && (\n            <div\n              className=\"mly-route-metric-row\" style={routeRealizationStyle}\n            >\n              <span\n                style={routeMutedLabelStyle}\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 6",
          "before": "           */}\n          {routeData.extraDurationMinutes != null && routeData.requestedExtraMinutes != null && (\n            <div\n              style={routeExtraTimeStyle}\n            >\n              <span\n                style={routeExtraTimeLabelStyle}\n",
          "after": "           */}\n          {routeData.extraDurationMinutes != null && routeData.requestedExtraMinutes != null && (\n            <div\n              className=\"mly-route-metric-row\" style={routeExtraTimeStyle}\n            >\n              <span\n                style={routeExtraTimeLabelStyle}\n"
        },
        {
          "label": "src/features/routing/RouteControls.tsx responsive infobox 7",
          "before": "           * --------------------------------------------------------\n           */}\n          <div\n            style={routeResultActionsStyle}\n          >\n            <button\n              onClick={onDownloadRouteGPX}\n",
          "after": "           * --------------------------------------------------------\n           */}\n          <div\n            className=\"mly-route-result-actions\" style={routeResultActionsStyle}\n          >\n            <button\n              onClick={onDownloadRouteGPX}\n"
        }
      ],
      "absentAfterUninstall": [
        "mly-route-choice"
      ],
      "requiredOccurrences": [
        {
          "text": "mly-route-choice",
          "count": 2
        }
      ]
    },
    {
      "file": "src/components/info-box/ScrollDiscoveryFooter.tsx",
      "blocks": [
        {
          "label": "src/components/info-box/ScrollDiscoveryFooter.tsx responsive infobox 1",
          "before": "export const ScrollDiscoveryFooter: React.FC<ScrollDiscoveryFooterProps> = ({ canScrollDown, canScrollUp, isOverflowing, scrollContainerRef }) => (\n<div className=\"mly-info-footer\" style={infoFooterPanelStyle(isOverflowing, canScrollDown)}>\n          <style>{infoFooterHintCss}</style>\n          <div style={infoFooterRowStyle}>\n            {canScrollUp && <button type=\"button\" aria-label=\"Back to top of image controls\" title=\"Back to top\" onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.(\"(prefers-reduced-motion: reduce)\").matches ? \"auto\" : \"smooth\" })} style={infoFooterUpStyle(canScrollDown)}>{canScrollDown ? \"\u2191\" : \"Back to top \u2191\"}</button>}\n            {canScrollDown && <button type=\"button\" aria-label=\"Scroll to more image controls\" title=\"Show more controls\" onClick={() => { const panel = scrollContainerRef.current; if (panel) panel.scrollBy({ top: Math.max(60, panel.clientHeight * 0.8), behavior: window.matchMedia?.(\"(prefers-reduced-motion: reduce)\").matches ? \"auto\" : \"smooth\" }); }} style={infoFooterDownStyle}><span className=\"mly-info-more-hint\">More controls \u2193</span></button>}\n          </div>\n        </div>\n);\n",
          "after": "export const ScrollDiscoveryFooter: React.FC<ScrollDiscoveryFooterProps> = ({ canScrollDown, canScrollUp, isOverflowing, scrollContainerRef }) => (\n<div className=\"mly-info-footer\" style={infoFooterPanelStyle(isOverflowing, canScrollDown)}>\n          <style>{infoFooterHintCss}</style>\n          <div style={{ ...infoFooterRowStyle, gridTemplateColumns: canScrollUp && canScrollDown ? \"20px minmax(0,1fr)\" : \"minmax(0,1fr)\" }}>\n            {canScrollUp && <button type=\"button\" aria-label=\"Back to top of image controls\" title=\"Back to top\" onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: window.matchMedia?.(\"(prefers-reduced-motion: reduce)\").matches ? \"auto\" : \"smooth\" })} style={infoFooterUpStyle(canScrollDown)}>{canScrollDown ? \"\u2191\" : \"Back to top \u2191\"}</button>}\n            {canScrollDown && <button type=\"button\" aria-label=\"Scroll to more image controls\" title=\"Show more controls\" onClick={() => { const panel = scrollContainerRef.current; if (panel) panel.scrollBy({ top: Math.max(60, panel.clientHeight * 0.8), behavior: window.matchMedia?.(\"(prefers-reduced-motion: reduce)\").matches ? \"auto\" : \"smooth\" }); }} style={infoFooterDownStyle}><span>More controls</span><span className=\"mly-info-more-hint\" aria-hidden=\"true\">\u2193</span></button>}\n          </div>\n        </div>\n);\n"
        }
      ],
      "absentAfterUninstall": [
        "gridTemplateColumns: canScrollUp && canScrollDown"
      ],
      "requiredOccurrences": [
        {
          "text": "gridTemplateColumns: canScrollUp && canScrollDown",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md responsive infobox 1",
          "before": "## 3D follow terrain fallback\n\nThe original follow policy deferred every check when the optional rendered-terrain sampler was absent or returned no data. Fall back to the public SceneView `toMap` intersections of eight inset-perimeter rays and test the image against that rotated/tilted ground footprint. Preserve 24%/128 px inset, existing easing, manual movement guards and explicit image lock. Skip sky rays; fewer than three ground intersections defer navigation. No extra watcher, timer or elevation service requests. Validate tilted views and edge following in the host.\n",
          "after": "## 3D follow terrain fallback\n\nThe original follow policy deferred every check when the optional rendered-terrain sampler was absent or returned no data. Fall back to the public SceneView `toMap` intersections of eight inset-perimeter rays and test the image against that rotated/tilted ground footprint. Preserve 24%/128 px inset, existing easing, manual movement guards and explicit image lock. Skip sky rays; fewer than three ground intersections defer navigation. No extra watcher, timer or elevation service requests. Validate tilted views and edge following in the host.\n\n## Infobox content-width layout\n\nAnalysis, routing, point-cloud and detection controls now inherit the infobox content width, including space consumed by its scrollbar. A named `mly-info` inline-size container lets compact route choices stack at the panel's width instead of relying on the application's desktop viewport. Coverage tiers keep their percentage column while labels/ages wrap. Disclosure tool cards and export buttons use border-box sizing and full parent width; labels can wrap without losing switches. The scroll footer uses a two-column grid only when both actions are present, with the more-controls label and arrow centered together. Existing callbacks, analysis/routing data and resource lifecycles are unchanged. `tests/infoBoxLayout.browser.cjs` checks actual presentation components in Chromium across controller/mobile widths, expanded states, and all footer modes. Full Experience Builder visual verification remains necessary.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Infobox content-width layout"
      ],
      "requiredOccurrences": [
        {
          "text": "## Infobox content-width layout",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "tests/infoBoxFooter.test.cjs",
      "content": "/** Footer actions retain navigation semantics while presentation adapts to narrow cards. */\nconst fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'../src'),compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx'}}).outputText,styles={exports:{}};\nnew Function('module','exports',compile(fs.readFileSync(root+'/styles/infoBox.ts','utf8')))(styles,styles.exports);const m={exports:{}},jsx=(type,props,...children)=>({type,props,children});new Function('require','module','exports',compile(fs.readFileSync(root+'/components/info-box/ScrollDiscoveryFooter.tsx','utf8')))(id=>id==='jimu-core'?{React:{},jsx}:styles.exports,m,m.exports);const {ScrollDiscoveryFooter:Footer}=m.exports;\nconst buttons=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(buttons):[...(node.type==='button'?[node]:[]),...buttons(node.children)];\nfunction setup(up,down,height=100,reduced=false){const calls=[];global.window={matchMedia:()=>({matches:reduced})};const ref={current:{clientHeight:height,scrollBy:p=>calls.push(['by',p]),scrollTo:p=>calls.push(['to',p])}};return{calls,ref,buttons:buttons(Footer({canScrollUp:up,canScrollDown:down,isOverflowing:true,scrollContainerRef:ref}))}}\ntest('both footer actions remain accessible and scroll the live panel',()=>{const x=setup(true,true);assert.equal(x.buttons.length,2);assert.equal(x.buttons[0].props['aria-label'],'Back to top of image controls');assert.equal(x.buttons[1].props['aria-label'],'Scroll to more image controls');x.buttons[0].props.onClick();x.buttons[1].props.onClick();assert.deepEqual(x.calls,[['to',{top:0,behavior:'smooth'}],['by',{top:80,behavior:'smooth'}]])});\ntest('start and end show only their applicable scroll action',()=>{assert.equal(setup(false,true).buttons.length,1);assert.equal(setup(true,false).buttons.length,1)});\ntest('small panels retain minimum scroll distance and reduced-motion preference',()=>{const x=setup(false,true,20,true);x.buttons[0].props.onClick();assert.deepEqual(x.calls,[['by',{top:60,behavior:'auto'}]])});\ntest('unmounted scroll target is safely ignored',()=>{const x=setup(true,true);x.ref.current=null;for(const b of x.buttons)b.props.onClick();assert.deepEqual(x.calls,[])});\n"
    },
    {
      "file": "tests/infoBoxLayout.browser.cjs",
      "content": "/** Real Chromium layout regression for the actual coverage/routing components and styles.\n * MAPILLARY_TYPESCRIPT points to typescript.js; Playwright must have Chromium available.\n * No Experience Builder SDK is loaded: this harness supplies only JSX/React presentation primitives.\n */\nconst fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),{chromium}=require(process.env.MAPILLARY_PLAYWRIGHT||'playwright'),root=process.env.INFOBOX_LAYOUT_SOURCE_ROOT||path.resolve(__dirname,'../src');\nconst jsx=(type,props,...children)=>({type,props:{...props,children}});class PureComponent{constructor(props){this.props=props}setState(){}}\nconst React={PureComponent,Fragment:'fragment',createRef:()=>({current:null})};const cache=new Map();\nfunction load(rel){if(cache.has(rel))return cache.get(rel);const m={exports:{}};const file=path.join(root,rel);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,jsxFactory:'jsx',jsxFragmentFactory:'React.Fragment'}}).outputText;new Function('require','module','exports',code)(id=>id==='jimu-core'?{React,jsx}:id==='react'?React:id==='react-dom'?{createPortal:x=>x}:load(path.posix.normalize(path.posix.join(path.posix.dirname(rel),id+(id.endsWith('.tsx')||id.endsWith('.ts')?'':fs.existsSync(path.join(root,path.posix.dirname(rel),id+'.tsx'))?'.tsx':'.ts')))),m,m.exports);cache.set(rel,m.exports);return m.exports}\nconst cloud=load('features/point-cloud/PointCloudToolSections.tsx'),status=load('features/point-cloud/PointCloudStatusSection.tsx'),calibration=load('features/point-cloud/PointCloudCalibrationControls.tsx'),corridor=load('features/point-cloud/PointCloudCorridorControls.tsx'),exporter=load('features/point-cloud/PointCloudExportControls.tsx'),detection=load('features/detections/DetectionToolsSection.tsx'),footer=load('components/info-box/ScrollDiscoveryFooter.tsx'),{miniJoyStyle}=load('utils/styles.ts');\nconst escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('\"','&quot;');const unitless=new Set(['opacity','fontWeight','flex','flexGrow','flexShrink','order','zIndex','lineHeight']);\nfunction html(node){if(node==null||typeof node==='boolean')return'';if(Array.isArray(node))return node.map(html).join('');if(typeof node!=='object')return escape(node);const {type,props}=node;if(typeof type==='function')return html(type.prototype?.render?new type(props).render():type(props));if(type==='fragment')return html(props.children);const attrs=Object.entries(props).filter(([k,v])=>k!=='children'&&k!=='key'&&!k.startsWith('on')&&v!=null&&typeof v!=='function').map(([k,v])=>{if(k==='style'){const css=Object.entries(v).map(([k,v])=>`${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${typeof v==='number'&&!unitless.has(k)?v+'px':v}`).join(';');return`style=\"${escape(css)}\"`}return`${k==='className'?'class':k}=\"${escape(v)}\"`}).join(' ');return`<${type} ${attrs}>${type==='style'?props.children.join(''):html(props.children)}</${type}>`}\nconst {CoverageAnalysisResults}=load('features/coverage/CoverageAnalysisResults.tsx'),{RouteControls,RoutePointControls}=load('features/routing/RouteControls.tsx'),styles=load('styles/infoBox.ts');\nconst baseRoute={runtimeRoutingEngine:'world',runtimeTravelMode:'drive',routeSpareMinutes:120,routeStartPoint:[1,2],routeEndPoint:[3,4]};\nfunction content(state){if(state.startsWith('cloud')){const active=state==='cloudactive';return '<details open class=\"mly-info-more\"><summary>Tools & details</summary>'+html([jsx(cloud.PointCloudMeasureTools,{isMeasureMode:active,measurePoints:[]}),jsx(cloud.PointCloudLassoTools,{isLassoMode:active}),jsx(cloud.PointCloudSightTools,{isSightMode:active,sightTargets:[]}),jsx(cloud.PointCloudViewshedTools,{isViewshedMode:active}),jsx(calibration.PointCloudCalibrationControls,{showCalibrationPanel:active,nudgeStep:1,miniJoyStyle}),jsx(status.PointCloudAdaptiveControl,{pointCloudAdaptive:true}),jsx(status.PointCloudStatus,{pointCloudSummary:'123456 visible \u00b7 Loaded cloud',pointCloudIncomplete:true}),jsx(corridor.PointCloudCorridorControls,{pointCloudLength:0,pointCloudMaxLength:700,pointCloudActualLength:650,pointCloudWidth:0,pointCloudMaxWidth:80,pointCloudActualWidth:70,onWidthChange:()=>{}}),jsx(exporter.PointCloudExportControls,{format:'csv'})])+'</details>'}if(['signs','objects','both'].includes(state))return '<details open class=\"mly-info-more\"><summary>Tools & details</summary>'+html(jsx(detection.DetectionToolsSection,{trafficSignsActive:state!=='objects',objectsActive:state!=='signs',imageId:'image',detectionsActive:true,showAiTags:true}))+'</details>';if(state==='points')return html(jsx(RoutePointControls,baseRoute));const route={...baseRoute,routeData:state==='result'?{duration:99999,distance:987654,usefulCoverageMeters:123456,targetRealizationPercent:97,incrementalNoneMeters:123456,incrementalStaleMeters:98765,extraDurationMinutes:120,requestedExtraMinutes:120}:undefined};return html(jsx(CoverageAnalysisResults,{coverageAnalysisLoading:state==='loading',coverageAnalysisProgress:'Checking imagery and road coverage\u2026',coverageResult:state==='loading'?undefined:{totalCount:999999,coveredCount:123456,percentCovered:20,freshCount:1000,agingCount:1000,staleCount:121456,noneCount:876543,freshKm:1234.56,agingKm:2345.67,staleKm:9876.54,noneKm:12345.67},coverageSegmentsVisible:true,renderRoutingControls:()=>jsx(RouteControls,route)}))}\n(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,ignoreDefaultArgs:['--hide-scrollbars'],args:['--no-sandbox']});let cases=0;try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:375,height:667}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage();for(const hostWidth of [240,360,480,780])for(const wide of [false,true])for(const state of ['loading','draft','result','points','cloudidle','cloudactive','signs','objects','both'])for(const footerMode of ['start','middle','end']){await page.setContent(`<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><style>body{margin:0;color:white;background:#354c40} .host{position:relative;container-type:inline-size;width:${hostWidth}px;height:320px} ${styles.infoPanelResponsiveCss}${styles.infoDetailsCss} .mly-info-panel .mly-info-scroll{scrollbar-width:auto!important;scrollbar-gutter:stable;overflow-y:scroll!important}.mly-info-panel .mly-info-scroll::-webkit-scrollbar{display:block!important;width:12px}</style><div class=\"host\"><div class=\"mly-info-panel${wide?' is-wide':''}\" style=\"position:absolute;right:4px;top:2px;display:flex;flex-direction:column;max-height:260px\"><div class=\"mly-info-header\"><button class=\"mly-info-toggle\">Image tools</button></div><div class=\"mly-info-body\" style=\"min-height:0\"><div class=\"mly-info-scroll\" style=\"display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;min-height:0\">${content(state)}</div>${html(jsx(footer.ScrollDiscoveryFooter,{canScrollDown:footerMode!==\"end\",canScrollUp:footerMode!==\"start\",isOverflowing:true,scrollContainerRef:{current:null}}))}</div></div></div>`);const result=await page.evaluate(()=>{const panel=document.querySelector('.mly-info-panel'),scroll=document.querySelector('.mly-info-scroll'),box=panel.getBoundingClientRect();return{width:box.width,scrollable:scroll.scrollHeight>scroll.clientHeight,horizontalOverflow:scroll.scrollWidth-scroll.clientWidth,overflow:[...panel.querySelectorAll('div,span,button,select')].filter(e=>{if(e.closest('[aria-hidden=\"true\"],.mly-coverage-scan'))return false;const r=e.getBoundingClientRect();return r.width>0&&(r.right>box.right+1||r.left<box.left-1)}).map(e=>({tag:e.tagName,text:e.textContent.slice(0,60),width:e.getBoundingClientRect().width}))}});assert.deepEqual(result.overflow,[],JSON.stringify({mobile,hostWidth,wide,state,footerMode,...result}));assert(result.horizontalOverflow<=1,JSON.stringify({mobile,hostWidth,wide,state,footerMode,...result}));if(['result','cloudactive'].includes(state))assert(result.scrollable,'Long results must scroll vertically');cases++}await context.close()}console.log(cases+' Chromium layout cases passed: compact/wide infobox, Widget Controller widths, touch/mobile, loading, analysis, route draft/result, saved waypoints, activated cloud settings, detection actions and footer.');}finally{await browser.close()}})().catch(e=>{console.error(e.message);process.exitCode=1});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'responsive-infobox-';

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
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-responsive-infobox.cjs [--dry-run] [--skip-tests] [--uninstall]');
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
      conflict(entry.file + ' (edited native selection references remain)');
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
    console.log(uninstall ? 'Responsive infobox is already uninstalled. No files changed.' : 'Responsive infobox is already installed. No files changed.');
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
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'responsive-infobox', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
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
  console.log('Responsive infobox ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Analysis, routing, cloud/detection controls and the scroll footer now fit the infobox content width. Use uninstall-responsive-infobox.cjs to revert.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
