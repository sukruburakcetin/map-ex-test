# v6.79 steady 3D active-image marker
Requires v6.78. Install from widget root, rebuild/restart Experience Builder and reload the page. This removes active pulse diagnostics and their runtime callback guards; no console commands are required afterward. Reload is necessary to clear previously running isolation/comparison objects. Historical diagnostic docs/installers remain for audit/rollback but their commands no longer exist in this build.

3D uses a steady 12 pt green icon with a white 2 pt outline, on-ground placement and occludedVisibility visible. It returns before any RAF scheduling or symbol pool setup. Same-image anchor updates and ownership/cleanup remain intact. This is the fixed-size strategy the user previously confirmed did not blink in v6.69, not a claim that the underlying renderer issue was identified or fixed for every scene. 2D retains its 1200 ms breathing overlay/fallback.

No changes to sequence selection, hovering, coverage completion logic, cone size or anchor recovery. Diagnostic guards revert exactly to the pre-v6.75 runtime. Source changes: SelectionPulse.ts, runtime/widget.tsx. Tests: selectionPulseGround.test.cjs and pulseVisibilityProbe.test.cjs (now asserts diagnostic removal). Added this document.

Dry-run with --dry-run. Installer is idempotent and checks conflicts before writing. --uninstall restores v6.78, including its diagnostics, rather than uninstalling all historical patches. Apply/uninstall requires rebuilding and reloading. No need to run earlier diagnostic uninstallers.
