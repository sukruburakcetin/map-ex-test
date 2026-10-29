# Playback while zooming · v6.64

Based on GitHub main `85c38df612a2dbd4e0812ecb30bb3779c5abfcb4` (2026-10-27).

During playback, zoom readout React updates are coalesced to at most once per 120ms. The extra zoom-triggered camera-cone redraw waits for a quiet zoom interval (normally 120–240ms after the last zoom event). Paused zoom readouts remain immediate. Per-image marker, cone, minimap and metadata tracking continue on their existing paths. Only one short-lived timer is retained; stale views and cleanup cancel it.

Automatic image following and 3D bearing-follow navigation yield while the SDK reports active user interaction during playback, including image-lock mode. Following resumes on subsequent image/bearing events after input ends. This avoids issuing competing camera moves while the user controls the map; it does not stop playback or change the follow policy outside active input.

Selection and hover behavior are protected: no changes to coverage files, picking methods, highlight methods, click/pointer-move callbacks, the image callback or zoom-driven selection refreshes. The zoom readout is UI state; picking continues using live SDK view values. No tile, imagery fetch, sequence enumeration, filter, symbol-sizing formula or hover timing is changed.

This reduces avoidable scheduling work; it does not eliminate the map renderer's tile decoding, GPU work or texture-upload contention. No deployed FPS improvement is claimed from static review or synthetic scheduling tests.

## Verify locally

1. Use the same sequence, viewport, playback speed, zoom range and optional layers before/after. Warm the imagery route and map tiles first.
2. Start playback and repeat the same zoom gestures in 2D, then 3D if used. Repeat with map follow off/on and image lock on/off. Playback must keep advancing and manual input must not fight automatic following.
3. Confirm the zoom-related UI catches up shortly after input stops. Stop playback and confirm immediate paused zoom UI behavior.
4. Confirm sequence selection, hover previews, blue highlighting and zoom alignment behave exactly as before, including zooming through 14.
5. Capture comparable Chrome Performance recordings for actual rendering/long tasks. Existing playback image-gap diagnostics measure image transitions, not GPU FPS. Use a real phone for phone performance.

Quality messages and native selection sizing retain their existing zoom paths. Optional active layers and actual map rendering may still contribute to contention.
