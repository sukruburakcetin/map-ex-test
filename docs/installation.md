# Install Mapillary Explorer

This guide is for people adding the widget to **Experience Builder Developer Edition** and contributors running its source. People viewing an already published experience do not install Node.js or packages.

The repository is a widget, not a standalone app. Install and run the Experience Builder host first; keep its `client` and `server` directories separate from this widget.

## 1. Choose your host version

| Developer Edition | Recommended Node.js | Dependency installer | React / ArcGIS Maps SDK | Widget validation |
|---|---|---|---|---|
| 1.20 | 24 | npm | React 19 / SDK 5.0 | Existing development target; deployment acceptance still applies. |
| 1.21 | 24 | pnpm 11 | React 19 / SDK 5.1 | Installation route documented; full widget build/browser acceptance pending. |

Use [Esri's release matrix](https://developers.arcgis.com/experience-builder/guide/release-versions/) and [installation guide](https://developers.arcgis.com/experience-builder/guide/install-guide/) for the host you downloaded. Starting with 1.21, Esri requires pnpm to install host dependencies; `npm install` / `npm ci` in those host folders are not the supported route. Newer Experience Builder releases may require different versions—check the matrix instead of extrapolating this table.

The widget manifest currently declares `exbVersion: 1.20.0`. That is not evidence of completed 1.21 testing. A package-manager change alone does not validate the new SDK.

## 2. Install the host

Download and extract a fresh Developer Edition folder. Follow Esri's instructions to register a Client ID, configure your organization and trust the development certificate. Do not copy `node_modules` or host package/lockfiles from a different host version.

Check Node.js:

```sh
node --version
```

For **1.21**, install the recommended pnpm major once, then check it:

```sh
npm install -g pnpm@11
pnpm --version
```

Using npm here installs the package-manager tool globally; it does not install Experience Builder's dependencies.

Open a terminal in the extracted host's **`server`** directory and install its base dependencies. Open another terminal in **`client`** and do the same:

| Directory | 1.20 | 1.21 |
|---|---|---|
| `server` | `npm ci` | `pnpm ci` |
| `client` | `npm ci` | `pnpm ci` |

`pnpm ci` is the command specified in Esri's installation guide for its supplied host packages. Run it from the actual `server` / `client` folder, not from the widget. Keep the host's supplied package-manager configuration.

If your host is already installed and working, you do not need to repeat its base installation merely to add this widget.

## 3. Put the widget in the correct folder

Copy the current widget source to:

```text
<Experience Builder>/client/your-extensions/widgets/mapillary-explorer/
```

Directly inside that folder you should see:

```text
manifest.json
config.json
icon.svg
src/
tools/
```

Avoid a second nested `mapillary-explorer` directory. A current source checkout already includes the implemented changes; new users do not apply historical feature installers.

## 4. Install the widget's extra dependencies

Return to the host's **`client` directory**. Do not run these commands from the widget folder or from `server`.

**Experience Builder 1.20:**

```sh
npm install --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0
```

**Experience Builder 1.21:**

```sh
pnpm add --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0
```

If pnpm specifically reports `ERR_PNPM_ADDING_TO_ROOT`, you are in a pnpm workspace root. Confirm this is the intended host `client` package, then explicitly target that root:

```sh
pnpm add --workspace-root --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0
```

Do not bypass this by disabling root checks globally. If pnpm says the directory is not a workspace, use the ordinary `pnpm add` command above instead.

These exact dependency versions were checked on 14 November 2026. `--save-exact` records reproducible versions in the host package. Keep its updated `package.json` and lockfile: `package-lock.json` for the npm installation, or `pnpm-lock.yaml` for the pnpm installation. Retain any additional files the host's own setup legitimately manages; do not manually convert or delete its supplied lockfiles.

The current source uses pbf 5's **`PbfReader`**. Old widget source with `import Pbf from 'pbf'` must be updated before using pbf 5. See the [runtime dependency reference](development/runtime-dependencies.md). Do not install separate React, ArcGIS SDK, or Jimu versions for this widget; the host owns them.

Check the installed dependencies in `client`:

**1.20:**

```sh
npm ls mapillary-js pbf @mapbox/vector-tile --depth=0
```

**1.21:**

```sh
pnpm list mapillary-js pbf @mapbox/vector-tile --depth=0
```

## 5. Configure and start

Set your Mapillary access token in the widget's `manifest.json`, under `properties.mapillaryAccessToken`.

Start the host's server and client in separate terminals and leave both running:

| Terminal directory | 1.20 | 1.21 |
|---|---|---|
| `server` | `npm start` | `pnpm start` |
| `client` | `npm start` | `pnpm start` |

`pnpm start` runs the host's existing start script. Esri's guide also shows `npm start`: running a script is different from using npm to install dependencies.

Open **https://localhost:3001/**, finish the host organization/Client ID setup if needed, and create or open an experience. Add Mapillary Explorer, connect its map widget and configure the tools in widget settings. Restart the client after adding a new extension folder. On your first run, check imagery opens and coverage hover/click works before configuring optional backends.

Places, Enterprise notes and collaboration workspaces have separate optional setup. Use the [documentation index](README.md); they are not prerequisites for basic Mapillary viewing.

## Moving your existing 1.20 test to 1.21

1. Keep the working 1.20 installation and app export as your comparison point.
2. Extract 1.21 into a separate directory and follow its Node/pnpm setup above.
3. Copy the **current widget source**, not the old host's `node_modules`, generated output or host package files.
4. In the **new** `client`, add the exact widget dependencies with pnpm.
5. Start the new host. Use Esri's supported [upgrade guidance](https://developers.arcgis.com/experience-builder/guide/upgrade/) for existing apps rather than overlaying the old host folder.
6. Verify the builder and published/preview behavior. Fix and test any SDK 5.1 differences before declaring 1.21 supported or changing the manifest's target version.

## Contributor checks

Keep host dependency changes with the host setup record. Widget source lives in this repository; it does not currently provide a standalone npm/pnpm package manifest. Do not run `npm init` merely to follow this guide, and do not add duplicate React or Jimu installations.

From the widget root, use the host's compatible TypeScript and dependencies as described in [Contributing](../CONTRIBUTING.md). The useful initial checks are:

```sh
node tools/check-repository.cjs
node tools/check-docs.cjs
node --test tests/vectorTileDecoding.test.cjs
```

With pnpm, resolve dependencies through their owning `client` package; do not rely on npm's old hoisting accidentally making an undeclared package available. If portable tests cannot find TypeScript, set `MAPILLARY_TYPESCRIPT` to the host's installed TypeScript module path. See the [test baseline](development/test-baseline.md) for existing fixture/dependency failures; a focused decoder pass does not establish a green full suite.

Run the build script actually provided by your host (`npm run` / `pnpm run` lists its scripts). For hosts providing `build:prod`, run `npm run build:prod` on 1.20 or `pnpm run build:prod` on 1.21 from `client`. After building, validate:

- Builder settings and preview, including a translated language.
- 2D and 3D imagery navigation, coverage hover/click, bearing cones and sequence selection.
- Detection outlines, point-cloud/custom viewer renderers and notes if enabled.
- Places tiles, picking, list filters and optional Portal/external service integration if offered.
- Desktop/mobile layout and the final deployed experience.

Record the host, Node.js, package manager, dependency versions, build outcome and acceptance results. A guide or successful dependency installation is not a compatibility certification.

## Troubleshooting

| Symptom | First check |
|---|---|
| npm install is rejected on 1.21 | Use pnpm 11 for that host; do not use the old npm dependency command there. |
| `ERR_PNPM_ADDING_TO_ROOT` | Verify you are in host `client`, then use the explicit workspace-root variant above. |
| Cannot find `pbf`, vector-tile or MapillaryJS | Install all three in the host's actual `client`; check the version list and restart the client. |
| pbf has no default export | Update the widget's reader imports; the source and dependency generation do not match. |
| Widget not listed | Check directory nesting, manifest parsing and client build errors; restart after adding the folder. |
| 1.20 works but 1.21 fails | Keep the first meaningful compiler/browser error and host details. Investigate SDK/host changes instead of repeatedly switching package managers. |
