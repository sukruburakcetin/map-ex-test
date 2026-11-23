# Experience Builder 1.21 acceptance — stage 137

The Windows run reported **41 of 41 isolated Chromium fixtures passed**. Record the live build and browser checks below against the widget copy actually loaded by Experience Builder. The cloud workspace has no Experience Builder Developer Edition host, so the live results start as pending.

## Identify the build

| Field | Value |
| --- | --- |
| Date and local time | |
| Experience Builder client version | |
| Browser and version | |
| Widget stage or Git commit, if available | |
| Widget runtime SHA-256 | |
| Full host build result | |
| Test experience and active map types | |

From the widget root in Windows Command Prompt, capture the client version and normalized runtime hash:

```bat
node -v
node -p "require('../../../package.json').name + ' ' + require('../../../package.json').version"
node -e "const fs=require('node:fs'),crypto=require('node:crypto');const src=fs.readFileSync('src/runtime/widget.tsx','utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');console.log(crypto.createHash('sha256').update(src).digest('hex'))"
```

The stage 137 reference runtime hash is `43e5778804cd16f42547442b869f073c2c5cae9514b199eaadbe019e7f530457`. A different hash can reflect a local change. Record the actual hash used in the live run.

From the Experience Builder **client** folder, run `pnpm run` to see the host scripts. If the installation exposes `build:prod`, run `pnpm run build:prod` and record its exit status and first relevant warning or error. Use the existing client and server development processes for the browser checks.

## First live pass

Use **Pass**, **Fail**, **Blocked**, or **Not run**. For failures, capture the map type, zoom, rotation, widget state, and the shortest sequence that reproduces the issue.

| Check | Expected observation | Result and evidence |
| --- | --- | --- |
| Panorama hover below zoom 14 | Preview card and pulse still appear. The cyan panorama hover arrow remains hidden. | Pending |
| Hover at zoom 14 or closer | An individual panorama point shows the cyan arrow when a bearing is available. Compare the open panorama with a different panorama on north-up and rotated 2D maps. | Pending |
| Zoom out while the arrow is visible | The cyan arrow disappears below 14 and the preview continues to work. The yellow active-image fan is a separate indicator. | Pending |
| Regular photo hover and selection | With the panorama filter set to **All**, a known regular-photo point at close zoom can be previewed and opened. | Pending |
| Cold/warm startup and close/reopen | The widget opens imagery and reopens cleanly. Check the console for errors tied to startup or disposal. | Pending |
| Fullscreen enter, exit, and resize | Record image/pose restoration, viewer recreation or cover flash, minimap, and access to controls. | Pending |

## Remaining live acceptance

Use the repository [browser acceptance matrix](docs/development/refactoring-remaining-work.md#browser-acceptance-matrix) for active-map replacement during loading, rapid A/B/C selection and cancellation, touch and keyboard, detection filters, Places, routing, point cloud, solar, elevation, and field notes. Record configured service scenarios separately. Verify publishing only in a test workspace or layer where writes are authorized.

A useful failure report includes the row name, expected and actual behavior, the runtime hash, and a screenshot or the first relevant console error.
