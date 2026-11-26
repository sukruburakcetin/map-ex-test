# Experience Builder 1.21 live acceptance

The earlier Windows fixture run reported **41 of 41 isolated Chromium fixtures passed**. The following live results were reported from a separate Windows Experience Builder 1.21 run. Record the final source identity and repeat the remaining checks against the artifact selected for release.

## Reported Windows results

| Check | Result |
| --- | --- |
| Production build before the MIT metadata update | Passed in 22.8 seconds with two Webpack size warnings and zero compilation errors. |
| Open a capture in Preview | The image opened and the map marked the selected capture. |
| Panorama hover at low and close zoom | The preview worked at both zoom levels. The cyan cone stayed hidden below zoom 14. |
| Panorama fullscreen round trip | Viewing direction was preserved when entering and exiting fullscreen after the camera fix. |
| Three rapid capture selections | Viewer and marker stayed on the third capture. |
| Widget Controller close and reopen | A different capture opened and the map marker followed it. |
| Builder appearance walkthrough | The map-follow button was hidden and imagery still opened. |
| Open a capture from the published test URL | Pending. |

The reported checks cover the scenarios above. The broader browser matrix and final artifact identity remain open.

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


From the Experience Builder **client** folder, run `pnpm run` to see the host scripts. If the installation exposes `build:prod`, run `pnpm run build:prod` and record its exit status and first relevant warning or error. Use the existing client and server development processes for the browser checks.

## First live pass

Use **Pass**, **Fail**, **Blocked**, or **Not run**. For failures, capture the map type, zoom, rotation, widget state, and the shortest sequence that reproduces the issue.

| Check | Expected observation | Result and evidence |
| --- | --- | --- |
| Panorama hover below zoom 14 | Preview card and pulse still appear. The cyan panorama hover cone remains hidden. | Pending |
| Hover at zoom 14 or closer | An individual panorama point shows the cyan projected cone when a bearing is available. Compare the open panorama with a different panorama on north-up and rotated 2D maps. | Pending |
| Zoom out while the cone is visible | The cyan cone disappears below 14 and the preview continues to work. The yellow active-image fan is a separate indicator. | Pending |
| Regular photo hover and selection | With the panorama filter set to **All**, a known regular-photo point at close zoom can be previewed and opened. | Pending |
| Cold/warm startup and close/reopen | The widget opens imagery and reopens cleanly. Check the console for errors tied to startup or disposal. | Pending |
| Fullscreen enter, exit, and resize | Record image/pose restoration, viewer recreation or cover flash, minimap, and access to controls. | Pending |

## Browser acceptance matrix

Portable tests and isolated webpack checks are prerequisites, not substitutes for these observations. Record source hash/commit, ExB/dependency versions, date, scenario and result.

| Scenario | Required observation | Recorded host evidence |
| --- | --- | --- |
| Cold/warm startup, close/reopen, active-map replacement during loading | No late listeners/layers/DOM on retired views; normal reopening | Pending current-source acceptance |
| Low-zoom hover, rapid pan/zoom, cold/warm tile lookup, touch | Responsive picking, truthful loading feedback, no stale thumbnail | Pending |
| Rapid A/B/C image selection, same/different sequences, error/cancel | Image-first opening; marker/cone/selected-sequence consistency | Only the earlier sequence-transition fix was reported working; full matrix pending |
| Fullscreen enter/exit and repeated resize | Same viewer/pose; no new dispose-cover flash or lost controls | Pending |
| Traffic-sign/object filters and labels at zoom 18+ | Same labels, hit precedence and disabled-source cancellation | Pending |
| Places filters/categories/confidence, dense view and POI imagery links | Native tile behavior, matching hit/selection/filter results | Pending |
| Routing with supported providers, cancellation and changed context | Same outputs, budgets, provider calls and late-result protection | Pending |
| Point-cloud tools, solar and elevation in 2D/3D | Same cleanup, feedback, geometry and current-image tracking | Pending |
| Field notes, attachments and configured remote publishing | Same local persistence; no implicit or duplicated remote writes | Pending |
| Mobile/narrow layout, keyboard and locale, fullscreen portals | Usable controls, scrolling/focus and readable translated content | Pending |

Verify configured service scenarios separately and use an authorized test workspace or layer for writes.
