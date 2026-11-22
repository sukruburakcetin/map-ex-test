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
