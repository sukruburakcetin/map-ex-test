# v6.90: Combined 2D current-image marker

Requires v6.89. Install with `node apply-combined-2d-marker-v6-90.cjs`, rebuild and reload.

2D uses the v6.87 SVG circle and direction sector, with a green center and white rim. There is no pulsing overlay or symbol animation. The existing native selection Graphic remains as a steady fallback and retains image identity. The SVG tracker reuses its element and caches settled projections. The current v6.89 native 3D appearance remains unchanged.

Rollback: `node apply-combined-2d-marker-v6-90.cjs --uninstall`, rebuild and reload.
