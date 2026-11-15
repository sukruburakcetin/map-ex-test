/** Snapshot used by recovery; the sequence array retains the original per-attempt lifetime. */
export interface PlaybackRecoveryState {
  sequenceImages: readonly { id: string }[] | null | undefined;
  imageId: string | null | undefined;
  sequenceId?: string | null;
  recoveryKey?: unknown;
}
export interface PlaybackRecoveryViewer {
  moveTo(imageId: string): PromiseLike<unknown>;
  getComponent(name: 'sequence'): { configure(options: { playing: boolean }): unknown } | null | undefined;
}
export interface PlaybackRecoveryHost {
  getState(): PlaybackRecoveryState;
  getOrderedImages?(): Promise<readonly { id: string }[]>;
  getViewer(): PlaybackRecoveryViewer | null | undefined;
  isPaused(): boolean;
  setPaused(paused: boolean): void;
  refreshNearbyAfterPause(): void;
  warn(...args: unknown[]): void;
}

/** Try following frames in order after the native player halts on an unavailable image.
 * Captures the sequence once, reads pause intent around awaited moveTo calls, and
 * returns control to the current native sequence component on success. A pause stops
 * further candidates after the pending move settles; this policy does not abort moveTo.
 * Preserves request order/count and warning text; adds no timers, retries or prefetches.
 * Runtime retains playback events, user-interaction detection and the 400 ms trigger.
 */
export async function skipUnavailableSequenceFrames(host: PlaybackRecoveryHost): Promise<void> {
  if (host.isPaused()) return;
  const initial = host.getState(), viewer = host.getViewer();
  const imageId = initial.imageId;
  if (!imageId || !viewer) return;
  const current = () => !host.isPaused() && host.getViewer() === viewer &&
    host.getState().sequenceId === initial.sequenceId && host.getState().recoveryKey === initial.recoveryKey;
  let sequenceImages: readonly { id: string }[] | null | undefined;
  try { sequenceImages = host.getOrderedImages ? await host.getOrderedImages() : initial.sequenceImages; }
  catch (error) {
    if (current() && host.getState().imageId === imageId) { host.warn('[Auto-Skip] Image order unavailable:', error); host.setPaused(true); }
    return;
  }
  if (!current() || host.getState().imageId !== imageId || !sequenceImages) return;
  const currentIndex = sequenceImages.findIndex(image => image.id === imageId);
  if (currentIndex === -1 || currentIndex >= sequenceImages.length - 1) {
    host.setPaused(true);
    return;
  }
  let targetIndex = currentIndex + 1;
  let success = false;
  while (!success && targetIndex < sequenceImages.length && current()) {
    if (host.getState().imageId !== imageId) return;
    const candidateImg = sequenceImages[targetIndex];
    try {
      await viewer.moveTo(candidateImg.id);
      success = true;
    } catch (error) {
      if (!current()) return;
      host.warn(`[Auto-Skip] Frame ${candidateImg.id} is dead. Skipping to next...`);
      targetIndex++;
    }
  }
  if (!current()) return;
  if (success) {
    const sequenceComponent = viewer.getComponent('sequence');
    if (sequenceComponent) sequenceComponent.configure({ playing: true });
  } else host.setPaused(true);
}

/** Record pause intent before stopping the native player, then refresh idle nearby data.
 * Retains best-effort handling for a disposed viewer. The refresh still runs when
 * native stopping fails; no new enrichment scheduling policy is introduced here.
 */
export function stopSequencePlayback(host: PlaybackRecoveryHost): void {
  host.setPaused(true);
  try {
    if (host.getViewer()) {
      const sequenceComponent = host.getViewer()!.getComponent('sequence');
      if (sequenceComponent) sequenceComponent.configure({ playing: false });
    }
  } catch (error) { host.warn('[Mapillary] Playback could not be stopped cleanly:', error); }
  host.refreshNearbyAfterPause();
}
