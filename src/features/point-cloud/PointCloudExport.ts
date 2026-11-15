import type { PointCloudPoint, PointCloudResult } from '../../utils/pointCloudUtils';

export type PointCloudExportFormat = 'csv' | 'ply' | 'las';
export type PointCloudExportNotice = { kind: 'unavailable' } |
  { kind: 'preparing' | 'complete' | 'failed'; format: PointCloudExportFormat };
type Writer<T> = (points: PointCloudPoint[], east: number, north: number, up: number, cameraLatitude: number) => Promise<T>;
export interface PointCloudExportDependencies {
  canExport(): boolean;
  /** Read after loading feedback is enabled; borrow the complete retained result, never a filtered copy. */
  readResult(): PointCloudResult;
  readVerticalOffset(): number;
  /** East/north are meters; latitude is degrees. Read after preparation feedback, before the writer. */
  readHorizontalContext(): { x: number; y: number; latitude: number };
  readImageId(): string | null | undefined;
  isDisposed(): boolean;
  setLoading(loading: boolean): void;
  notify(notice: PointCloudExportNotice): void;
  writers: { csv: Writer<string>; ply: Writer<Blob>; las: Writer<Blob> };
  logError(error: unknown): void;
}

/** Own single-flight export coordination; writers retain format math, chunking and height policy.
 * No acquisition, crop, lasso, ground filter, cancellation or point copies are introduced.
 * An accepted export finishes with its captured result even if the current cloud changes.
 */
export class PointCloudExport {
  private busy = false;
  constructor(private readonly dependencies: PointCloudExportDependencies) {}

  /** Preserve guard/feedback order and the original exception boundaries.
   * Capture result/up after loading state, then read horizontal context after preparation feedback.
   * Binary failures become notices; CSV writer failures propagate, with busy/loading released in finally.
   * Teardown suppresses only the final loading-state update, not an already accepted download.
   */
  async download(format: PointCloudExportFormat = 'csv'): Promise<void> {
    const d = this.dependencies;
    if (!d.canExport()) { d.notify({ kind: 'unavailable' }); return; }
    if (this.busy) return;
    this.busy = true; d.setLoading(true);
    const result = d.readResult(), up = d.readVerticalOffset();
    try {
      if (format === 'ply' || format === 'las') {
        d.notify({ kind: 'preparing', format });
        try {
          const writer = format === 'las' ? d.writers.las : d.writers.ply;
          const horizontal = d.readHorizontalContext();
          const blob = await writer(result.points, horizontal.x, horizontal.y, up, horizontal.latitude);
          this.downloadBinary(blob, () => `mapillary_3d_scan_${result.imageId || d.readImageId()}.${format}`);
          d.notify({ kind: 'complete', format });
        } catch (_) { d.notify({ kind: 'failed', format }); }
        return;
      }
      d.notify({ kind: 'preparing', format: 'csv' });
      const horizontal = d.readHorizontalContext();
      const content = await d.writers.csv(result.points, horizontal.x, horizontal.y, up, horizontal.latitude);
      try {
        this.downloadCsv(content, () => `mapillary_3d_scan_${result.imageId || d.readImageId()}.csv`);
        d.notify({ kind: 'complete', format: 'csv' });
      } catch (error) {
        d.logError(error);
        d.notify({ kind: 'failed', format: 'csv' });
      }
    } finally {
      this.busy = false;
      if (!d.isDisposed()) d.setLoading(false);
    }
  }

  /** Download a writer-produced Blob. Keep anchor removal and the 1000 ms URL grace period.
   * Browser objects are created only on accepted export, never during module/widget initialization.
   */
  private downloadBinary(blob: Blob, filename: () => string): void {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = filename();
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Preserve CSV MIME, attribute setters, body removal and immediate URL revocation.
   * Resolve the filename after Blob/URL/anchor creation, at its original browser-operation boundary.
   */
  private downloadCsv(content: string, filename: () => string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
