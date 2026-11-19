# Experience Builder 1.21 acceptance — stage 65

Prepared 19 November 2026. Source checkpoint: `609b81c` plus stages 47–65, preserved in the local working checkpoint. Confirm the actual installed source before treating results as acceptance
of this checkpoint. The manifest's `exbVersion` declaration is not a test result.

## Current evidence

| Check | Status |
| --- | --- |
| Default portable tests | 2,265 passed; zero failures/skips; all 186 files |
| Isolated runtime/settings bundle on 1.20.0 | Passed; zero errors/warnings |
| Isolated bundle on 1.21 | User-supplied completed result: 1.21.0, 9,974 ms, zero errors/warnings; no ancestor override |
| Normal 1.21 host compilation/start | Working browser reported; production-package build output not separately recorded |
| Real 1.21 browser/SDK/layout checks | General smoke check reported good by user; per-case/device evidence not collected |
| Whole-project semantic TypeScript checks | Not established by the transpile-only bundle checker |

The cloud workspace has an installed 1.20 client only. The commands below must
run on the machine with the actual 1.21 installation. No widget update or new
installer is required to begin: the checker is already part of stage 47+.

See [checkpoint evidence](checkpoint-2026-11-19.md) for provenance and limits. The checklist below remains available for detailed acceptance.

## 1. Confirm the client and dependencies

Open a terminal in:

```text
C:\Users\BURAK\Desktop\arcgis-experience-builder-1.21\client\your-extensions\widgets\mapillary-explorer
```

Run:

```sh
node --version
pnpm --version
node -p "require('../../../package.json').version"
```

The third command must identify **1.21**, not 1.20. The relative path assumes the
standard `client/your-extensions/widgets/mapillary-explorer` layout. Use an
absolute `--client` path if your checkout lives elsewhere. The documented host
recommendations are Node 24 and pnpm 11; a package-manager upgrade is not part of
this validation.

The latest incremental installer is `apply-detection-text-actions.cjs`, after
stage 64. Do not apply it over an unknown stage or bypass its preflight. If your
source came from GitHub, remember these stages were not pushed in this session.

## 2. Run the isolated target bundle check

From that same widget folder:

```sh
node tools/check-exb-build.cjs --client ../../..
```

Expected: **Experience Builder 1.21.x**, followed by **0 errors; 0 warnings**.
The checker prints its output directory and writes `build-report.json` there.
Keep the report. It does not install dependencies, replace the widget link or
change host packages. It uses a transpile-only loader and omits normal host
packaging plugins; success alone does not complete acceptance.

If the checker reports a missing dependency, inspect the actual client installation first. The checker checks selected folders, whereas Node can resolve packages from ancestors. The message alone does not prove the package is unavailable to the running app:

```sh
cd ../../..
pnpm list mapillary-js pbf @mapbox/vector-tile pako --depth=0
```

If the list is incomplete but the widget runs, use the installation guide's [declaration and resolution checks](../installation.md#if-the-widget-works-but-dependencies-appear-missing) before changing packages. Confirm the intended `exb-client` directory first.

Use the existing [installation guide](../installation.md) if setup is genuinely
incomplete. Do not reinstall everything, replace React, change pnpm versions or
convert lockfiles merely to address a missing direct dependency. The reviewed
widget packages are Mapillary JS 4.1.2, pbf 5.1.2, vector-tile 3.0.0 and pako 2.2.0.

## 3. Compile and run the actual host

In the **client** folder, inspect the provided scripts:

```sh
pnpm run
```

Run the production build script actually supplied by your host. If
`build:prod` is listed, use `pnpm run build:prod`; do not invent or add a script
if it is absent. Keep the output separately from the isolated bundle result.

Start the existing server and client in separate terminals:

| Terminal folder | Command |
| --- | --- |
| `arcgis-experience-builder-1.21/server` | `pnpm start` |
| `arcgis-experience-builder-1.21/client` | `pnpm start` |

Open the host at `https://localhost:3001/`, using its normal organization/Client
ID setup. Follow the existing app-upgrade workflow if testing an older experience;
do not overwrite the 1.20 host with 1.21 files. Preserve 1.20 as a comparison.

## 4. Browser checks

Record Pass / Fail / Not configured for each row, with browser/device and 2D/3D
view noted. A configured optional feature needs its own check; an unavailable
backend is not a pass and need not block core imagery validation.

| Area | Action and expected result | Result |
| --- | --- | --- |
| Basic imagery | Open a coverage image; viewer and sprites load; no Pbf import/export warning or runtime error | Not run |
| Coverage hover | Hover at low zoom, then zoom/pan and hover again; delayed/cancelled work cannot show another target's preview | Not run |
| Navigation/info | Click and surf images rapidly; image info stays user-controlled; stale metadata cannot replace the active image | Not run |
| Fullscreen | Enter/exit repeatedly; one viewer survives, controls work, map/view ownership restores | Not run |
| Detection menu | Test scale, opacity, modes, overlap, labels, reset and close; selected state and callbacks still work | Not run |
| Menu layout | Narrow viewport, coarse-pointer device and longest available translations: labels wrap without clipping; focus, Escape/outside close and fullscreen portal work | Not run |
| Current-image marker | In 2D/tilted 3D, zoom through phone close levels and change images; marker/fan share the correct anchor without stale duplicates | Not run |
| Time travel/Nearby | Open explicitly, change images/close while pending; foreground work keeps priority and stale results stay hidden | Not run |
| Overture, if configured | Vector icons, family/confidence filters, paging/selection and imagery search work; disabling stops optional work | Not run |
| Routes/cloud/notes, if configured | Exercise the enabled tools and cancellation/view transfer using the existing routing and feature guides | Not run |

Do not paste access tokens, credentials or signed URLs into results. For an error,
keep the first useful console error and its stack, redacting token values.

## 5. Send the first result

Start by sharing the isolated check's console output. A useful brief record is:

```text
Installed source: stage 65 / other checkpoint:
Client version:
Node / pnpm versions:
Isolated target bundle: pass/fail; errors/warnings:
Normal host build/start: pass/fail/not run:
Browser + viewport/device + 2D/3D:
First failing action and redacted console error, if any:
```

The isolated target result and general user browser confirmation are now recorded; detailed acceptance remains pending where no case-specific evidence exists. A clean
portable run and isolated 1.20 bundle alone are not substitutes for target-host results. Keep every failure visible; do not weaken tests or change behavior
without diagnosing the concrete incompatibility.
