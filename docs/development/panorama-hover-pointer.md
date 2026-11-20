# Panorama hover ring and default-direction pointer

Hover-only UI update requested after the current-image readiness fix. A cyan circle identifies a 360-degree capture; a small nine-pixel outward cyan pointer identifies its default capture orientation. The ring remains round and unrotated; the pointer follows the projected compass direction. It is deliberately smaller than the yellow live-view cone. The existing computed-compass/original-compass helper supplies its angle, independent of viewer heading.

Unknown angle: ring alone, with no invented northward direction. Invalid/temporarily unavailable map projection: keep the ring, hide the pointer, and retry on the existing update cycle. Hidden anchor: hide the whole decoration. Perspective images keep the original wedge and ground projection. Switching panorama/perspective replaces only the hover decoration. The yellow selected-image cone, image-scoped readiness and image opening are untouched.

## Performance and verification

No requests, metadata fields, timers, listeners, loops or image-opening waits added. Existing hover clock/cache are reused. Panorama pointer orientation needs one forward-direction projection when heading/view state invalidates cache; it does not use the perspective wedge's additional 3D ground-axis projection. Settled updates reuse orientation. Panorama with missing bearing still uses zero projections. The circle/pointer share one SVG and existing marker parent, without animation; bearing changes reuse the same element. This is bounded rendering work, not an absolute zero-cost or measured frame-rate guarantee.

Three additional sector cases cover projected pointer direction in 2D/3D, cache and element reuse, finite north, missing angles, failed projection/recovery, and ring preservation. The former ring-only cases now explicitly remain missing-bearing panoramas. All **2,419 portable tests across 192 files pass**, zero skipped, including the previous current-image/readiness/metadata and image-first tests. Sector strict TypeScript and repository hygiene pass. No target-host browser/build evidence yet for this change. Existing acceptance records remain separate.

## Reversible installation

Requires the preceding cone-readiness/panorama-ring fix. From widget root:

```sh
node apply-panorama-hover-pointer.cjs --dry-run
node apply-panorama-hover-pointer.cjs
# Reverse only the hover pointer:
node apply-panorama-hover-pointer.cjs --uninstall
```

Preflights source, tests, widget and prior owner/metadata modules, refuses unexpected edits, preserves local documentation history and exact original bytes outside the widget, supports LF/BOM/CRLF, and refuses later edits or corrupt backups on rollback. Reverse this update before the preceding fix. Restart/hard-refresh; hover a panorama at low zoom, rotate the map/tilt in 3D, switch to perspective and inspect a missing-bearing capture. Confirm the yellow live cone is unchanged.
