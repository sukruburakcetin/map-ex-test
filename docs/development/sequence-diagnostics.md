# Sequence diagnostics lifecycle — stage 73

SequenceDiagnostics owns the optional __mapillarySequencePerformance registry entry and long-task PerformanceObserver. Widget retains numeric snapshot assembly and the callbacks that read/reset current sequence performance and optional Nearby discovery stats. Two forwarding methods keep existing lifecycle call sites intact. Widget is 9 lines shorter; ownership of two resources moves out of the coordinator.

The debug-enabled/open/window gates are unchanged. Sync first clears the old owned observer/entry, creates a null-prototype registry only when needed, and observes longtask only when supported, with buffered:false. Clear disconnects once and deletes only a matching owned entry, preserving replacement entries and other widget IDs. Reset and snapshot remain live callbacks. No network, timer, additional observer or snapshot fields are introduced. Snapshot contents and credential exclusions stay unchanged. No speed improvement is claimed.

Nineteen cases execute the original methods and extracted owner with controlled window/observer environments and compare observer/registry traces, plus widget integration for current gates and callback values. Strict TypeScript checks the standalone module. Whole-project ExB typing and browser acceptance remain separate.

Requires stage 72. From widget root:

```sh
node apply-sequence-diagnostics-refactor.cjs --dry-run
node apply-sequence-diagnostics-refactor.cjs
# Undo only this stage:
node apply-sequence-diagnostics-refactor.cjs --uninstall
```

Installer preflight checks actual source, preserves documentation history and exact original bytes outside the widget, and refuses unknown edits. Reverse newest first. Restart/hard-refresh, build in ExB 1.21, and check debug on/off, close/reopen, registry snapshot/reset, multiple widget entries, cleanup and ordinary hover. A continuation request does not establish host installation/build acceptance.
