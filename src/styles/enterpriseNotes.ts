/** Local/Enterprise source selection and Enterprise list presentation. */
import type { React } from 'jimu-core';
export const notesTabsStyle: React.CSSProperties = { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 };
export const getNotesTabStyle = (selected: boolean): React.CSSProperties => ({ padding: '5px 10px', borderRadius: 5,
  border: selected ? '1px solid #48966b' : '1px solid #3c5145', background: selected ? '#214d35' : 'transparent', color: '#d4e7dc', cursor: 'pointer', fontSize: 11 });
export const enterpriseToolbarStyle: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', fontSize: 10, color: '#b2cbbc' };
export const enterpriseRowsStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' };
export const enterpriseRowStyle: React.CSSProperties = { padding: '5px 8px', flexShrink: 0, borderRadius: 6, background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid #35b7c4', color: '#d3e2d9', fontSize: 11 };
export const enterpriseActionsStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '76px minmax(0, 1fr)', alignItems: 'start', gap: 6, marginTop: 3 };
export const notesRowButtonsStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 };
export const notesAttachmentHintStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5', marginTop: 3 };
export const notesSourceHintStyle: React.CSSProperties = { fontSize: 10, color: '#a6c6b4', margin: '2px 0' };
export const enterpriseErrorStyle: React.CSSProperties = { color: '#ffb8a6', fontSize: 11 };

export const notesLocalPanelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0, flex: '1 1 0', overflow: 'hidden' };

/** Fixed source-independent sheet height; only records scroll as tabs/loading state change. */
export const notesSheetStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 999999990,
  height: 'min(300px, 65%)', boxSizing: 'border-box', background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255,255,255,0.1)', padding: '6px 8px 8px', display: 'flex', flexDirection: 'column', gap: 6,
  overflowY: 'auto', animation: 'nearbySlideUp 0.2s ease-out' };
export const notesRowHeadingStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' };
export const notesRowMetaStyle: React.CSSProperties = { fontSize: 9, color: '#a0ada5' };
