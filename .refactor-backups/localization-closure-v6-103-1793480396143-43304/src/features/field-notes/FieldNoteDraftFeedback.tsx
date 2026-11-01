/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { FieldNoteDraftNotice } from './FieldNoteDraft';

/** Preserve annotation enable/disable and saved-note wording, icons and 2000 ms duration. */
export function showFieldNoteDraftFeedback(showToast: (content: React.ReactNode, duration?: number) => void, kind: FieldNoteDraftNotice, enabled?: boolean): void {
  if (kind === 'mode') {
    const isActive = enabled;
    showToast(
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icons.Notes size={14} />
            {isActive ? "Field notes enabled" : "Field notes disabled"}
          </span>,
          2000,
        );
    return;
  }
  showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" /> Object saved as note
        </span>,
        2000,
      );
}
