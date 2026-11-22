# Navigation feedback presentation (stage 83)

`src/features/navigation/NavigationFeedback.tsx` builds the existing center-map and heading-sync toast content. `src/styles/navigationFeedback.ts` supplies their layout. Widget handlers retain navigation, heading state, translation binding and toast publication; the existing notification owner retains timing.

The feedback factories preserve Crosshair/CompassLocked/CompassUnlocked icons, 14 px sizes, translation keys, fragments, whitespace and child ordering. Translation callbacks keep icon/translation evaluation order. The style factory returns the original flex/center/6 px layout as a fresh object per message. The toast default duration is still supplied by `showToast`; no explicit duration is added.

Existing feature-specific feedback modules were reviewed. Their tool/note messages and duration policies remain separate; there is no new universal feedback abstraction. No request, timer, dependency, state, navigation target or animation option is added or changed. This is presentation/style separation, not a measured speed improvement.

## Verification

The comparison suite executes frozen stage-82 handlers and actual widget handlers with the real feedback/style modules. It records JSX nodes, translation calls, navigation arguments, state patches and toast calls. Cases cover zoom targets, absent/mismatched context, both heading branches/locales, queued state, repeated toggles and failure boundaries. Style independence is checked separately. Existing behavior tests remain unchanged.

Validation: 2,800 passing portable tests / 209 files in both the workspace and clean installer-produced copy, zero failures or skips. Twenty-four new comparisons cover JSX/style output, translation/evaluation order, navigation/state/toast boundaries, locales, queued updates and style identity. Existing tests are unchanged. Isolated ExB 1.20 module-graph build (zero errors/warnings), icon/size/layout mutation checks, BOM/CRLF comparison and reversible installer checks pass. Installer checks cover dry-run, repeat, exact rollback, local documentation preservation, unknown/missing source, later edits, symlinks and corrupt backups.

The isolated ExB 1.20 module-graph build passes with zero errors/warnings. The user supplied a successful stage-82 isolated ExB 1.21 build on 21 November 2026 (7,847 ms, zero errors/warnings). Browser acceptance and stage-83 ExB 1.21 validation remain unconfirmed.

## Installation

From the widget root:

```sh
node apply-navigation-feedback-refactor.cjs --dry-run
node apply-navigation-feedback-refactor.cjs
node tools/check-exb-build.cjs --client ../../..
```

Reviewed stage-82 source is required; BOM/CRLF variations are accepted. Unknown source edits are refused before writing and local documentation histories are retained. Keep `.refactor-backups/navigation-feedback-stage83` for rollback. Repeat installation verifies installed files. `--uninstall` restores exact original bytes and protects later edits or corrupted backups; uninstall newer stages first. No package installation or Git operation occurs.

## Host smoke and next work

Use Center map, then toggle heading synchronization both ways. Check the same icons, translated labels, spacing and expiry in normal and fullscreen layouts. Continue with another bounded widget responsibility after reviewing this checkpoint.
