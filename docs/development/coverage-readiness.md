# Coverage readiness — stage 71

The coverage feature now owns the existing visible-tile readiness wait in coverageReadiness.ts. The widget's waitForTurboCoverageReady forwards the actual ArcGIS view, layer and AbortSignal. This removes 19 lines from widget.tsx without changing startup ordering, filters, selection or requests.

The function preserves the original 15-second deadline, pre-abort rejection, asynchronous layer-view acquisition, updating watcher, immediate-ready check and one-settlement cleanup. Late layer views after cancellation/timeout cannot attach a watcher. It introduces no new resources or runtime dependencies. The structural view interface lets tests execute the owner without the ExB SDK.

Thirteen tests compare a frozen pre-extraction implementation with the extracted function: outcomes and timer/listener/watcher traces, both before/after layer-view readiness, late successes/failures and repeated events. The widget forwarding test also checks promise identity. All prior suites remain. Strict module TypeScript and widget/module syntax pass; whole-project ExB types and browser acceptance are separate checks. No speed improvement is claimed for this behavior-preserving extraction.

Requires the coverage-first startup update. From widget root:

```sh
node apply-coverage-readiness-refactor.cjs --dry-run
node apply-coverage-readiness-refactor.cjs
# Reverse only this stage:
node apply-coverage-readiness-refactor.cjs --uninstall
```

The installer validates source before writing, preserves exact original bytes outside the widget and local documentation history, accepts LF/BOM-CRLF, and refuses edits made after installation during rollback. Reverse newest first. Restart/hard-refresh; build in ExB 1.21 and check coverage ready/loading, quick 2D/3D switches, retry after failure, hover and image opening. The user reported positive visual feedback on prior hover/startup updates; this does not establish a zero-warning host build for this stage.
