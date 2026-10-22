/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import type { FieldNoteFileNotice } from './FieldNoteFiles';

/** Keep existing file messages/language, duplicate-count wording and import-success duration. */
export function showFieldNoteFileFeedback(showToast: (content: React.ReactNode, duration?: number) => void, notice: FieldNoteFileNotice): void {
  if (notice.kind === 'empty-export') { showToast('Dışa aktarılacak not bulunamadı.'); return; }
  if (notice.kind === 'empty-import') { showToast('Dosyada geçerli not bulunamadı.'); return; }
  if (notice.kind === 'invalid-import') { showToast('Dosya okunamadı — geçerli bir Field Notes GeoJSON dosyası olmalı.'); return; }
  if (notice.kind === 'read-error') { showToast('Dosya okunamadı.'); return; }
  if (notice.kind === 'imported') {
    const added = notice.added, skipped = notice.skipped;
    showToast(
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icons.Check size={14} color="#37d582" />
        {added} not içe aktarıldı{skipped > 0 ? ` (${skipped} yinelenen atlandı)` : ""}
      </span>,
      3000,
    );
  }
}
