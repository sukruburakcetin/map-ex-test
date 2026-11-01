# v6.95: 3D navigation-target bearing cone

Requires v6.94. Run `node apply-direction-hover-bearing-v6-95.cjs`, rebuild and reload.

3D viewer-arrow hover shows a steady amber target and a smaller orange direction sector at the same exact coverage anchor. The sector uses computed_compass_angle, falling back to compass_angle. It shows the image capture heading, not the direction of travel from the current image. Missing bearings and panoramas keep a disk only.

The disk is drawn as soon as anchor resolution completes. One cancellable background metadata request enriches the hovered image's bearing. Up to 64 results are cached by image and token. Hover changes, mouseout and view/context changes suppress late results. The existing marker-only overlay now draws its sector too, sharing its element, projection cache and tracking loop. No pulse or second rendering loop is created. 2D rendering remains unchanged.

SDK build and 11 marker/anchor tests pass. Check the appearance and bearing in the user's scene after rebuilding. No frame-rate benchmark is claimed.

Rollback: `node apply-direction-hover-bearing-v6-95.cjs --uninstall`, rebuild and reload.
