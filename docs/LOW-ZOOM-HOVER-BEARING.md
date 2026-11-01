# v6.98: Preview capture bearing at low zoom

Requires v6.97. Run `node apply-low-zoom-hover-bearing-v6-98.cjs`, rebuild and reload.

Remove the representative-point exclusion for the hover sector. A low-zoom hover that already has an image preview can now show that capture's bearing. Metadata ID must exactly match the current hovered image ID. This is the preview image's heading, not a heading for the whole sequence or group. No additional requests or picking changes are introduced. Missing bearing and panoramic images remain pulse-only. The fixed anchor and original brown pulse remain unchanged.

Rollback: `node apply-low-zoom-hover-bearing-v6-98.cjs --uninstall`, rebuild and reload.
