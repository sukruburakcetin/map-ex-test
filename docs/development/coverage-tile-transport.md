# Coverage tile transport — stage 72

The coverage feature owns fetchCoverageTile: URL construction, bounded HTTP/network/body retries, empty-tile handling, token-valid publication and timing completion. Widget getTurboTileBuffer continues to own cache lookup, token invalidation and shared in-flight requests. Its transport forwarding method uses one stable adapter with lazy bindings to the current token, cache and metrics. This removes 28 widget lines without allocating a new adapter per request.

The original maximum two attempts and 200-ms retry delay remain. 204/404 publish empty buffers; ordinary client errors are not retried; 429/server/network/body failures follow the existing retry branches. Abort and token checks prevent late cache publication. Metrics start/count/finish/cancel order remains. No cache size, concurrency, selection, prefetch, request field or viewer behavior changes. This is a behavior-preserving extraction, not a measured speed improvement.

Twenty-two cases execute a frozen original transport and the extracted module with controlled responses and compare outcomes and fetch/delay/cache/timing traces. Existing sequence runtime cases still verify shared downloads, independent cancellation, token changes and cache behavior; their assertions are unchanged. Only new helper/adapter bindings were added to that fixture. Strict TypeScript passes for the independent module; whole ExB typing and browser checks remain pending.

Requires stage 71. From widget root:

```sh
node apply-coverage-transport-refactor.cjs --dry-run
node apply-coverage-transport-refactor.cjs
# Undo only this stage:
node apply-coverage-transport-refactor.cjs --uninstall
```

Actual source fingerprints are checked before writes. Exact bytes and local documentation histories are preserved; unknown source edits and unsafe rollback over later edits are refused. Backups live outside the widget. Reverse newest first. Restart/hard-refresh and build in ExB 1.21. Smoke cold/warm hover, image opening, quick view switches and cancellation; compare live request counts before claiming a performance change. Continuation requests do not establish host acceptance of prior stages.
