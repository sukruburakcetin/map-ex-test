# Time travel preview and comparison

The Time travel action opens a preview dialog. Select a capture date and choose **Compare with current image** to reveal the two thumbnails with a keyboard-accessible slider. **Explore on Mapillary** retains the external time-travel page.

The comparison uses static 1024-pixel capture thumbnails, not synchronized interactive Mapillary viewers. Different positions, camera directions and panorama projections may not align. Candidates retain the existing 12-metre, one-day, different-sequence and 22.5-degree rules, with the existing panorama heading exception. Up to 12 matching dates are offered from the bounded 50-candidate lookup, newest first. This is not an exhaustive date search.

No new preview requests run until the button is opened. Two abortable metadata requests obtain source and candidate thumbnails; only the selected image and, while comparing, the current image are rendered. Closing or changing the active image aborts pending work and ignores late responses. Retry, empty-state and image-failure messages are included. No second viewer, playback, coverage or map rendering loop is created. The dialog traps Tab, closes with Escape, restores focus and uses the fullscreen root when available.


For code changes, use the host build and live imagery checks described in [contributing](../../CONTRIBUTING.md).
