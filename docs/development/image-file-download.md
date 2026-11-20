# Image file download — stage 75

The imagery helper downloadImageFile owns the existing 2048px-image metadata lookup, image fetch, dated filename and browser file delivery. It returns false for a missing thumbnail URL and true after the original success-path URL revocation. The widget retains the image/sequence snapshot, loading state, localized warning/success/error JSX and console error handling. Widget is 24 lines shorter.

Request URLs, options and count remain unchanged; no new retries or status policy are added. Filename selection still uses strict image ID equality and the existing captured_at truthiness/UTC date conversion. Blob URL creation, anchor append/click/remove and URL revocation retain their original order. Error propagation and existing cleanup behavior remain; this extraction does not introduce a separate download policy. No work is added to hover, startup or playback and no measured speedup is claimed.

Twenty-one cases compare the entire frozen original and current widget workflow: state, feedback, errors, fetches, date handling and DOM/URL call traces, including selection changes while downloading. Chromium additionally executes the real helper with controlled responses and verifies exact downloaded bytes, dated filename, real Blob URL download, removed anchor, revocation and missing URL without remote network. Strict TypeScript checks the standalone helper. Whole ExB typing/build and live browser acceptance remain pending.

Requires stage 74. From widget root:

```sh
node apply-image-download-refactor.cjs --dry-run
node apply-image-download-refactor.cjs
# Undo only this stage:
node apply-image-download-refactor.cjs --uninstall
```

Actual source is preflighted before writes. Exact original bytes and local documentation history are preserved; unsupported edits and rollback over later edits are refused. Backups are outside the widget; reverse newest first. Restart/hard-refresh, build in ExB 1.21 and check downloads for dated/undated captures, unavailable-image feedback, loading reset and ordinary image/hover interactions. A continuation request does not establish host installation/build acceptance.
