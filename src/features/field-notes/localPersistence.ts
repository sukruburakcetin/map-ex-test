/** Local field-note persistence; shared Enterprise edits are a separate runtime path. */
import type { FieldNote } from "../../components/types";
import { CACHE_KEYS } from "../../utils/constants";

/**
 * Restore local notes and mark interrupted saves as failed for explicit retry.
 * Storage/parse/application failures are logged and contained, as in the runtime.
 * @param storageKey Existing widget-owned browser storage key.
 * @param applyNotes Apply restored records and trigger existing marker updates.
 */
export function restoreLocalNotes(storageKey: string, applyNotes: (notes: FieldNote[]) => void): void {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const notes: FieldNote[] = JSON.parse(raw).map((note: FieldNote) =>
        note.sharedStatus === "saving" ? { ...note, sharedStatus: "failed", sharedError: "The previous save was interrupted. Retry to check its outcome safely." } : note,
      );
      applyNotes(notes);
    }
  } catch (err) {
    console.warn("Failed to load field notes", err);
  }
}

/** Serialize notes to the existing key; return false on storage failure without throwing. */
function isStorageQuotaError(error: unknown): boolean {
  const failure = error as { name?: string; code?: number } | null;
  return failure?.name === "QuotaExceededError" || failure?.name === "NS_ERROR_DOM_QUOTA_REACHED" || failure?.code === 22 || failure?.code === 1014;
}

export function persistLocalNotes(storageKey: string, notes: FieldNote[]): boolean {
  try {
    const serialized = JSON.stringify(notes);
    try {
      localStorage.setItem(storageKey, serialized);
      return true;
    } catch (error) {
      if (!isStorageQuotaError(error)) throw error;
      for (let index = localStorage.length - 1; index >= 0; index--) {
        const key = localStorage.key(index);
        if (!key || key === storageKey || !key.startsWith(CACHE_KEYS.GEO_PREFIX)) continue;
        localStorage.removeItem(key);
        try {
          localStorage.setItem(storageKey, serialized);
          return true;
        } catch (retryError) {
          if (!isStorageQuotaError(retryError)) throw retryError;
        }
      }
      throw error;
    }
  } catch (err) {
    console.warn("Failed to save field notes", err);
    return false;
  }
}
