# v6.97: Steady bearing cone around a pulsing brown point

Requires v6.96. Run `node apply-steady-hover-cone-v6-97.cjs`, rebuild and reload.

The brown pulse and bearing sector are siblings inside a fixed 60px anchor. Only the brown disk changes dimensions; the cone's parent center no longer depends on its pulse size. Both share the original map position and RAF clock. Pulse timing, dimensions, color, metadata loading and picking remain unchanged.

SDK build passed. A real Chromium test exercised the actual hover runtime methods and sector helper with fixture map projection: cone bounds remained fixed across two 1200ms pulse cycles at a fractional-pixel anchor, pulse width varied from 6 to 11px, one RAF remained scheduled and cleanup removed the wrapper. User SceneView visual validation remains appropriate.

Uninstall: `node apply-steady-hover-cone-v6-97.cjs --uninstall`, rebuild and reload. This restores the exact v6.96 runtime and removes this document.
