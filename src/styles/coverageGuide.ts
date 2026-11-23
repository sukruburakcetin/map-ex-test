import type { CSSProperties } from 'react';
import { coverageNoticeStyles } from '../utils/styles';

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
export const optOutCheckbox: CSSProperties = { margin: 0, width: 16, height: 16, accentColor: '#91d9b5' };

/** Render with the guide so the status bar is compact while map modules load. */
export const coverageBarCss = `
    .mly-coverage-touch-hint { display:none; }
    @media (pointer:coarse) { .mly-coverage-mouse-hint { display:none; } .mly-coverage-touch-hint { display:inline; } }
    @container (max-width:900px) { .mly-coverage-context-hint { display:none; } }
    @container (max-width:400px) { .mly-coverage-filter-hint { max-width:28% !important; font-size:9px !important; } }
    .mly-coverage-notice button:focus-visible, .mly-coverage-help button:focus-visible { outline:2px solid #91d9b5; outline-offset:-2px; }
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
