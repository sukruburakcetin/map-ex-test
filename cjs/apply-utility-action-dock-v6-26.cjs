#!/usr/bin/env node
'use strict';
/**
 * Utility action dock v6.26. Compatible current v6 sources.
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
      "file": "src/components/ImageUtilityGroup.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/components/ImageUtilityGroup.tsx block 1",
              "before": "/** @jsx jsx */\nimport { React, jsx } from \"jimu-core\";\nimport { glassStyles } from \"../utils/styles\";\nimport { imageUtilityInteractionCss, pointCloudModeCss, imageUtilityPanelStyle } from '../styles/controlPanels';\nimport * as Icons from \"./Icons\";\nimport { ImageUtilityGroupProps } from \"./types\";\n\n/**\n    * ImageUtilityGroup\n    * Floating vertical button strip rendered inside the viewer area.\n    * Contains: Time Travel, Share, Download, Sync Heading, Center Map.\n    * Each button is independently hidden via config flags.\n*/\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = ({\n    // config flags\n    hideTimeTravel,\n    hideShareButton,\n    hideImageDownload,\n    hideSyncHeadingButton,\n    hideCenterMapButton,\n    hidePointCloud,\n    // state\n    hasTimeTravel,\n    isDownloading,\n    syncHeading,\n    is3D,\n    imageId,\n    sequenceImages,\n    pointCloudFollowImages,\n    onPointCloudFollowImagesChange,\n    pointCloudLoading,\n    pointCloudAutoPaused,\n    pointCloudActive,\n    pointCloudVisible,\n    pointCloudAvailable,\n    // callbacks\n    onTimeTravel,\n    onShare,\n    onDownload,\n    onToggleSyncHeading,\n    onCenterMap,\n    onTogglePointCloud,\n}) => (\n    <div\n        className=\"glass-image-utility-panel\"\n        style={imageUtilityPanelStyle}\n    >\n<style>{imageUtilityInteractionCss}</style>\n        {/* 1. Time Travel */}\n        {!hideTimeTravel && hasTimeTravel && (\n            <button\n                className=\"utility-button\"\n                title=\"Open in Mapillary Time Travel\"\n                onClick={() => {\n                    const currentImg = sequenceImages.find(i => i.id === imageId);\n                    if (currentImg) onTimeTravel(currentImg.lat, currentImg.lon, imageId!);\n                }}\n                style={glassStyles.getButtonStyle(true, \"rgba(240, 185, 5, 0.3)\")}\n                onMouseEnter={e => (e.currentTarget.style.transform = \"scale(1.15)\")}\n                onMouseLeave={e => (e.currentTarget.style.transform = \"scale(1.05)\")}\n            >\n                <Icons.TimeTravel style={{ color: \"#FFD700\" }} />\n            </button>\n        )}\n\n        {/* 2. Share */}\n        {!hideShareButton && (\n            <button\n                className=\"utility-button\"\n                title=\"Share current view\"\n                onClick={onShare}\n                style={glassStyles.getButtonStyle(false, \"rgba(255, 255, 255, 0.2)\")}\n                onMouseEnter={e => (e.currentTarget.style.transform = \"scale(1.15)\")}\n                onMouseLeave={e => (e.currentTarget.style.transform = \"scale(1)\")}\n            >\n                <Icons.Share />\n            </button>\n        )}\n\n        {/* 3. Download */}\n        {!hideImageDownload && (\n            <button\n                className=\"utility-button\"\n                title=\"Download current image (High Res)\"\n                onClick={onDownload}\n                style={glassStyles.getButtonStyle(false, \"rgba(255, 255, 255, 0.2)\")}\n                onMouseEnter={e => (e.currentTarget.style.transform = \"scale(1.15)\")}\n                onMouseLeave={e => (e.currentTarget.style.transform = \"scale(1)\")}\n            >\n                {isDownloading ? (\n                    <div style={{\n                        width: \"14px\",\n                        height: \"14px\",\n                        border: \"2px solid #fff\",\n                        borderTopColor: \"transparent\",\n                        borderRadius: \"50%\",\n                        animation: \"spin 1s linear infinite\",\n                    }} />\n                ) : (\n                    <Icons.Download />\n                )}\n            </button>\n        )}\n\n        {/* 4. Sync Heading (3D only) */}\n        {is3D && !hideSyncHeadingButton && (\n            <button\n                className=\"utility-button\"\n                title={syncHeading ? \"Lock Map Rotation (Fixed North)\" : \"Rotate The Map With the Camera\"}\n                onClick={onToggleSyncHeading}\n                style={{\n                    ...glassStyles.getButtonStyle(syncHeading, \"rgba(52, 152, 219, 0.9)\"),\n                    boxShadow: syncHeading ? \"0 0 10px rgba(52, 152, 219, 0.6)\" : \"none\",\n                }}\n                onMouseEnter={e => (e.currentTarget.style.transform = \"scale(1.15)\")}\n                onMouseLeave={e => (e.currentTarget.style.transform = \"scale(1)\")}\n            >\n                {syncHeading ? <Icons.CompassLocked /> : <Icons.CompassUnlocked />}\n            </button>\n        )}\n\n        {/* 5. Center Map */}\n        {!hideCenterMapButton && (\n            <button\n                className=\"utility-button\"\n                title=\"Center map on current frame\"\n                onClick={onCenterMap}\n                style={glassStyles.getButtonStyle(false, \"rgba(255, 255, 255, 0.2)\")}\n                onMouseEnter={e => (e.currentTarget.style.transform = \"scale(1.15)\")}\n                onMouseLeave={e => (e.currentTarget.style.transform = \"scale(1)\")}\n            >\n                <Icons.Crosshair size={16} />\n            </button>\n        )}\n\n        {/* 6. Point Cloud, 3D only, hidden when no sfm_cluster or config hides it */}\n        {is3D && !hidePointCloud && (\n            <div style={{ display: \"flex\", alignItems: \"center\", justifyContent: \"center\", gap: 1, position: \"relative\", pointerEvents: \"auto\" }}>\n            <button\n                className=\"utility-button\"\n                title={\n                    pointCloudLoading\n                        ? \"Cancel point-cloud loading\"\n                        : pointCloudAvailable === false\n                        ? \"No point cloud available for this image\"\n                        : (pointCloudVisible || pointCloudActive)\n                        ? `Point cloud ${pointCloudAutoPaused ? \"PAUSED\" : pointCloudFollowImages ? \"AUTO\" : \"ON\"} \u2014 click to close`\n                        : `Load point cloud (${pointCloudFollowImages ? \"auto-follow\" : \"current image\"})`\n                }\n                onClick={pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive ? undefined : onTogglePointCloud}\n                aria-label={pointCloudLoading ? \"Cancel point-cloud loading\" : (pointCloudVisible || pointCloudActive) ? \"Close point cloud\" : \"Load point cloud\"}\n                aria-pressed={(!!pointCloudVisible || !!pointCloudActive) || !!pointCloudLoading}\n                style={{\n                    ...glassStyles.getButtonStyle(\n                        (!!pointCloudVisible || !!pointCloudActive),\n                        \"rgba(120, 80, 255, 0.45)\"\n                    ),\n                    position: \"relative\",\n                    opacity: pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive ? 0.35 : 1,\n                    cursor: pointCloudAvailable === false && !pointCloudLoading && !pointCloudVisible && !pointCloudActive\n                        ? \"default\"\n                        : \"pointer\",\n                    boxShadow: pointCloudVisible\n                        ? \"0 0 10px rgba(120, 80, 255, 0.5)\"\n                        : \"none\",\n                }}\n                onMouseEnter={e => {\n                    if (!pointCloudLoading && pointCloudAvailable !== false)\n                        e.currentTarget.style.transform = \"scale(1.15)\";\n                }}\n                onMouseLeave={e => {\n                    e.currentTarget.style.transform = pointCloudVisible\n                        ? \"scale(1.1)\"\n                        : \"scale(1)\";\n                }}\n            >\n                {pointCloudLoading ? (\n                    <div style={{\n                        width: \"14px\",\n                        height: \"14px\",\n                        border: \"2px solid rgba(255,255,255,0.3)\",\n                        borderTopColor: \"rgba(120, 80, 255, 0.9)\",\n                        borderRadius: \"50%\",\n                        animation: \"spin 0.8s linear infinite\",\n                    }} />\n                ) : (\n                    <Icons.PointCloud size={16} />\n                )}\n                {(!pointCloudLoading && (pointCloudVisible || pointCloudActive)) && <span aria-hidden=\"true\" style={{ position: \"absolute\", bottom: -3, left: \"50%\", transform: \"translateX(-50%)\", borderRadius: 3, padding: \"1px 3px\", background: pointCloudLoading ? \"#614523\" : \"#315e43\", color: \"white\", fontSize: 6, fontWeight: 700, lineHeight: 1.2, pointerEvents: \"none\" }}>{pointCloudLoading ? \"CANCEL\" : pointCloudAutoPaused ? \"PAUSED\" : pointCloudFollowImages ? \"AUTO\" : \"ON\"}</span>}\n            </button>\n                {pointCloudVisible && <details\n                  className=\"mapillary-point-cloud-mode\"\n                  style={{ position: \"relative\", pointerEvents: \"auto\", flexShrink: 0, width: 12, overflow: \"visible\" }}\n                  onKeyDown={event => { if (event.key === \"Escape\") { event.currentTarget.open = false; event.currentTarget.querySelector(\"summary\")?.focus(); } }}\n                  >\n                  <style>{pointCloudModeCss}</style>\n                  <summary aria-label=\"Choose point-cloud mode\" title={`Point-cloud mode: ${pointCloudFollowImages ? \"Auto-follow\" : \"Current image\"}`} style={{ listStyle: \"none\", display: \"flex\", flexDirection: \"column\", alignItems: \"center\", justifyContent: \"center\", gap: 1, width: 12, minWidth: 12, height: 24, boxSizing: \"border-box\", cursor: \"pointer\", pointerEvents: \"auto\", padding: \"2px\", borderRadius: 5, background: \"rgba(86,62,144,0.9)\", border: \"1px solid rgba(200,184,255,0.6)\", color: \"#fff\", fontSize: 7, fontWeight: 700 }}><svg aria-hidden=\"true\" width=\"10\" height=\"6\" viewBox=\"0 0 10 6\" style={{ display: \"block\", flexShrink: 0 }}><path d=\"M1 1 L5 5 L9 1\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\" /></svg></summary>\n                  <div role=\"group\" aria-label=\"Point-cloud mode\" style={{ position: \"absolute\", bottom: \"calc(100% + 5px)\", right: 0, zIndex: 10003, width: 142, boxSizing: \"border-box\", padding: 5, borderRadius: 6, border: \"1px solid #638974\", background: \"#17241e\", color: \"#e2ece7\", boxShadow: \"0 4px 14px rgba(0,0,0,0.4)\", display: \"flex\", flexDirection: \"column\", gap: 3 }}>\n                    {[{ label: \"Current image\", follow: false }, { label: \"Auto-follow\", follow: true }].map(mode => <button\n                      key={mode.label} type=\"button\" aria-pressed={!!pointCloudFollowImages === mode.follow}\n                      title={mode.follow ? \"Fetch point clouds automatically as you browse images\" : \"Close point cloud when you change images\"}\n                      onClick={event => {\n                        event.stopPropagation();\n                        const menu = event.currentTarget.closest(\"details\"); if (menu) menu.open = false;\n                        if (!!pointCloudFollowImages !== mode.follow) onPointCloudFollowImagesChange?.(mode.follow);\n                      }}\n                      style={{ width: \"100%\", minHeight: 28, boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", gap: 6, padding: \"5px 6px\", borderRadius: 4, border: \"1px solid transparent\", background: !!pointCloudFollowImages === mode.follow ? \"#294e3a\" : \"transparent\", color: \"#e2ece7\", cursor: \"pointer\", fontFamily: \"inherit\", fontSize: 11, fontWeight: 500, lineHeight: 1.3, textAlign: \"left\", whiteSpace: \"nowrap\" }}>\n                      <span aria-hidden=\"true\" style={{ width: 12, flexShrink: 0, pointerEvents: \"none\" }}>{!!pointCloudFollowImages === mode.follow ? \"\u2713\" : \"\"}</span><span style={{ pointerEvents: \"none\" }}>{mode.label}</span>\n                    </button>)}\n                  </div>\n                </details>}\n\n            </div>\n        )}\n        {is3D && !hidePointCloud && pointCloudLoading && <button type=\"button\" aria-label=\"Cancel point-cloud loading\" onClick={onTogglePointCloud} style={{ pointerEvents: \"auto\", position: \"relative\", zIndex: 10001, gridColumn: \"1 / -1\", minHeight: 24, padding: \"3px 5px\", borderRadius: 5, border: \"1px solid rgba(255,255,255,0.35)\", background: \"#493d36\", color: \"white\", cursor: \"pointer\", fontSize: 10, fontWeight: 600 }}>Cancel</button>}\n    </div>\n);\n",
              "after": "/** @jsx jsx */\nimport { React, jsx } from \"jimu-core\";\nimport ReactDOM from \"react-dom\";\nimport { utilityDockCss } from '../styles/controlPanels';\nimport * as Icons from \"./Icons\";\nimport { ImageUtilityGroupProps } from \"./types\";\n\n/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {\n    const [open, setOpen] = React.useState(false);\n    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 180, maxHeight: 220 });\n    const dock = React.useRef<HTMLDivElement>(null);\n    const trigger = React.useRef<HTMLButtonElement>(null);\n    const menu = React.useRef<HTMLDivElement>(null);\n    const menuId = React.useId();\n    const currentImage = props.sequenceImages.find(image => image.id === props.imageId);\n    const cloudOn = !!(props.pointCloudVisible || props.pointCloudActive);\n    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;\n    const cloudMode = props.is3D && !props.hidePointCloud && !!props.pointCloudVisible;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload || cloudMode;\n    const close = (focus = false) => { setOpen(false); if (focus) trigger.current?.focus(); };\n\n    React.useLayoutEffect(() => { setOpen(false); }, [props.imageId, props.is3D]);\n    React.useEffect(() => { if (!hasMore) setOpen(false); }, [hasMore]);\n    React.useLayoutEffect(() => {\n        if (!open || !trigger.current || !menu.current || !dock.current) return;\n        const anchor = trigger.current.getBoundingClientRect();\n        const bounds = dock.current.parentElement?.getBoundingClientRect();\n        const left = Math.max(8, bounds?.left ?? 0), right = Math.min(window.innerWidth - 8, bounds?.right ?? window.innerWidth);\n        const top = Math.max(8, bounds?.top ?? 0), bottom = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);\n        const width = Math.max(0, Math.min(190, right - left));\n        const maxHeight = Math.max(0, Math.min(260, bottom - top));\n        const height = Math.min(menu.current.scrollHeight, maxHeight);\n        const above = anchor.top - top >= height + 6 || anchor.top - top >= bottom - anchor.bottom;\n        setPosition({ width, maxHeight, left: Math.max(left, Math.min(anchor.right - width, right - width)),\n            top: Math.max(top, Math.min(above ? anchor.top - height - 6 : anchor.bottom + 6, bottom - height)) });\n        menu.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();\n    }, [open, props.isDownloading, cloudMode]);\n    React.useEffect(() => {\n        if (!open) return;\n        const outside = (event: Event) => {\n            if (!menu.current?.contains(event.target as Node) && !dock.current?.contains(event.target as Node)) setOpen(false);\n        };\n        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } };\n        const dismiss = () => setOpen(false);\n        const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setOpen(false); };\n        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {\n            if (!trigger.current?.getBoundingClientRect().width) setOpen(false);\n        }) : null;\n        if (dock.current) observer?.observe(dock.current);\n        document.addEventListener('pointerdown', outside);\n        document.addEventListener('focusin', outside);\n        document.addEventListener('keydown', escape, true);\n        document.addEventListener('scroll', scroll, true);\n        document.addEventListener('visibilitychange', dismiss);\n        window.addEventListener('resize', dismiss);\n        return () => {\n            observer?.disconnect();\n            document.removeEventListener('pointerdown', outside);\n            document.removeEventListener('focusin', outside);\n            document.removeEventListener('keydown', escape, true);\n            document.removeEventListener('scroll', scroll, true);\n            document.removeEventListener('visibilitychange', dismiss);\n            window.removeEventListener('resize', dismiss);\n        };\n    }, [open]);\n\n    const cloudLabel = props.pointCloudLoading ? 'Cancel point-cloud loading' : cloudOn ? 'Close point cloud' : cloudBlocked ? 'No point cloud available for this image' : 'Load point cloud';\n    const hasNavigation = !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);\n    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);\n    if (!hasNavigation && !hasSceneTools && !hasMore) return null;\n    return <div ref={dock} className=\"glass-image-utility-panel mly-utility-dock\" role=\"group\" aria-label=\"Image actions\">\n        <style>{utilityDockCss}</style>\n        {!props.hideCenterMapButton && <button type=\"button\" className=\"utility-button\" title=\"Center map on this image\" aria-label=\"Center map on this image\" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}\n        {!props.hideTimeTravel && props.hasTimeTravel && <button type=\"button\" className=\"utility-button\" title=\"Explore images from other dates\" aria-label=\"Time travel\" disabled={!currentImage}\n            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n        {hasNavigation && hasSceneTools && <span className=\"mly-dock-divider\" aria-hidden=\"true\"/>}\n        {props.is3D && !props.hideSyncHeadingButton && <button type=\"button\" className=\"utility-button\" aria-label=\"Follow camera heading\" aria-pressed={props.syncHeading}\n            title={props.syncHeading ? 'Follow camera heading \u00b7 Click to keep north fixed' : 'Follow camera heading'} onClick={props.onToggleSyncHeading}>{props.syncHeading ? <Icons.CompassLocked/> : <Icons.CompassUnlocked/>}</button>}\n        {props.is3D && !props.hidePointCloud && <button type=\"button\" className={`utility-button mly-dock-cloud${props.pointCloudLoading ? ' is-loading' : ''}`}\n            aria-label={cloudLabel} title={props.pointCloudLoading ? cloudLabel : cloudOn ? `Point cloud: ${props.pointCloudAutoPaused ? 'paused' : props.pointCloudFollowImages ? 'auto-follow' : 'current image'} \u00b7 Click to close` : cloudLabel}\n            aria-pressed={cloudOn || !!props.pointCloudLoading} disabled={cloudBlocked} onClick={props.onTogglePointCloud}>\n            {props.pointCloudLoading ? <React.Fragment><span className=\"mly-dock-spinner\" aria-hidden=\"true\"/><span>Cancel</span></React.Fragment>\n                : <React.Fragment><Icons.PointCloud size={16}/>{cloudOn && <span className=\"mly-dock-mode\" aria-hidden=\"true\">{props.pointCloudAutoPaused ? 'Paused' : props.pointCloudFollowImages ? 'Auto' : 'On'}</span>}</React.Fragment>}\n        </button>}\n        {hasMore && <button ref={trigger} type=\"button\" className=\"utility-button\" title=\"More image actions\" aria-label=\"More image actions\" aria-haspopup=\"dialog\" aria-expanded={open} aria-controls={open ? menuId : undefined}\n            onClick={() => setOpen(value => !value)}><svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"currentColor\"><circle cx=\"4\" cy=\"9\" r=\"1.3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\"/><circle cx=\"14\" cy=\"9\" r=\"1.3\"/></svg>{props.isDownloading && <span className=\"mly-dock-download-dot\" aria-hidden=\"true\"/>}</button>}\n        {open && hasMore && ReactDOM.createPortal(<div ref={menu} id={menuId} role=\"dialog\" aria-label=\"More image actions\" className=\"mly-utility-popover\" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>\n            {!props.hideShareButton && <button type=\"button\" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}\n            {!props.hideImageDownload && <button type=\"button\" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image\u2026' : 'Download image'}</span></button>}\n            {cloudMode && <div className=\"mly-dock-mode-options\" role=\"group\" aria-label=\"Point-cloud mode\"><span className=\"mly-dock-menu-label\">Point cloud follows</span>\n                {[{ label: 'Current image', follow: false }, { label: 'As I browse', follow: true }].map(mode => <button key={mode.label} type=\"button\" aria-pressed={!!props.pointCloudFollowImages === mode.follow}\n                    onClick={() => { close(true); if (!!props.pointCloudFollowImages !== mode.follow) props.onPointCloudFollowImagesChange?.(mode.follow); }}><span className=\"mly-dock-choice\" aria-hidden=\"true\">{!!props.pointCloudFollowImages === mode.follow ? '\u2713' : ''}</span>{mode.label}</button>)}\n            </div>}\n        </div>, document.fullscreenElement || document.body)}\n    </div>;\n};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/controlPanels.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/styles/controlPanels.ts block 1",
              "before": "            WebkitBackdropFilter: \"blur(1px)\",\n            borderRadius: \"12px\",\n            boxShadow: \"0 8px 32px 0 rgba(0, 0, 0, 0.30)\",\n        } as const;\n",
              "after": "            WebkitBackdropFilter: \"blur(1px)\",\n            borderRadius: \"12px\",\n            boxShadow: \"0 8px 32px 0 rgba(0, 0, 0, 0.30)\",\n        } as const;\n\n/** Scoped dock rules take precedence over legacy utility grids and fullscreen offsets. */\nexport const utilityDockCss = `\n.glass-image-utility-panel.mly-utility-dock {\n  position: absolute; z-index: 10000; top: auto !important; left: auto !important; right: 56px !important; bottom: 66px !important;\n  display: flex !important; flex-wrap: wrap; align-items: center; justify-content: center; grid-template-columns: none !important;\n  width: max-content; max-width: calc(100% - 100px); box-sizing: border-box;\n  gap: 2px !important; padding: 3px !important; border: 1px solid #95bea044; border-radius: 9px !important;\n  background: rgba(20,40,31,.83) !important; backdrop-filter: blur(8px); box-shadow: 0 3px 12px #0003 !important;\n}\n.glass-image-utility-panel.mly-utility-dock .utility-button {\n  position: relative; flex: 0 0 auto; width: 30px !important; height: 30px !important; box-sizing: border-box; margin: 0;\n  display: flex; align-items: center; justify-content: center; gap: 4px; padding: 0; border: 1px solid transparent; border-radius: 6px;\n  background: transparent; color: #d6e9de; cursor: pointer; touch-action: manipulation;\n  transform: none !important; filter: none !important; box-shadow: none !important; transition: background-color 120ms ease !important;\n}\n.glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 16px !important; height: 16px !important; transform: none !important; pointer-events: none; }\n.glass-image-utility-panel.mly-utility-dock .utility-button[aria-pressed=\"true\"], .glass-image-utility-panel.mly-utility-dock .utility-button[aria-expanded=\"true\"] { background: #39654b; border-color: #8dc4a166; color: #f0fff4; }\n.glass-image-utility-panel.mly-utility-dock .utility-button:disabled { opacity: .35; cursor: default; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud { flex-direction: column; gap: 0; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { flex-direction: row; width: 64px !important; font: 10px \"Segoe UI\",sans-serif; background: #365743; }\n.mly-dock-mode { font: 6px/1 \"Segoe UI\",sans-serif; color: #c9ebd4; }\n.mly-dock-divider { width: 1px; height: 16px; margin: 0 1px; background: #a6cbb533; }\n.mly-dock-download-dot { position: absolute; right: 3px; bottom: 3px; width: 4px; height: 4px; background: #b0e3c1; border-radius: 50%; }\n@keyframes mly-dock-spin { to { transform: rotate(360deg); } }\n.mly-dock-spinner { width: 8px; height: 8px; border: 1px solid #b5d4bd55; border-top-color: #d7f4df; border-radius: 50%; animation: mly-dock-spin 1s linear infinite; }\n.mly-utility-popover { box-sizing: border-box; overflow: auto; overscroll-behavior: contain; padding: 5px; border: 1px solid #648b73; border-radius: 8px; background: #192f24; box-shadow: 0 5px 18px #0005; color: #e1eee5; font-family: \"Segoe UI\",sans-serif; }\n.mly-utility-popover button { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px; margin: 0; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }\n.mly-utility-popover button:disabled { opacity: .5; cursor: default; }\n.mly-utility-popover button[aria-pressed=\"true\"] { color: #bcf0cd; background: #31543d; }\n.mly-dock-mode-options { margin-top: 4px; padding-top: 5px; border-top: 1px solid #ffffff16; }\n.mly-dock-menu-label { display: block; padding: 3px 7px; font-size: 10px; color: #9fbaa9; }\n.mly-dock-choice { width: 15px; flex-shrink: 0; }\n.mly-utility-popover button:focus-visible, .mly-utility-dock button:focus-visible { outline: 2px solid #c5f6d6; outline-offset: -2px; }\n@media (hover:hover) { .glass-image-utility-panel.mly-utility-dock .utility-button:enabled:hover, .mly-utility-popover button:enabled:hover { background: #7db18d33; } }\n@media (max-width: 768px), (pointer: coarse) {\n  .glass-image-utility-panel.mly-utility-dock { left: 44px !important; right: auto !important; bottom: calc(66px + env(safe-area-inset-bottom,0px)) !important; }\n}\n@container (max-width: 480px) {\n  .glass-image-utility-panel.mly-utility-dock { left: 44px !important; right: auto !important; }\n}\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'utility-action-dock-v6-26-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.26 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'utility-action-dock-v6-26' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.26 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.26 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.26 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-utility-action-dock-v6-26.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Utility action dock v6.26 is already installed. No files changed.');
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
  const manifest = { installer: 'utility-action-dock-v6-26', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Utility action dock v6.26 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
