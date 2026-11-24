import type { React } from 'jimu-core';
/** Search and compact metadata follow the active source scroll viewport. */
export const noteSearchStyle: React.CSSProperties = { display: 'grid', gap: 4, flexShrink: 0, minWidth: 0, width: '100%', fontSize: 11, color: 'var(--mly-theme-text, #d3e2d9)' };
export const noteSearchRowStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, minWidth: 0 };
export const noteSearchInputStyle: React.CSSProperties = { width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '4px 7px', border: '1px solid var(--mly-theme-border, #526e60)', borderRadius: 5, background: 'var(--mly-theme-input, #14251d)', color: 'var(--mly-theme-text, #f2f7f4)', font: 'inherit' };
export const noteSearchClearStyle: React.CSSProperties = { padding: '4px 8px', border: '1px solid var(--mly-theme-border, #526e60)', borderRadius: 5, background: 'var(--mly-theme-control, #214233)', color: 'var(--mly-theme-text, #e4f2ea)', cursor: 'pointer', font: 'inherit' };
export const noteSearchStatusStyle: React.CSSProperties = { fontSize: 10, color: 'var(--mly-theme-muted, #acc8b8)', overflowWrap: 'anywhere' };

/** Counts and guidance share available width, wrapping naturally on phones/RTL. */
export const noteSearchFooterStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 12, rowGap: 2, minWidth: 0 };
