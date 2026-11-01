/** @jsx jsx */
import { OwnedMessage } from '../../i18n/WidgetLocale';
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { FieldNoteFileNotice } from './FieldNoteFiles';

/** Keep existing file messages/language, duplicate-count wording and import-success duration. */
export function showFieldNoteFileFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: FieldNoteFileNotice): void {
  if (notice.kind === 'empty-export') { showToast(<OwnedMessage source={"No notes available to export."}/>); return; }
  if (notice.kind === 'empty-import') { showToast(<OwnedMessage source={"No valid notes found in the file."}/>); return; }
  if (notice.kind === 'invalid-import') { showToast(<OwnedMessage source={"The file could not be read. Use a valid Field Notes GeoJSON file."}/>); return; }
  if (notice.kind === 'read-error') { showToast(<OwnedMessage source={"The file could not be read."}/>); return; }
  if (notice.kind === 'imported') {
    const added = notice.added, skipped = notice.skipped;
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Check size={14} color="#37d582" />
        <OwnedMessage source={added === 1 ? "One note imported" : "{count} notes imported"} values={{count:added}}/> {skipped > 0 ? <OwnedMessage source=" ({count} duplicates skipped)" values={{count:skipped}}/> : ""}
      </span>,
      3000,
    );
  }
}
