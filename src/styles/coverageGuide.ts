import type { CSSProperties } from 'react';
export const coverageNoticeStyles = {
    container: { position: "relative", flex: "0 0 28px", width: "100%", height: 28, minHeight: 28, maxHeight: 28, boxSizing: "border-box", overflow: "visible", display: "flex", alignItems: "center", gap: 6, padding: "0 6px", background: "var(--mly-theme-panel, #142126)", color: "var(--mly-theme-text, #fff)", fontFamily: '"Inter", "Segoe UI", sans-serif', fontSize: 11, lineHeight: 1.4, zIndex: 60 } as CSSProperties,
    statusIcon: { width: 18, height: 18, flexShrink: 0, objectFit: "cover", borderRadius: 4 } as CSSProperties,
    secondary: { flexShrink: 1, minWidth: 0, fontSize: 10, color: "var(--mly-theme-muted, #9cb6ad)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as CSSProperties,
    logo: { width: 22, height: 22, flexShrink: 0, objectFit: "cover", borderRadius: 6 } as CSSProperties,
    status: { minWidth: 0, flex: "1 1 0", display: "flex", alignItems: "center", gap: 6, overflow: "hidden" } as CSSProperties,
    title: { minWidth: 0, fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as CSSProperties,
    helpButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 26, height: 24, minWidth: 24, padding: 0, border: 0, borderRadius: 6, background: "transparent", color: "var(--mly-theme-muted, #b0c3cb)", fontSize: 11, whiteSpace: "nowrap", cursor: "pointer", touchAction: "manipulation" } as CSSProperties,
    helpPanel: { position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: "min(420px, calc(100% - 16px))", maxHeight: "calc(100% - 52px)", overflowY: "auto", overflowWrap: "anywhere", overscrollBehavior: "contain", padding: "6px 12px 10px", boxSizing: "border-box", border: "1px solid var(--mly-theme-border, rgba(145,217,181,0.3))", borderRadius: 8, background: "var(--mly-theme-panel, #142126)", color: "var(--mly-theme-text, #fff)", boxShadow: "0 6px 24px rgba(0,0,0,0.4)", zIndex: 1000 } as CSSProperties,
    brand: { fontSize: 9, fontWeight: 600, letterSpacing: "0.25px", color: "var(--mly-theme-accent, #91d9b5)", marginBottom: 6 } as CSSProperties,
    message: { fontSize: 11, lineHeight: 1.45, color: "var(--mly-theme-muted, rgba(255,255,255,0.85))" } as CSSProperties,
    close: { flexShrink: 0, width: 36, height: 36, padding: 0, border: 0, borderRadius: 6, background: "transparent", color: "var(--mly-theme-muted, #c6d5dc)", fontSize: 20, cursor: "pointer", touchAction: "manipulation" } as CSSProperties,
    optOut: { display: "flex", alignItems: "center", gap: 8, minHeight: 36, fontSize: 11, color: "var(--mly-theme-muted, #bdcdd3)", cursor: "pointer", touchAction: "manipulation", marginTop: 6 } as CSSProperties,
    action: { flexShrink: 0, height: 24, padding: "0 5px", border: 0, borderRadius: 6, background: "transparent", color: "var(--mly-theme-accent, #b5edcf)", fontSize: 10, whiteSpace: "nowrap", cursor: "pointer", touchAction: "manipulation" } as CSSProperties,
};

export const busyIcon: CSSProperties = { flexShrink: 0, display: 'block' };
export const helpIcon: CSSProperties = { display: 'block', flexShrink: 0, pointerEvents: 'none' };
export const filterHint: CSSProperties = {
  ...coverageNoticeStyles.secondary,
  minWidth: 0,
  maxWidth: '38%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
export const selectionAlert: CSSProperties = { ...coverageNoticeStyles.helpPanel, zIndex: 1100 };
export const selectionActions: CSSProperties = { display: 'flex', gap: 8, marginTop: 6 };
export const helpHeader: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 };
export const helpBrand: CSSProperties = { display: 'flex', alignItems: 'center', gap: 6 };
export const helpStatus: CSSProperties = { ...coverageNoticeStyles.message, marginBottom: 6 };
export const helpSection: CSSProperties = { ...coverageNoticeStyles.message, marginTop: 8 };
export const lineLegendRow: CSSProperties = { display: 'flex', alignItems: 'center', gap: 7 };
export const pointLegendRow: CSSProperties = { ...lineLegendRow, marginTop: 3 };
export const lineSwatch: CSSProperties = { width: 18, borderTop: '2px solid #739dff', flexShrink: 0 };
export const pointSwatch: CSSProperties = {
  width: 6,
  height: 6,
  margin: '0 6px',
  borderRadius: '50%',
  background: 'blue',
  border: '1px solid #e3da30',
  flexShrink: 0,
};
export const turboPointSwatch: CSSProperties = { ...pointSwatch, border: '1px solid white' };
export const legendDescription: CSSProperties = { margin: '5px 0 0' };
export const settingsList: CSSProperties = { margin: '4px 0', paddingLeft: 18 };
export const optOutCheckbox: CSSProperties = { margin: 0, width: 16, height: 16, accentColor: 'var(--mly-theme-accent, #91d9b5)' };

/** Render with the guide so the status bar is compact while map modules load. */
export const coverageBarCss = `
    .mly-coverage-touch-hint { display:none; }
    @media (pointer:coarse) { .mly-coverage-mouse-hint { display:none; } .mly-coverage-touch-hint { display:inline; } }
    @container (max-width:900px) { .mly-coverage-context-hint { display:none; } }
    @container (max-width:400px) { .mly-coverage-filter-hint { max-width:28% !important; font-size:9px !important; } }
    .mly-coverage-notice button:focus-visible, .mly-coverage-help button:focus-visible { outline:2px solid var(--mly-theme-accent, #91d9b5); outline-offset:-2px; }
    @container (max-width:600px) {
        .mly-coverage-logo { display:none; }
        .mly-coverage-notice { height:24px !important; min-height:24px !important; max-height:24px !important; flex-basis:24px !important; gap:4px !important; padding:0 4px !important; }
        .mly-coverage-notice [role="status"] > span:last-child { font-size:10.5px !important; }
        .mly-coverage-notice button { min-width:24px; font-size:10px !important; }
        .mly-coverage-notice button[aria-label="Dismiss coverage message"] { width:30px !important; font-size:18px !important; }
    }

    .mly-coverage-bar-action {
        box-sizing: border-box;
        flex: 0 1 auto;
        min-inline-size: 24px;
        max-inline-size: 60%;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .mly-coverage-action-short { display: none; }
    @container (max-width:280px) {
        .mly-coverage-action-has-short .mly-coverage-action-full { display: none; }
        .mly-coverage-action-short { display: inline; }
    }
`;
