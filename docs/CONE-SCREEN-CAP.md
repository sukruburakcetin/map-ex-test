# Cone screen footprint · v6.65

Standalone cone-only update based on GitHub `85c38df`. Does not include or require v6.64 playback scheduling; apply with v6.64 uninstalled.

The direction cone retains its configured size when it fits. At close zoom, it may shrink below the requested ground-metre radius to avoid covering a large part of the map. Its upper screen-footprint limit is 96 CSS pixels, reduced to a quarter of the shorter viewport dimension on smaller views (minimum 40px). A small sampling margin keeps normal footprints below that limit.

Local projection samples cover the wedge's arc, ground edges and upper surface, checking both screen width and height. Two bounded shrink corrections and a verification accommodate perspective without an unbounded solver. An unstable valid projection that cannot satisfy the cap hides the cone for that redraw; the selected image marker remains. Unavailable terrain/projection uses a conservative zoom-derived ground cap, which is an estimate rather than a precise 3D screen bound. No elevation query over the network is introduced.

Fixed vertical lift now scales down below a 10m cone radius. The existing radius-based rise also shrinks, preventing the close-view wedge from retaining an outsized vertical thickness. Both the mesh and perimeter use the same lift formula. The apex stays at the same native ground anchor; bearing/spread and mesh topology remain.

A 3D camera watcher requests a refresh when tilt/heading/position changes, sharing the existing pending cone animation frame with zoom/bearing work. It is removed with the existing view teardown/rebind. There is no new animation loop, timer, background request or sequence work. Projection work is bounded at 45 footprint samples per redraw, plus the existing centreline sizing work.

Selection/hover modules, picking methods, click/pointer-move/image callbacks and zoom-driven sequence sizing/refreshes are unchanged.

## Check in your app

- With v6.64 uninstalled, refresh after applying v6.65. Open an image and zoom from normal to very close in 2D and 3D.
- Tilt 3D toward ground level and rotate around the image. The cone should remain compact and its apex should stay at the image point.
- Change the viewer cone-size control and bearing. The requested size remains an upper request constrained by screen readability.
- Verify sequence hover/selection and blue coverage alignment as before, and confirm ordinary playback still advances.
- Missing terrain can temporarily use the estimated cap. Real ArcGIS rendering and low-end-device frame cost need verification in your running app; synthetic projection tests are not deployment measurements.
