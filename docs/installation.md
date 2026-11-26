# Install Mapillary Explorer

This guide is for people adding the widget to **Experience Builder Developer Edition** and contributors running its source. People viewing an already published experience do not install Node.js or packages.

The repository is a widget, not a standalone app. Install and run the Experience Builder host first; keep its `client` and `server` directories separate from this widget.

## 1. Check the requirements

The current development and installer-testing target is **ArcGIS Experience Builder Developer Edition 1.21**. The widget manifest declares `exbVersion: 1.21.0`. Use Node.js 24 and pnpm 11 with this host, which supplies React 19 and ArcGIS Maps SDK 5.1.

Follow [Esri's installation guide](https://developers.arcgis.com/experience-builder/guide/install-guide/) and check its [release matrix](https://developers.arcgis.com/experience-builder/guide/release-versions/) if installing a different host version.

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

```sh
pnpm ci
```

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

Avoid a second nested `mapillary-explorer` directory. Use the current source checkout.

Keep **`src/runtime/assets`** with the source. It contains the bundled traffic-sign and object sprites. Experience Builder copies it to **`dist/runtime/assets`** during compilation. Deploy the full widget build, including this directory; copying only `widget.js` omits the icons. The widget resolves assets through its own `context.folderUrl`, so no sprite-service URL or GitHub access is needed. For cross-origin widget hosting, allow the experience's origin to load the widget's PNG/JSON assets. See [sprite maintenance and deployment checks](development/sprites.md).

## 4. Install the widget's extra dependencies

Install into the host's **`client` package**. A package command targets your current directory; opening a new terminal may put you in your user folder instead. Do not run it from the widget, `server`, Desktop or your user folder.

### Confirm the directory before installing

For **Windows CMD**, replace this example path with your real installation path:

```bat
cd /d "C:\path\to\arcgis-experience-builder-1.21\client"
```

In PowerShell use `Set-Location "C:\path\to\arcgis-experience-builder-1.21\client"`; on macOS/Linux use `cd /path/to/experience-builder/client`. From the standard widget folder, `cd ../../..` also reaches its owning client.

Then run this check **before installing dependencies**:

```sh
node -e "const p=require('./package.json'); if(p.name!=='exb-client') throw new Error('STOP: open the Experience Builder client folder'); console.log(process.cwd()); console.log(p.name+' '+p.version)"
```

Continue only if the printed path is the intended installation's `client` folder and the package is `exb-client` at the expected version. If it fails, correct the directory first; do not run `npm init` or create a new package in that location.

### Install with pnpm

```sh
pnpm add --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

If pnpm specifically reports `ERR_PNPM_ADDING_TO_ROOT`, you are in a pnpm workspace root. Confirm this is the intended host `client` package, then explicitly target that root:

```sh
pnpm add --workspace-root --save-exact mapillary-js@4.1.2 pbf@5.1.2 @mapbox/vector-tile@3.0.0 pako@2.2.0
```

Do not bypass this by disabling root checks globally. If pnpm says the directory is not a workspace, use the ordinary `pnpm add` command above instead.

Install pako as a direct dependency so the fallback resolves in pnpm. `--save-exact` records reproducible versions in the host package. Keep its updated `package.json` and lockfile: `pnpm-lock.yaml`. Retain any additional files the host's own setup legitimately manages; do not manually convert or delete its supplied lockfiles.

The current source uses pbf 5's **`PbfReader`**. Old widget source with `import Pbf from 'pbf'` must be updated before using pbf 5. See the [runtime dependency reference](development/runtime-dependencies.md). Do not install separate React, ArcGIS SDK, or Jimu versions for this widget; the host owns them.

Check the installed dependencies in `client`:

```sh
pnpm list mapillary-js pbf @mapbox/vector-tile pako --depth=0
```

All four packages should be listed as direct dependencies of **this `exb-client` package**, with the reviewed versions. Keep its `package.json` and lockfile together when sharing the host setup.

### If the widget works but dependencies appear missing

Node searches parent `node_modules` folders when it cannot find a package locally. For example, a client under Desktop can accidentally use `C:\Users\YourName\node_modules`. That is an ordinary ancestor installation, not proof the packages were installed in the client. A running application may work on your machine while a clean installation elsewhere fails.

From the verified client directory, check both declaration and resolution:

```sh
node -e "const p=require('./package.json'); for(const n of ['mapillary-js','pbf','@mapbox/vector-tile','pako']) console.log(n+': '+(p.dependencies?.[n]||'NOT declared in this client'))"
node -e "for(const n of ['mapillary-js','pbf','@mapbox/vector-tile','pako']) { try { console.log(n+': '+require.resolve(n)) } catch { console.log(n+': NOT FOUND') } }"
```

`pnpm list --depth=0` shows direct package declarations; `require.resolve` shows what Node can actually find, including ancestors. Neither alone explains the whole setup. With pnpm, resolved paths can include symlinks and its virtual store, so compare declarations and package-manager output as well as paths.

If the client declares only some packages and the others resolve from an ancestor, run the appropriate install command above **from the confirmed client** to declare all four there. You do not need to delete the ancestor installation; other projects may use it. Restart the development client after changing dependencies so the result does not depend on a previous in-memory compilation.

The isolated checker currently checks its selected dependency folder and the client's `node_modules`; it does not follow every ancestor searched by Node. Its “Missing” message means the package was not found in those checked folders. For diagnosing an existing ancestor-based setup, you can supply its reviewed folder explicitly with `--dependencies "C:\Users\YourName\node_modules"`. This allows a diagnostic build, but does not make the client dependency declaration reproducible.

## 5. Configure and start

Set your Mapillary access token in the widget's `manifest.json`, under `properties.mapillaryAccessToken`.

Start the host's server and client in separate terminals and leave both running:

```sh
pnpm start
```

`pnpm start` runs the host's existing start script. Esri's guide also shows `npm start`: running a script is different from using npm to install dependencies.

Open **https://localhost:3001/**, finish the host organization/Client ID setup if needed, and create or open an experience. Add Mapillary Explorer, connect its map widget and configure the tools in widget settings. Restart the client after adding a new extension folder. On your first run, check imagery opens and coverage hover/click works before configuring optional backends.

Places, Enterprise notes and collaboration workspaces have separate optional setup. Use the [documentation index](README.md); they are not prerequisites for basic Mapillary viewing.

## Move an existing app to 1.21

Install 1.21 in a separate folder and copy the current widget source. Follow [Esri's upgrade guide](https://developers.arcgis.com/experience-builder/guide/upgrade/) to move your app, then verify the builder and published experience before replacing your existing deployment.

## Contributor checks

Keep host dependency changes with the host setup record. Widget source lives in this repository; it does not currently provide a standalone npm/pnpm package manifest. Do not run `npm init` merely to follow this guide, and do not add duplicate React or Jimu installations.

From the widget root, use the host's compatible TypeScript and dependencies as described in [Contributing](../CONTRIBUTING.md). The useful initial checks are:

```sh
node tools/check-repository.cjs
node tools/check-docs.cjs
node --test tests/runtimeDependencies.test.cjs
```

With pnpm, resolve dependencies through their owning `client` package; do not rely on npm's old hoisting accidentally making an undeclared package available. If portable tests cannot find TypeScript, set `MAPILLARY_TYPESCRIPT` to the host's installed TypeScript module path.

Run the build script actually provided by your host (`pnpm run` lists its scripts). For hosts providing `build:prod`, run `pnpm run build:prod` from `client`. After building, validate:

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
| Cannot find `pbf`, vector-tile or MapillaryJS | Install all four in the host's actual `client`; check the version list and restart the client. |
| pbf has no default export | Update the widget's reader imports; the source and dependency generation do not match. |
| Widget not listed | Check directory nesting, manifest parsing and client build errors; restart after adding the folder. |
