import type { CSSProperties } from 'react';

/** Fresh toast-content layout preserves the original per-message style object. */
export function navigationFeedbackStyle(): CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: '6px' };
}

export function recoveryFeedbackStyle(): CSSProperties {
  return { ...navigationFeedbackStyle(), color: '#ffc107' };
}
