# Mapillary Explorer 5.0 | Where we left off

Paste or attach this file in a new ChatGPT conversation connected to **sukruburakcetin/map-ex-test**. Resume at **Step 19**. The user prefers one action at a time and reversible `.cjs` installers for changes they apply to their local Windows widget folder.

## Start from the pushed candidate

- Development repository is `sukruburakcetin/map-ex-test`, branch `main`. The user's successful push advanced it from `f66f093` to **`a7d002b`**. This is the 5.0 release candidate checkpoint. [Candidate commit](https://github.com/sukruburakcetin/map-ex-test/commit/a7d002b)
- Fetch and verify the current remote head before editing. The previous cloud checkout had local edits on top of `f66f093`. If that checkout is reused and still dirty, inspect its status and use a clean checkout of the pushed candidate for new work. Preserve local edits.
- The user's Git checkout is `C:\Users\BURAK\Desktop\map-ex-test`. The separate Windows test copy is `C:\Users\BURAK\Desktop\arcgis-experience-builder-1.21\client\your-extensions\widgets\mapillary-explorer`. The second folder was updated with installers and copied into the Git checkout before committing. Verify the next build uses the same candidate source.
- The candidate is on development `main`. Public 5.0 publication and the `v5.0.0` tag are pending. The public repository is `sukruburakcetin/mapillary-explorer`. The release comparison baseline is public `v4.6.0` at `b143e7db9f67dc393c2b9eb85e131f6141aeca9f`.

## What passed and what is pending

| Check | Evidence |
| --- | --- |
| Windows Experience Builder 1.21 production build | `pnpm run build:prod` finished in 22.8 seconds with zero compilation errors and two Webpack asset and entrypoint size warnings. This build predates the MIT manifest change. |
| Builder Preview | User confirmed capture opening and marker, panorama hover at low and close zoom, preserved panorama direction entering and exiting fullscreen after the camera fix, third capture winning rapid A/B/C selection, and Widget Controller close and reopen. |
| Builder customization | User confirmed the map-follow button was hidden by the documented setting and the capture still opened. |
| Widget Controller UI | User approved the compact imagery loading banner and the reduced resize gap with a bottom-right grip cue. Controller corner resize and the viewer fullscreen camera fix are separate changes. The exploratory controller fullscreen overlay installer was backed out and excluded from the candidate. |
| Git copy validation | 147 Markdown files, 631 local links, zero broken links. Repository layout check reported 1,043 files and zero errors. The staged whitespace check was clean. |
| Published test app | **Pending.** The user asked to proceed provisionally while unavailable to run it. Keep it pending in the release evidence. |

## Step 19 | Resume here

1. From the Windows Experience Builder 1.21 **client** directory, run `pnpm run build:prod` against the final candidate and record the result and source identity.
2. Publish a **test copy** through the intended host workflow. Open its published URL in a fresh tab. Select a Mapillary capture and confirm the image opens and the marker identifies the same capture.
3. Record the result in `docs/development/exb-1.21-validation.md`. Run relevant remaining acceptance checks for any optional services and deployment modes in scope. Finalize release scope and notes against that reviewed candidate before public publication or tagging.

The host is on the user's Windows machine. A cloud checkout can validate repository content and run portable checks. The published-app smoke result needs live evidence.

## Maintenance context

- Mapillary Explorer is a React/TypeScript widget hosted by ArcGIS Experience Builder Developer Edition. The runtime wires active ArcGIS map views, Mapillary imagery and optional services to feature owners. Preserve current-image ownership, cancellation on view replacement and close, and explicit note publication.
- 4.6 already included nearby imagery, filters, Local notes, capture routing and GPX, and point-cloud tools. Use the change inventory to distinguish 5.0 additions from improvements. Optional Places, Enterprise notes and shared workspaces require configuration and deployment-specific checks. The global Places browser-provider investigation remains research. Its canonical page is `docs/development/places-research.md`.
- The 5.0 source includes the MIT license and matching manifest metadata. Preserve third-party notices. The copied Git guide briefly contained pasted installer code and was repaired before commit. The staged guide was verified against blob `6c87421d0bfb5954a60c593579227ffa9b7663b8`. The local installer scripts were left untracked.
- The docs now address users, contributors, administrators and publishers. `docs/widget-development.md` covers customizing **Mapillary Explorer**, using real Builder settings and source examples. The old generic starter-widget tutorial was replaced. This handoff is the one optional AI document and stays outside the repository.

## Read next

- [Live acceptance record](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/development/exb-1.21-validation.md)
- [Release preparation](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/releases/README.md) · [Change inventory](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/releases/5.0-change-inventory.md)
- [Publisher guide](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/publishing.md) · [5.0 migration](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/releases/5.0-migration.md)
- [Documentation index](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/docs/README.md) · [Contributing](https://github.com/sukruburakcetin/map-ex-test/blob/a7d002b/CONTRIBUTING.md)
