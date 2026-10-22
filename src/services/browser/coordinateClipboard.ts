/** Coordinate clipboard operations and browser fallback; UI notification is supplied by the caller. */

/**
 * Copy valid WGS84 coordinates as latitude, longitude with six decimal places.
 * Prefer the secure-context Clipboard API; fall back to a temporary textarea.
 * Restore focus and remove the textarea even when the fallback fails. Preserve
 * existing validation and feedback text; no permission prompt is added here.
 */
export async function copyCoordinates(latitude: number, longitude: number, notify: (message: string) => void): Promise<void> {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) { notify("Coordinates are unavailable."); return; }
    const text = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); notify(`Coordinates copied: ${text}`); return; } catch (_) {}
      }
      const previousFocus = document.activeElement as HTMLElement | null;
      const input = document.createElement("textarea"); input.value = text; input.readOnly = true;
      input.style.position = "fixed"; input.style.left = "-9999px";
      let copied = false;
      try { document.body.appendChild(input); input.focus(); input.select(); copied = document.execCommand("copy"); }
      finally { input.remove(); previousFocus?.focus?.({ preventScroll: true }); }
      notify(copied ? `Coordinates copied: ${text}` : "Copy unavailable. Select the coordinates and copy them manually.");
    } catch (_) { notify("Copy unavailable. Select the coordinates and copy them manually."); }
  }
