/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';

/** Keep local-only clear wording and optional Enterprise reminder at the original 2000 ms duration. */
export function showLocalNotesClearedFeedback(showToast: (content: React.ReactNode, duration?: number) => void, sharingEnabled?: boolean): void {
  showToast(
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Icons.Check size={14} color="#37d582" /> {sharingEnabled ? "Local notes cleared. Enterprise notes remain." : "Local notes cleared."}
        </span>,
        2000,
      );
}
