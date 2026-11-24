/** Widget-wide styles and compatibility rules for the Experience Builder host. */
export const overrideStyles = `

    .mobile-panel-content-header { height: 30px !important; }
    .expand-mobile-panel-touch-container { height: 30px !important; }
    .expand-mobile-panel[style*="height: 150px"] { height: 280px !important; }

    /* MAPILLARY-JS OVERRIDES */
    .mapillary-js .DirectionsPerspective {
        z-index: 1 !important;
    }
    .mapillary-js .DirectionsPerspectiveArrow {
        filter: drop-shadow(0px 0px 2px rgba(0,0,0,0.8)) !important;
    }
    .mapillary-js .DirectionsPerspectiveContainer {
        bottom: 10px !important;
    }

    /* Z-INDEX STACKING FIXES */
    .legend-container { display: flex !important; }
    .glass-scroll-container::-webkit-scrollbar { display: none; }
    .glass-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }

    /* RESPONSIVE SCALING FOR VIEWER CONTROLS */
    .widget-mapillary.jimu-widget .mapillary-sequence-playback,
    .widget-mapillary.jimu-widget .mapillary-sequence-timeline {
        --scale: clamp(0.5, 100cqw / 850, 0.9);
        transform: translateX(-50%) scale(var(--scale)) !important;
        transform-origin: top center !important;
        transition: transform 0.15s ease-out;
    }

    /* CONTAINER QUERIES: RESPONSIVE SIZING BASED ON WIDGET WIDTH */
    @container (max-width: 599px) {
        .widget-mapillary.jimu-widget .mapillary-sequence-playback,
        .widget-mapillary.jimu-widget .mapillary-sequence-timeline {
            transform: translateX(-50%) scale(0.5) !important;
        }
    }

    @container (min-width: 600px) {
        .widget-mapillary.jimu-widget .mapillary-sequence-playback,
        .widget-mapillary.jimu-widget .mapillary-sequence-timeline {
            transform: translateX(-50%) scale(0.75) !important;
        }
    }
    /* Elevation Profiles: reserve space for the SDK loading indicator above the chart.
       Let content determine the panel height so the added space does not shrink the plot. */
    .esri-elevation-profile{
        margin-bottom: 75px !important;
        padding-top: 24px !important;
        height: auto !important;
        box-sizing: border-box;
    }

    .esri-elevation-profile.esri-component.esri-widget--panel{ max-width: 50% !important; }

    /* MINI BUTTONS FOR SMALL WIDGETS */
    @container (max-width: 350px) {
        .unified-control-buttons-mapped, .unified-control-buttons { width: 24px !important; height: 24px !important; }
        .unified-control-buttons-filters { width: 20px !important; height: 20px !important; }
        .unified-control-buttons-mapped svg, .unified-control-buttons svg { width: 20px !important; height: 20px !important; }
        .unified-control-buttons-filters svg { width: 16px !important; height: 16px !important; }
    }

    /* TINY BUTTONS FOR NARROW SIDEBARS */
    @container (max-width: 250px) {
        .unified-control-buttons-mapped, .unified-control-buttons { width: 20px !important; height: 20px !important; border-radius: 6px !important; }
        .unified-control-buttons-filters { width: 16px !important; height: 16px !important; }
        .unified-control-buttons-mapped svg, .unified-control-buttons svg { width: 12px !important; height: 12px !important; }
    }
    
    /* EXPERIENCE BUILDER PANEL OVERRIDES */
    .p-1 { padding: 0px !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] { border: none !important; box-shadow: none !important; background: transparent !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .jimu-floating-panel-content { background: transparent !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .widget-content.p-1 { padding: 0 !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .resizer-0.bottom-right { right: 0 !important; bottom: 0 !important; width: 15px !important; height: 15px !important; padding: 0 !important; margin: 0 !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .resize-handle { position: absolute !important; right: 0px !important; bottom: 0px !important; padding: 0 !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .resize-handle svg path { fill: #35AF6D !important; }
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] .resizer-0.bottom-right:hover svg path{ fill: #82e8ec !important; }

    /* SIDEBAR BUTTON CLAMPING (FLUID SCALING) */
    .glass-control-panel {
        max-height: calc(100% - 10px) !important;
        overflow-y: auto !important;
        scrollbar-width: none;
        gap: 4px !important;
    }
    .glass-control-panel::-webkit-scrollbar { display: none; }
    .glass-control-panel .unified-control-buttons,
    .glass-control-panel .unified-control-buttons-mapped,
    .glass-control-panel .unified-control-buttons-filters {
        transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
                    background 0.2s ease,
                    box-shadow 0.2s ease !important;
        transform-origin: center center;
    }
    .glass-control-panel .unified-control-buttons { margin-bottom: 2px}
    @media (hover: hover) and (pointer: fine) {
        .glass-control-panel .unified-control-buttons:hover,
        .glass-control-panel .unified-control-buttons-mapped:hover {
            transform: scale(1.10) !important;
            background: rgba(255, 255, 255, 0.16) !important;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                        0 4px 14px rgba(0, 0, 0, 0.35) !important;
            filter: brightness(1.25);
        }
        .glass-control-panel .unified-control-buttons.is-active:hover,
        .glass-control-panel .unified-control-buttons-mapped.is-active:hover {
            transform: scale(1.10) !important;
        }
        .glass-control-panel .unified-control-buttons-filters.is-hoverable:hover {
            transform: scale(1.10) !important;
            background: rgba(255, 255, 255, 0.14) !important;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3) !important;
            filter: brightness(1.2);
        }
    }
    
    /* Same treatment for the utility panel buttons if you applied the
    earlier utility-panel-fix.css — wrap that :hover block the same way: */
    
    @media (hover: hover) and (pointer: fine) {
        .glass-image-utility-panel .utility-button:hover {
            transform: scale(1.15) !important;
            background: rgba(255, 255, 255, 0.16) !important;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35),
                        0 4px 14px rgba(0, 0, 0, 0.35) !important;
            filter: brightness(1.25);
            z-index: 2;
            position: relative;
        }
    }
    .glass-control-panel svg {
        width: clamp(10px, 60%, 20px) !important;
        height: auto !important;
        aspect-ratio: 1 / 1 !important;
        display: block;
        flex-shrink: 0;
    }
    .glass-control-panel .unified-control-buttons-filters svg {
        width: clamp(10px, 60%, 16px) !important;
        height: auto !important;
        aspect-ratio: 1 / 1 !important;
    }
    .glass-control-panel > div { display: flex !important; flex-direction: column !important; }

    /* GLASS UTILITY PANEL */
    .glass-image-utility-panel {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important; /* Changed to always be 2 columns */
        justify-items: center;
        padding: clamp(4px, 1cqmin, 6px) !important; /* Slightly increased padding to balance 2 cols */
        gap: clamp(3px, 1cqh, 6px) !important;
        right: clamp(44px, 8cqw, 66px) !important;
        bottom: clamp(20px, 5cqh, 27px) !important;
    }

    .glass-image-utility-panel .utility-button {
        width: clamp(18px, 6cqh, 24px) !important;
        height: clamp(18px, 6cqh, 24px) !important;
    }

    .glass-image-utility-panel .utility-button svg {
        width: clamp(12px, 70%, 18px) !important;
        height: clamp(12px, 70%, 18px) !important;
    }

    .utility-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid #fff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    /* OVERLAY CARD FLUID SCALING */
    .initial-state-card, .loading-card, .no-image-card {
        padding: clamp(10px, 5cqh, 30px) clamp(12px, 5cqw, 40px) !important;
        gap: clamp(4px, 2cqh, 16px) !important;
        max-width: 85% !important;
        border-radius: clamp(8px, 3cqmin, 20px) !important;
    }
    .initial-state-card span:first-of-type, .loading-card div, .no-image-card span {
        font-size: clamp(8px, 4cqmin, 12px) !important;
        line-height: 1.2 !important;
    }
    .initial-state-card span:last-of-type { font-size: clamp(7px, 3cqmin, 10px) !important; }
    .loading-card .premium-spinner, .loading-card .turbo-spinner {
        width: clamp(20px, 8cqmin, 40px) !important; height: clamp(20px, 8cqmin, 40px) !important;
        border-width: clamp(2px, 0.8cqmin, 4px) !important;
    }
    .no-image-card svg, .initial-state-card svg { width: clamp(18px, 6cqmin, 32px) !important; height: clamp(18px, 6cqmin, 32px) !important; }

    /* HIDE SUBTITLES ON SHORT WIDGETS */
    @container (max-height: 200px) {
        .initial-state-card span:last-of-type { display: none !important; }
        .initial-state-card, .loading-card { padding: 8px !important; }
    }

    /* LEGEND FLUID SCALING */
    .legend-container {
        padding: clamp1px, 0.5cqmin, 2px) !important;
        gap: clamp(1px, 1cqh, 4px) !important;
        border-radius: clamp(4px, 2cqmin, 8px) !important;
        bottom: clamp(2px, 2cqh, 2px) !important;
        left: clamp(2px, 2cqw, 2px) !important;
        max-width: 40% !important;
    }
    .legend-container div[style*="opacity: 0.4"] { font-size: clamp(4px, 2cqmin, 8px) !important; margin-bottom: 1px !important; padding-bottom: 1px !important; }
    @container (max-height: 340px) {
        .legend-container div[style*="opacity: 0.4"] { display: none !important; }
        .legend-container { bottom: 0 !important; }
    }
    .legend-container span[style*="font-size"] { font-size: clamp(6px, 3cqmin, 9px) !important; }
    .legend-container span[style*="border-radius: 50%"] { width: clamp(6px, 3cqmin, 9px) !important; height: clamp(6px, 3cqmin, 9px) !important; margin-right: 2px !important; }
    .legend-container button { font-size: clamp(6px, 2cqmin, 8px) !important; padding: 1px 0 !important; margin-top: 2px !important; }
    @container (max-height: 250px) { .legend-container button { display: none !important; } }

    /* KEYFRAME DEFINITIONS */
    @keyframes activePulse {
        0% { box-shadow: 0 0 5px var(--glow); }
        50% { box-shadow: 0 0 15px var(--glow); }
        100% { box-shadow: 0 0 5px var(--glow); }
    }
    @keyframes mly-warning-in {
        from { opacity: 0; transform: translateY(-6px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes mly-warn-pulse {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(255,165,0,0.4)); }
        50%       { filter: drop-shadow(0 0 10px rgba(255,165,0,0.75)); }
    }
    @keyframes radarSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes targetPulse {
        0% { box-shadow: 0 0 0 0 var(--mly-theme-idle-pulse, rgba(255, 255, 255, 0.25)); }
        70% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
        .initial-state-card { animation: none !important; }
    }
    .unified-control-buttons.active-layer { animation: activePulse 2s infinite ease-in-out; }
    @keyframes turboDataSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes turboDataPulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.2); }
        70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
    }
    @keyframes radarPulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes initialStateFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
    }
    
    /* SPLASH SCREEN ANIMATIONS */
    @keyframes ripple {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(3.5); opacity: 0; }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
    }
    @keyframes shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
    }
    @keyframes loading {
        0% { left: -50%; }
        50% { left: 25%; width: 50%; }
        100% { left: 100%; width: 20%; }
    }
    @keyframes msgFade1 {
        0%, 35% { opacity: 1; transform: translateY(0); }
        45%, 85% { opacity: 0; transform: translateY(-4px); }
        95%, 100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes msgFade2 {
        0%, 35% { opacity: 0; transform: translateY(4px); }
        45%, 85% { opacity: 1; transform: translateY(0); }
        95%, 100% { opacity: 0; transform: translateY(4px); }
    }
    .splash-msg-1 { animation: msgFade1 3.5s infinite ease-in-out; }
    .splash-msg-2 { animation: msgFade2 3.5s infinite ease-in-out; }

    /* FORCE SMOOTH RESIZE */
    div.jimu-floating-panel[aria-label="Mapillary Explorer"] {
        transition: width 0.05s ease-out, height 0.05s ease-out !important;
    }

    /* PREVENT BLACK FLASH */
    .widget-mapillary .mapillary-js {
        background: #000 !important;
        overflow: hidden !important;
    }

    /* HIDE BLACK STRIPES DURING RESIZE */
    .widget-mapillary .mapillary-viewer {
        overflow: hidden !important;
        background: #1a1a1a !important; /* Darker gray instead of pure black */
    }

    .widget-mapillary .mapillary-viewer canvas {
        transition: none !important; /* Remove any canvas transitions */
    }
    
    /* Targets the container to set a baseline */
    .mapillary-tag-container {
        font-size: 9px !important; 
        font-family: "Inter", "Segoe UI", Roboto, sans-serif !important;
    }

    /* Targets the individual labels to ensure they stay compact */
    .mapillary-tag-symbol {
        font-size: 9px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        /* Adds a dark outline so white text is readable on bright colors */
        text-shadow: 1px 1px 2px rgba(0,0,0,0.9) !important;
        /* Optional: prevents labels from being too wide */
        max-width: 100px;
        white-space: nowrap;
    }
    
    .hide-mly-tags .mapillary-tag-symbol {
        display: none !important;
    }

    /* POINT CLOUD SLIDER */
    .point-cloud-slider {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
    }

    /* Track */
    .point-cloud-slider::-webkit-slider-runnable-track {
        height: 3px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
    }

    .point-cloud-slider::-moz-range-track {
        height: 3px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
    }

    /* Thumb (the green circle) */
    .point-cloud-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 8px;              /* 👈 smaller */
        height: 8px;
        border-radius: 50%;
        background: #37d582;
        border: 1px solid rgba(255,255,255,0.6);
        cursor: pointer;
        margin-top: -2.5px;      /* center it */
    }

    .point-cloud-slider::-moz-range-thumb {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #37d582;
        border: 1px solid rgba(255,255,255,0.6);
        cursor: pointer;
    }

    .point-cloud-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .point-cloud-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
    }

    /* MOBILE (768px) OVERRIDES */

    @container (max-height: 350px) {
        .glass-image-utility-panel {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }

    @media (max-width: 768px) {
        .widget-mapillary input[type="date"]::-webkit-datetime-edit { display: none !important; }
        .info-box { font-size: 8px !important; max-width: 110px !important; }
        .legend-container { display: none !important; }
        .esri-popup__main-container { width: 250px !important;}
        .esri-widget__heading { font-size: 10px !important; }
        .esri-feature-content { font-size: 10px !important; }
        .esri-view-width-xsmall .esri-popup--docked-bottom-center .esri-popup__main-container { left: auto !important; right: auto !important; }
        .splash-screen-logo { margin-bottom: 15px !important; }
        .splash-screen-text { font-size: 10px !important; }
        .minimap-container { top: auto !important; bottom: 12px !important; left: 12px !important; right: auto !important; transform: none !important; width: min(34vw, 156px) !important; max-width: 156px !important; height: 104px !important; border-radius: 5px !important; }
        .warning-message-container { font-size: 8px !important; }
        .glass-scroll-container { border-radius: 0px !important; padding: 0px !important; margin-top: 0px !important; gap: 2px !important }
        .glass-datepicker-calendar { width: 160px !important; padding: 6px 6px 5px !important; }
        .day-cell { padding: 2px 1px !important; font-size: 8px !important; }
        .nav-row span { font-size: 9px !important; }
        .today-btn { font-size: 8px !important; padding: 2px 0 !important; }
        .turbo-filter-container { gap: 0 !important; padding: 0 !important; border: none !important; }
        .esri-elevation-profile{ margin-bottom: 0px !important; margin-left: 75px !important; }
        .esri-elevation-profile-legend{ display: none !important }
    }

    @keyframes spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
