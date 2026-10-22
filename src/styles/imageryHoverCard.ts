/** Shared hover-card tokens. DOM construction stays in the imagery feature. */
export const imageryHoverCardStyles = {
  shell: { position: 'fixed', pointerEvents: 'none', maxWidth: 'calc(100vw - 16px)', padding: '12px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid rgba(157,206,184,0.24)', background: 'rgba(14,32,28,0.96)', color: '#e8f2ed', boxShadow: '0 8px 28px rgba(0,0,0,0.30)', fontFamily: "'Segoe UI',system-ui,sans-serif", fontSize: '12px', lineHeight: '1.4', zIndex: '2147483646', overflow: 'hidden', display: 'none' },
  creator: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0', fontSize: '13px', fontWeight: '600', color: '#e8f2ed' },
  name: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date: { display: 'flex', gap: '8px', alignItems: 'center', color: '#aec7bb', marginTop: '5px', fontSize: '11px' },
  preview: { width: '100%', height: '120px', marginTop: '10px', borderRadius: '8px', overflow: 'hidden', background: '#1c3930', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aec7bb', fontSize: '11px' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
} as const;
