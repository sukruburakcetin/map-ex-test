/** @jsx jsx */
import { React, jsx } from "jimu-core";
import ReactDOM from "react-dom";
import { utilityDockCss } from '../styles/controlPanels';
import * as Icons from "./Icons";
import { ImageUtilityGroupProps } from "./types";

/** Compact viewer actions. SDK work remains in the supplied runtime callbacks. */
export const ImageUtilityGroup: React.FC<ImageUtilityGroupProps> = props => {
    const [open, setOpen] = React.useState<"more" | "cloud" | null>(null);
    const [collapsed, setCollapsed] = React.useState(() => {
        try { return sessionStorage.getItem('mly-utility-collapsed-v1') === '1'; } catch { return false; }
    });
    const [mobile, setMobile] = React.useState(false);
    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 148, maxHeight: 210 });
    const dock = React.useRef<HTMLDivElement>(null);
    const trigger = React.useRef<HTMLButtonElement>(null);
    const menu = React.useRef<HTMLDivElement>(null);
    const menuId = React.useId();
    const currentImage = props.sequenceImages.find(image => image.id === props.imageId);
    const cloudOn = !!(props.pointCloudVisible || props.pointCloudActive);
    const cloudBlocked = props.pointCloudAvailable === false && !props.pointCloudLoading && !cloudOn;
    const cloudMode = props.is3D && !props.hidePointCloud;
    const hasMore = !props.hideShareButton || !props.hideImageDownload;
    const close = (focus = false) => { setOpen(null); if (focus) trigger.current?.focus(); };
    const hasNavigation = !props.hideCenterMapButton || (!props.hideTimeTravel && props.hasTimeTravel);
    const hasSceneTools = props.is3D && (!props.hideSyncHeadingButton || !props.hidePointCloud);
    const toolsActive = (props.is3D && !props.hidePointCloud && cloudOn) || (props.is3D && !props.hideSyncHeadingButton && props.syncHeading);
    React.useLayoutEffect(() => {
        const host = dock.current?.parentElement;
        if (!host) return;
        const update = () => {
            const width = host.getBoundingClientRect().width;
            setMobile(window.matchMedia('(max-width: 480px)').matches || (width > 0 && width <= 480));
        };
        update();
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
        observer?.observe(host);
        window.addEventListener('resize', update);
        return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
    }, [hasNavigation, hasSceneTools, hasMore]);
    React.useLayoutEffect(() => { if (mobile && collapsed) setOpen(null); }, [mobile, collapsed]);


    React.useLayoutEffect(() => { setOpen(null); }, [props.imageId, props.is3D]);
    React.useEffect(() => { if ((open === "more" && !hasMore) || (open === "cloud" && !cloudMode)) setOpen(null); }, [open, hasMore, cloudMode]);
    React.useLayoutEffect(() => {
        if (!open || !trigger.current || !menu.current || !dock.current) return;
        const anchor = trigger.current.getBoundingClientRect();
        const bounds = dock.current.parentElement?.getBoundingClientRect();
        const left = Math.max(8, bounds?.left ?? 0), right = Math.min(window.innerWidth - 8, bounds?.right ?? window.innerWidth);
        const top = Math.max(8, bounds?.top ?? 0), bottom = Math.min(window.innerHeight - 8, bounds?.bottom ?? window.innerHeight);
        const width = Math.max(0, Math.min(open === "cloud" ? 148 : 156, right - left));
        const dockBounds = dock.current.getBoundingClientRect();
        const aboveSpace = Math.max(0, dockBounds.top - top - 6), belowSpace = Math.max(0, bottom - dockBounds.bottom - 6);
        const maxHeight = Math.max(0, Math.min(260, bottom - top, Math.max(40, aboveSpace, belowSpace)));
        const height = Math.min(menu.current.scrollHeight + 2, maxHeight);
        const above = aboveSpace >= height || aboveSpace >= belowSpace;
        setPosition({ width, maxHeight, left: Math.max(left, Math.min(anchor.right - width, right - width)),
            top: Math.max(top, Math.min(above ? dockBounds.top - height - 6 : dockBounds.bottom + 6, bottom - height)) });
        menu.current.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    }, [open, props.isDownloading, cloudMode]);
    React.useEffect(() => {
        if (!open) return;
        const outside = (event: Event) => {
            if (!menu.current?.contains(event.target as Node) && !dock.current?.contains(event.target as Node)) setOpen(null);
        };
        const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(null); trigger.current?.focus(); } };
        const dismiss = () => setOpen(null);
        const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) setOpen(null); };
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => {
            if (!trigger.current?.getBoundingClientRect().width) setOpen(null);
        }) : null;
        if (dock.current) observer?.observe(dock.current);
        document.addEventListener('pointerdown', outside);
        document.addEventListener('focusin', outside);
        document.addEventListener('keydown', escape, true);
        document.addEventListener('scroll', scroll, true);
        document.addEventListener('visibilitychange', dismiss);
        window.addEventListener('resize', dismiss);
        return () => {
            observer?.disconnect();
            document.removeEventListener('pointerdown', outside);
            document.removeEventListener('focusin', outside);
            document.removeEventListener('keydown', escape, true);
            document.removeEventListener('scroll', scroll, true);
            document.removeEventListener('visibilitychange', dismiss);
            window.removeEventListener('resize', dismiss);
        };
    }, [open]);

    const cloudLabel = props.pointCloudLoading ? 'Cancel point-cloud loading' : cloudOn ? 'Close point cloud' : cloudBlocked ? 'No point cloud available for this image' : 'Load point cloud';
    if (!hasNavigation && !hasSceneTools && !hasMore) return null;
    return <div ref={dock} className={`glass-image-utility-panel mly-utility-dock${mobile && collapsed ? ' is-collapsed' : ''}`} data-mobile={mobile ? 'true' : undefined} role="group" aria-label="Image actions">
        <style>{utilityDockCss}</style>
        {!props.hideCenterMapButton && <button type="button" className="utility-button" title="Center map on this image" aria-label="Center map on this image" onClick={props.onCenterMap}><Icons.Crosshair size={16}/></button>}
        {!props.hideTimeTravel && props.hasTimeTravel && <button type="button" className="utility-button" title="Explore images from other dates" aria-label="Time travel" disabled={!currentImage}
            onClick={() => { if (currentImage && props.imageId) props.onTimeTravel(currentImage.lat, currentImage.lon, props.imageId); }}><Icons.TimeTravel size={16}/></button>}
        {hasNavigation && hasSceneTools && <span className="mly-dock-divider" aria-hidden="true"/>}
        {props.is3D && !props.hideSyncHeadingButton && <button type="button" className="utility-button" aria-label="Follow camera heading" aria-pressed={props.syncHeading}
            title={props.syncHeading ? 'Follow camera heading · Click to keep north fixed' : 'Follow camera heading'} onClick={props.onToggleSyncHeading}>{props.syncHeading ? <Icons.CompassLocked/> : <Icons.CompassUnlocked/>}</button>}
        {props.is3D && !props.hidePointCloud && <div className="mly-dock-cloud-group" role="group" aria-label="Point cloud controls"><button type="button" className={`utility-button mly-dock-cloud${props.pointCloudLoading ? ' is-loading' : ''}`}
            aria-label={cloudLabel} title={props.pointCloudLoading ? cloudLabel : cloudOn ? `Point cloud: ${props.pointCloudAutoPaused ? 'paused' : props.pointCloudFollowImages ? 'auto-follow' : 'current image'} · Click to close` : cloudLabel}
            aria-pressed={cloudOn || !!props.pointCloudLoading} disabled={cloudBlocked} onClick={props.onTogglePointCloud}>
            {props.pointCloudLoading ? <React.Fragment><span className="mly-dock-spinner" aria-hidden="true"/><span>Cancel</span></React.Fragment>
                : <React.Fragment><Icons.PointCloud size={16}/><span className="mly-dock-mode" aria-hidden="true">{props.pointCloudAutoPaused ? 'Paused' : props.pointCloudFollowImages ? 'Auto' : 'Image'}</span></React.Fragment>}
        </button>
        <button type="button" className="utility-button mly-dock-mode-trigger" aria-label="Choose point-cloud mode"
            title={`Point-cloud mode: ${props.pointCloudFollowImages ? 'Follow images' : 'Current image'}`}
            aria-haspopup="dialog" aria-expanded={open === 'cloud'} aria-controls={open === 'cloud' ? menuId : undefined}
            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === 'cloud' ? null : 'cloud'); }}>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 4 3 3 3-3"/></svg>
        </button></div>}
        {hasMore && <button type="button" className="utility-button" title="More image actions" aria-label="More image actions" aria-haspopup="dialog" aria-expanded={open === "more"} aria-controls={open === "more" ? menuId : undefined}
            onClick={event => { trigger.current = event.currentTarget; setOpen(value => value === "more" ? null : "more"); }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><circle cx="4" cy="9" r="1.3"/><circle cx="9" cy="9" r="1.3"/><circle cx="14" cy="9" r="1.3"/></svg>{props.isDownloading && <span className="mly-dock-download-dot" aria-hidden="true"/>}</button>}
        {mobile && <button type="button" className="utility-button mly-dock-collapse" aria-label={collapsed ? (toolsActive ? 'Show image tools (tools active)' : 'Show image tools') : 'Hide image tools'}
            title={collapsed ? 'Show image tools' : 'Hide image tools'} aria-expanded={!collapsed}
            onClick={() => { const next = !collapsed; setOpen(null); setCollapsed(next); try { sessionStorage.setItem('mly-utility-collapsed-v1', next ? '1' : '0'); } catch { /* Storage may be unavailable in embedded browsers. */ } }}>
            <svg aria-hidden="true" width="18" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                {collapsed ? <React.Fragment><path d="M2 4h12M2 9h12M2 14h12M5 2v4M11 7v4M6 12v4"/><path d="m21 5-4 4 4 4"/></React.Fragment> : <path d="m9 4 5 5-5 5"/>}
            </svg>
            {collapsed && toolsActive && <span className="mly-dock-collapsed-active" aria-hidden="true"/>}
        </button>}
        {open && ((open === "more" && hasMore) || (open === "cloud" && cloudMode)) && ReactDOM.createPortal(<div ref={menu} id={menuId} role="dialog" aria-label={open === "cloud" ? "Point-cloud mode" : "More image actions"} className="mly-utility-popover" style={{ ...position, position: 'fixed', zIndex: 2147483000 }}>
            {open === "more" && !props.hideShareButton && <button type="button" onClick={() => { close(true); props.onShare(); }}><Icons.Share size={15}/><span>Share view</span></button>}
            {open === "more" && !props.hideImageDownload && <button type="button" disabled={props.isDownloading} onClick={() => { close(true); props.onDownload(); }}><Icons.Download size={15}/><span>{props.isDownloading ? 'Downloading image…' : 'Download image'}</span></button>}
            {open === "cloud" && <div role="group" aria-label="Point-cloud mode options"><span className="mly-dock-menu-label">Point-cloud mode</span>
                {[{ label: 'Current image', detail: 'Selected image only', follow: false }, { label: 'Follow images', detail: 'Update as you browse', follow: true }].map(mode => <button key={mode.label} type="button" aria-label={mode.label} aria-describedby={`${menuId}-${mode.follow ? "follow" : "current"}`} aria-pressed={!!props.pointCloudFollowImages === mode.follow}
                    onClick={() => { close(true); if (!!props.pointCloudFollowImages !== mode.follow) props.onPointCloudFollowImagesChange?.(mode.follow); }}><span className="mly-dock-choice" aria-hidden="true">{!!props.pointCloudFollowImages === mode.follow ? '✓' : ''}</span><span className="mly-dock-option-copy"><span>{mode.label}</span><small id={`${menuId}-${mode.follow ? "follow" : "current"}`}>{mode.detail}</small></span></button>)}
            </div>}
        </div>, document.fullscreenElement || document.body)}
    </div>;
};
