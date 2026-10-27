#!/usr/bin/env node
'use strict';
/**
 * Utility mobile and modes v6.27. Compatible current v6 sources.
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
              "before": "import { ImageUtilityGroupProps } from \"./types\";\n\n/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {\n    const [open, setOpen] = React.useState(false);\n    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 180, maxHeight: 220 });\n    const dock = React.useRef<HTMLDivElement>(null);\n    const trigger = React.useRef<HTMLButtonElement>(null);\n    const menu = React.useRef<HTMLDivElement>(null);\n    const menuId = React.useId();\n    const currentImage = props.sequenceImages.find(image => image.id === props.imageId);\n    const cloudOn = !!(props.pointCloudVisible || props.pointCloudActive);\n    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;\n    const cloudMode = props.is3D && !props.hidePointCloud && !!props.pointCloudVisible;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload || cloudMode;\n    const close = (focus = false) => { setOpen(false); if (focus) trigger.current?.focus(); };\n\n    React.useLayoutEffect(() => { setOpen(false); }, [props.imageId, props.is3D]);\n    React.useEffect(() => { if (!hasMore) setOpen(false); }, [hasMore]);\n    React.useLayoutEffect(() => {\n        if (!open || !trigger.current || !menu.current || !dock.current) return;\n        const anchor = trigger.current.getBoundingClientRect();\n        const bounds = dock.current.parentElement?.getBoundingClientRect();\n",
              "after": "import { ImageUtilityGroupProps } from \"./types\";\n\n/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */\nexport const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {\n    const [open, setOpen] = React.useState<\"more\" | \"cloud\" | null>(null);\n    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 180, maxHeight: 220 });\n    const dock = React.useRef<HTMLDivElement>(null);\n    const trigger = React.useRef<HTMLButtonElement>(null);\n    const menu = React.useRef<HTMLDivElement>(null);\n    const menuId = React.useId();\n    const currentImage = props.sequenceImages.find(image => image.id === props.imageId);\n    const cloudOn = !!(props.pointCloudVisible || props.pointCloudActive);\n    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;\n    const cloudMode = props.is3D && !props.hidePointCloud;\n    const hasMore = !props.hideShareButton || !props.hideImageDownload;\n    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };\n\n    React.useLayoutEffect(() => { setOpen(null); }, [props.imageId, props.is3D]);\n    React.useEffect(() => { if ((open === \"more\" && !hasMore) || (open === \"cloud\" && !cloudMode)) setOpen(null); }, [open, hasMore, cloudMode]);\n    React.useLayoutEffect(() => {\n        if (!open || !trigger.current || !menu.current || !dock.current) return;\n        const anchor = trigger.current.getBoundingClientRect();\n        const bounds = dock.current.parentElement?.getBoundingClientRect();\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 2",
              "before": "    }, [open, props.isDownloading, cloudMode]);\n    React.useEffect(() => {\n        if (!open) return;\n        const outside = (event: Event) => {\n            if (!menu.current?.contains(event.target as Node) && !dock.current?.contains(event.target as Node)) setOpen(false);\n        };\n        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); } };\n        const dismiss = () => setOpen(false);\n        const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setOpen(false); };\n        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {\n            if (!trigger.current?.getBoundingClientRect().width) setOpen(false);\n        }) : null;\n        if (dock.current) observer?.observe(dock.current);\n        document.addEventListener('pointerdown', outside);\n        document.addEventListener('focusin', outside);\n",
              "after": "    }, [open, props.isDownloading, cloudMode]);\n    React.useEffect(() => {\n        if (!open) return;\n        const outside = (event: Event) => {\n            if (!menu.current?.contains(event.target as Node) && !dock.current?.contains(event.target as Node)) setOpen(null);\n        };\n        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(null); trigger.current?.focus(); } };\n        const dismiss = () => setOpen(null);\n        const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setOpen(null); };\n        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {\n            if (!trigger.current?.getBoundingClientRect().width) setOpen(null);\n        }) : null;\n        if (dock.current) observer?.observe(dock.current);\n        document.addEventListener('pointerdown', outside);\n        document.addEventListener('focusin', outside);\n"
            },
            {
              "label": "src/components/ImageUtilityGroup.tsx block 3",
              "before": "            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n        {hasNavigation && hasSceneTools && <span className=\"mly-dock-divider\" aria-hidden=\"true\"/>}\n        {props.is3D && !props.hideSyncHeadingButton && <button type=\"button\" className=\"utility-button\" aria-label=\"Follow camera heading\" aria-pressed={props.syncHeading}\n            title={props.syncHeading ? 'Follow camera heading \u00b7 Click to keep north fixed' : 'Follow camera heading'} onClick={props.onToggleSyncHeading}>{props.syncHeading ? <Icons.CompassLocked/> : <Icons.CompassUnlocked/>}</button>}\n        {props.is3D && !props.hidePointCloud && <button type=\"button\" className={`utility-button mly-dock-cloud${props.pointCloudLoading ? ' is-loading' : ''}`}\n            aria-label={cloudLabel} title={props.pointCloudLoading ? cloudLabel : cloudOn ? `Point cloud: ${props.pointCloudAutoPaused ? 'paused' : props.pointCloudFollowImages ? 'auto-follow' : 'current image'} \u00b7 Click to close` : cloudLabel}\n            aria-pressed={cloudOn || !!props.pointCloudLoading} disabled={cloudBlocked} onClick={props.onTogglePointCloud}>\n            {props.pointCloudLoading ? <React.Fragment><span className=\"mly-dock-spinner\" aria-hidden=\"true\"/><span>Cancel</span></React.Fragment>\n                : <React.Fragment><Icons.PointCloud size={16}/>{cloudOn && <span className=\"mly-dock-mode\" aria-hidden=\"true\">{props.pointCloudAutoPaused ? 'Paused' : props.pointCloudFollowImages ? 'Auto' : 'On'}</span>}</React.Fragment>}\n        </button>}\n        {hasMore && <button ref={trigger} type=\"button\" className=\"utility-button\" title=\"More image actions\" aria-label=\"More image actions\" aria-haspopup=\"dialog\" aria-expanded={open} aria-controls={open ? menuId : undefined}\n            onClick={() => setOpen(value => !value)}><svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"currentColor\"><circle cx=\"4\" cy=\"9\" r=\"1.3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\"/><circle cx=\"14\" cy=\"9\" r=\"1.3\"/></svg>{props.isDownloading && <span className=\"mly-dock-download-dot\" aria-hidden=\"true\"/>}</button>}\n        {open && hasMore && ReactDOM.createPortal(<div ref={menu} id={menuId} role=\"dialog\" aria-label=\"More image actions\" className=\"mly-utility-popover\" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>\n            {!props.hideShareButton && <button type=\"button\" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}\n            {!props.hideImageDownload && <button type=\"button\" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image\u2026' : 'Download image'}</span></button>}\n            {cloudMode && <div className=\"mly-dock-mode-options\" role=\"group\" aria-label=\"Point-cloud mode\"><span className=\"mly-dock-menu-label\">Point cloud follows</span>\n                {[{ label: 'Current image', follow: false }, { label: 'As I browse', follow: true }].map(mode => <button key={mode.label} type=\"button\" aria-pressed={!!props.pointCloudFollowImages === mode.follow}\n                    onClick={() => { close(true); if (!!props.pointCloudFollowImages !== mode.follow) props.onPointCloudFollowImagesChange?.(mode.follow); }}><span className=\"mly-dock-choice\" aria-hidden=\"true\">{!!props.pointCloudFollowImages === mode.follow ? '\u2713' : ''}</span>{mode.label}</button>)}\n            </div>}\n        </div>, document.fullscreenElement || document.body)}\n    </div>;\n};\n",
              "after": "            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}\n        {hasNavigation && hasSceneTools && <span className=\"mly-dock-divider\" aria-hidden=\"true\"/>}\n        {props.is3D && !props.hideSyncHeadingButton && <button type=\"button\" className=\"utility-button\" aria-label=\"Follow camera heading\" aria-pressed={props.syncHeading}\n            title={props.syncHeading ? 'Follow camera heading \u00b7 Click to keep north fixed' : 'Follow camera heading'} onClick={props.onToggleSyncHeading}>{props.syncHeading ? <Icons.CompassLocked/> : <Icons.CompassUnlocked/>}</button>}\n        {props.is3D && !props.hidePointCloud && <div className=\"mly-dock-cloud-group\" role=\"group\" aria-label=\"Point cloud controls\"><button type=\"button\" className={`utility-button mly-dock-cloud${props.pointCloudLoading ? ' is-loading' : ''}`}\n            aria-label={cloudLabel} title={props.pointCloudLoading ? cloudLabel : cloudOn ? `Point cloud: ${props.pointCloudAutoPaused ? 'paused' : props.pointCloudFollowImages ? 'auto-follow' : 'current image'} \u00b7 Click to close` : cloudLabel}\n            aria-pressed={cloudOn || !!props.pointCloudLoading} disabled={cloudBlocked} onClick={props.onTogglePointCloud}>\n            {props.pointCloudLoading ? <React.Fragment><span className=\"mly-dock-spinner\" aria-hidden=\"true\"/><span>Cancel</span></React.Fragment>\n                : <React.Fragment><Icons.PointCloud size={16}/><span className=\"mly-dock-mode\" aria-hidden=\"true\">{props.pointCloudAutoPaused ? 'Paused' : props.pointCloudFollowImages ? 'Auto' : 'Image'}</span></React.Fragment>}\n        </button>\n        <button type=\"button\" className=\"utility-button mly-dock-mode-trigger\" aria-label=\"Choose point-cloud mode\"\n            title={`Point-cloud mode: ${props.pointCloudFollowImages ? 'Follow images' : 'Current image'}`}\n            aria-haspopup=\"dialog\" aria-expanded={open === 'cloud'} aria-controls={open === 'cloud' ? menuId : undefined}\n            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === 'cloud' ? null : 'cloud'); }}>\n            <svg aria-hidden=\"true\" width=\"10\" height=\"10\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\"><path d=\"m3 4 3 3 3-3\"/></svg>\n        </button></div>}\n        {hasMore && <button type=\"button\" className=\"utility-button\" title=\"More image actions\" aria-label=\"More image actions\" aria-haspopup=\"dialog\" aria-expanded={open === \"more\"} aria-controls={open === \"more\" ? menuId : undefined}\n            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === \"more\" ? null : \"more\"); }}><svg aria-hidden=\"true\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"currentColor\"><circle cx=\"4\" cy=\"9\" r=\"1.3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\"/><circle cx=\"14\" cy=\"9\" r=\"1.3\"/></svg>{props.isDownloading && <span className=\"mly-dock-download-dot\" aria-hidden=\"true\"/>}</button>}\n        {open && ((open === \"more\" && hasMore) || (open === \"cloud\" && cloudMode)) && ReactDOM.createPortal(<div ref={menu} id={menuId} role=\"dialog\" aria-label={open === \"cloud\" ? \"Point-cloud mode\" : \"More image actions\"} className=\"mly-utility-popover\" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>\n            {open === \"more\" && !props.hideShareButton && <button type=\"button\" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}\n            {open === \"more\" && !props.hideImageDownload && <button type=\"button\" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image\u2026' : 'Download image'}</span></button>}\n            {open === \"cloud\" && <div role=\"group\" aria-label=\"Point-cloud mode options\"><span className=\"mly-dock-menu-label\">Point-cloud mode</span>\n                {[{ label: 'Current image', detail: 'Close when you change images.', follow: false }, { label: 'Follow images', detail: 'Load clouds as you browse.', follow: true }].map(mode => <button key={mode.label} type=\"button\" aria-label={mode.label} aria-describedby={`${menuId}-${mode.follow ? \"follow\" : \"current\"}`} aria-pressed={!!props.pointCloudFollowImages === mode.follow}\n                    onClick={() => { close(true); if (!!props.pointCloudFollowImages !== mode.follow) props.onPointCloudFollowImagesChange?.(mode.follow); }}><span className=\"mly-dock-choice\" aria-hidden=\"true\">{!!props.pointCloudFollowImages === mode.follow ? '\u2713' : ''}</span><span className=\"mly-dock-option-copy\"><span>{mode.label}</span><small id={`${menuId}-${mode.follow ? \"follow\" : \"current\"}`}>{mode.detail}</small></span></button>)}\n            </div>}\n        </div>, document.fullscreenElement || document.body)}\n    </div>;\n};\n"
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
              "before": ".glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 16px !important; height: 16px !important; transform: none !important; pointer-events: none; }\n.glass-image-utility-panel.mly-utility-dock .utility-button[aria-pressed=\"true\"], .glass-image-utility-panel.mly-utility-dock .utility-button[aria-expanded=\"true\"] { background: #39654b; border-color: #8dc4a166; color: #f0fff4; }\n.glass-image-utility-panel.mly-utility-dock .utility-button:disabled { opacity: .35; cursor: default; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud { flex-direction: column; gap: 0; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { flex-direction: row; width: 64px !important; font: 10px \"Segoe UI\",sans-serif; background: #365743; }\n.mly-dock-mode { font: 6px/1 \"Segoe UI\",sans-serif; color: #c9ebd4; }\n.mly-dock-divider { width: 1px; height: 16px; margin: 0 1px; background: #a6cbb533; }\n.mly-dock-download-dot { position: absolute; right: 3px; bottom: 3px; width: 4px; height: 4px; background: #b0e3c1; border-radius: 50%; }\n@keyframes mly-dock-spin { to { transform: rotate(360deg); } }\n.mly-dock-spinner { width: 8px; height: 8px; border: 1px solid #b5d4bd55; border-top-color: #d7f4df; border-radius: 50%; animation: mly-dock-spin 1s linear infinite; }\n.mly-utility-popover { box-sizing: border-box; overflow: auto; overscroll-behavior: contain; padding: 5px; border: 1px solid #648b73; border-radius: 8px; background: #192f24; box-shadow: 0 5px 18px #0005; color: #e1eee5; font-family: \"Segoe UI\",sans-serif; }\n.mly-utility-popover button { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px; margin: 0; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }\n.mly-utility-popover button:disabled { opacity: .5; cursor: default; }\n.mly-utility-popover button[aria-pressed=\"true\"] { color: #bcf0cd; background: #31543d; }\n",
              "after": ".glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 16px !important; height: 16px !important; transform: none !important; pointer-events: none; }\n.glass-image-utility-panel.mly-utility-dock .utility-button[aria-pressed=\"true\"], .glass-image-utility-panel.mly-utility-dock .utility-button[aria-expanded=\"true\"] { background: #39654b; border-color: #8dc4a166; color: #f0fff4; }\n.glass-image-utility-panel.mly-utility-dock .utility-button:disabled { opacity: .35; cursor: default; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud { flex-direction: column; gap: 0; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { flex-direction: row; gap: 6px; width: 70px !important; font: 10px \"Segoe UI\",sans-serif; background: #365743; }\n.mly-dock-mode { font: 6px/1 \"Segoe UI\",sans-serif; color: #c9ebd4; }\n.mly-dock-divider { width: 1px; height: 16px; margin: 0 1px; background: #a6cbb533; }\n.mly-dock-download-dot { position: absolute; right: 3px; bottom: 3px; width: 4px; height: 4px; background: #b0e3c1; border-radius: 50%; }\n@keyframes mly-dock-spin { to { transform: rotate(360deg); } }\n.mly-dock-spinner { flex: 0 0 8px; width: 8px; height: 8px; border: 1px solid #b5d4bd55; border-top-color: #d7f4df; border-radius: 50%; animation: mly-dock-spin 1s linear infinite; }\n.mly-utility-popover { box-sizing: border-box; overflow: auto; overscroll-behavior: contain; padding: 5px; border: 1px solid #648b73; border-radius: 8px; background: #192f24; box-shadow: 0 5px 18px #0005; color: #e1eee5; font-family: \"Segoe UI\",sans-serif; }\n.mly-utility-popover button { width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px; margin: 0; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; font-size: 12px; text-align: left; cursor: pointer; }\n.mly-utility-popover button:disabled { opacity: .5; cursor: default; }\n.mly-utility-popover button[aria-pressed=\"true\"] { color: #bcf0cd; background: #31543d; }\n"
            },
            {
              "label": "src/styles/controlPanels.ts block 2",
              "before": ".mly-dock-menu-label { display: block; padding: 3px 7px; font-size: 10px; color: #9fbaa9; }\n.mly-dock-choice { width: 15px; flex-shrink: 0; }\n.mly-utility-popover button:focus-visible, .mly-utility-dock button:focus-visible { outline: 2px solid #c5f6d6; outline-offset: -2px; }\n@media (hover:hover) { .glass-image-utility-panel.mly-utility-dock .utility-button:enabled:hover, .mly-utility-popover button:enabled:hover { background: #7db18d33; } }\n@media (max-width: 768px), (pointer: coarse) {\n  .glass-image-utility-panel.mly-utility-dock { left: 44px !important; right: auto !important; bottom: calc(66px + env(safe-area-inset-bottom,0px)) !important; }\n}\n@container (max-width: 480px) {\n  .glass-image-utility-panel.mly-utility-dock { left: 44px !important; right: auto !important; }\n}\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n",
              "after": ".mly-dock-menu-label { display: block; padding: 3px 7px; font-size: 10px; color: #9fbaa9; }\n.mly-dock-choice { width: 15px; flex-shrink: 0; }\n.mly-utility-popover button:focus-visible, .mly-utility-dock button:focus-visible { outline: 2px solid #c5f6d6; outline-offset: -2px; }\n@media (hover:hover) { .glass-image-utility-panel.mly-utility-dock .utility-button:enabled:hover, .mly-utility-popover button:enabled:hover { background: #7db18d33; } }\n.mly-dock-cloud-group { display: flex; align-items: center; gap: 0; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; border-left: 1px solid #a6cbb533; }\n.glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger svg { width: 10px !important; height: 10px !important; }\n.mly-dock-option-copy { display: flex; flex-direction: column; gap: 3px; }\n.mly-dock-option-copy small { font-size: 10px; line-height: 1.3; color: #a9c1b2; }\n@media (max-width: 768px), (pointer: coarse) {\n  .glass-image-utility-panel.mly-utility-dock { display: grid !important; grid-template-columns: repeat(2,max-content) !important; top: auto !important; left: auto !important; right: 56px !important; bottom: 22px !important; }\n  .glass-image-utility-panel.mly-utility-dock .utility-button { width: 24px !important; height: 24px !important; }\n  .glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 14px !important; height: 14px !important; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-divider { display: none; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { width: 70px !important; }\n}\n@container (max-width: 480px) {\n  .glass-image-utility-panel.mly-utility-dock { display: grid !important; grid-template-columns: repeat(2,max-content) !important; top: auto !important; left: auto !important; right: 56px !important; bottom: 22px !important; }\n  .glass-image-utility-panel.mly-utility-dock .utility-button { width: 24px !important; height: 24px !important; }\n  .glass-image-utility-panel.mly-utility-dock .utility-button svg { width: 14px !important; height: 14px !important; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-divider { display: none; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-mode-trigger { width: 18px !important; }\n  .glass-image-utility-panel.mly-utility-dock .mly-dock-cloud.is-loading { width: 70px !important; }\n}\n/* Retain the original fullscreen mobile location below the minimap. */\n@media (max-width: 768px) {\n  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(178px + env(safe-area-inset-top,0px)) !important; left: calc(8px + env(safe-area-inset-left,0px)) !important; right: auto !important; bottom: auto !important; }\n}\n@media (max-width: 768px) and (max-height: 440px) {\n  .mly-fullscreen-viewer:not(.mly-minimap-expanded) .glass-image-utility-panel.mly-utility-dock { top: calc(78px + env(safe-area-inset-top,0px)) !important; left: calc(114px + env(safe-area-inset-left,0px)) !important; }\n}\n@media (prefers-reduced-motion: reduce) { .mly-dock-spinner { animation: none; } .glass-image-utility-panel.mly-utility-dock .utility-button { transition: none !important; } }\n`;\n"
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
const prefix = 'utility-mobile-modes-v6-27-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.27 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'utility-mobile-modes-v6-27' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.27 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.27 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.27 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-utility-mobile-modes-v6-27.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Utility mobile and modes v6.27 is already installed. No files changed.');
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
  const manifest = { installer: 'utility-mobile-modes-v6-27', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Utility mobile and modes v6.27 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
