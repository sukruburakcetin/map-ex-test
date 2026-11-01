# v6.96: Brown hover bearing trial

Requires v6.95. Run `node apply-brown-hover-bearing-v6-96.cjs`, rebuild and reload.

Hovering an individual coverage circle keeps the existing brown pulse and adds a smaller translucent amber capture-bearing sector. The sector lives inside the brown overlay and shares its exact DOM center and existing animation clock. It does not add another RAF, viewer, hit test or metadata request. At most two extra orientation projections run when the camera/anchor changes; settled projections are cached and updates are limited to roughly 30 Hz. Existing pulse size, color, timing and selection logic are unchanged.

The existing delayed hover-card request now also requests computed_compass_angle, compass_angle and is_pano. Existing cancellation/identity guards apply before decoration is shown. Missing bearing, panoramic images and representative sequence points keep the brown pulse alone. Old cached metadata without bearing also keeps pulse-only feedback until refreshed normally. 2D and 3D use the sector; 3D follows the projected ground plane while staying centered on the existing pulse.

Validation: SDK build, strict helper compilation and four decoration tests pass. Visual appearance and FPS on the user's GPU remain to be checked.

Uninstall from the same widget folder: `node apply-brown-hover-bearing-v6-96.cjs --uninstall`, rebuild and reload. The installer restores the exact preceding runtime source and removes the trial helper, tests and this document. Uninstall before applying later patches that modify these files, or the guards will reject conflicting edits.
