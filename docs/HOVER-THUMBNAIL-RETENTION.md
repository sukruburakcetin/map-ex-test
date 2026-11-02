# Retain thumbnails during same-image hover enrichment

`renderImageryHoverCard` previously created a new image element and assigned its thumbnail URL each time cached metadata was enriched. Even when the browser reused downloaded bytes, this replaced already visible pixels with a loading placeholder until the new element loaded.

A WeakMap now retains one current image element per tooltip host. Reuse requires the same nonempty image ID, identical URL, an attached current preview, a visible card and either a pending image or a successfully loaded image. A loaded image is attached synchronously to the rebuilt metadata card; a pending image retains its request and receives the current card's callbacks. No second src assignment occurs during same-image enrichment.

Target/URL changes create a new element. Late load/error callbacks must match both the current WeakMap entry and attached preview before changing content. Failed images can be retried by later renders; hidden/cleared cards do not reuse prior thumbnails. Language bindings are refreshed for the retained image. The helper does not prefetch imagery or retain a history of hovered thumbnails.

## Validation

Seven Chromium checks exercise real image loading and the production card, styles and presentation owner: loaded-image identity and src-write count; pending-image reuse; stale target isolation; changed URLs; Arabic direction/alt text while retaining pixels; failed-image retry; and cleared-card isolation. The previous implementation fails the first case with a different image element and two src writes; the new implementation passes all seven. This demonstrates removal of DOM replacement/reload scheduling, not a measured reduction in network requests, GPU time or SDK image-opening latency.

No map picker, bearing policy, sequence overview, click handler or viewer code changes in this patch. A full Experience Builder host build and visual validation remain local-host checks.

## Install and rollback

From the widget root, outside `src`:

    node apply-hover-thumbnail-retention.cjs

Rebuild and reload Experience Builder. `--dry-run` checks targets without writing source. The installer does not run browser tests/builds. The standalone uninstaller restores this card change and removes its added test/documentation, retaining previous hover and click fixes. Conflicting edits are refused.

Run the browser fixture from the widget root with TypeScript, Playwright and Chromium available:

    MAPILLARY_TYPESCRIPT=/path/to/typescript.js node tests/hoverThumbnailRetention.browser.cjs

Optional paths: `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`, `MAPILLARY_WIDGET_ROOT`.
