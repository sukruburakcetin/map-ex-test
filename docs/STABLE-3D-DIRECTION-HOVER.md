# v6.93: Ground-aligned 3D navigation-arrow hover

Apply over the latest GitHub sources plus v6.92: `node apply-stable-direction-hover-v6-93.cjs`, rebuild and reload.

The viewer-arrow hover target in 3D is a steady amber disk with a white rim. It has no lifted callout, pulse interval or repeated symbol replacement. A marker-only ScreenDirectionCone projects it onto rendered ground and caches settled projections. Only one overlay/tracker exists while a target is hovered; clearing hover disposes it. The existing coverage display anchor is used where available. No image lookup, sequence selection, picking or coverage pipeline changes are included.

A steady native icon remains as the fallback when the projected overlay is unavailable. The matching minimap marker remains. 2D keeps the existing yellow pulse. Graphic identity is reused when changing 3D targets. Cleanup removes graphics from the original view and minimap even after the active view changes.

Validation: 3 target lifecycle tests, 15 shared ground-projection tests and strict owner compilation pass. This removes the lifted symbol and animated 3D symbol replacements; alignment and flicker still require a visual check on the user's SceneView/GPU.

Rollback: `node apply-stable-direction-hover-v6-93.cjs --uninstall`, rebuild and reload.
