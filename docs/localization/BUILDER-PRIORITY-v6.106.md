# Builder language priority v6.106

Requires v6.105. An explicit builder language (English, Turkish or Spanish) now overrides every saved runtime preference, even when Allow Users To Change Language is enabled. The in-widget language selector displays that same configured value and is disabled. The setter also rejects programmatic attempts to override a builder language.

When the builder selects App language (auto), viewer choice remains available if enabled. Saved viewer choices are retained for this mode, but cannot override an explicit builder language. If viewer choice is disabled, auto follows the application locale. Existing startup translation and lazy catalog behavior are retained.

Validation: sixteen localization checks, including all explicit builder languages against every saved preference with viewer choice enabled/disabled; Chromium tests stale stored Turkish versus builder Spanish, synchronized disabled selectors, programmatic change rejection, live builder changes across all three languages, Auto unlocking viewer choice, and preserved storage; Experience Builder development build. Installer dry-run, install, repeat install, byte-exact uninstall and conflict-before-writes passed.

Install from widget root: `node apply-builder-language-priority-v6-106.cjs`. Undo: `node apply-builder-language-priority-v6-106.cjs --uninstall`. No marker, hover, coverage or image-selection logic changes.
