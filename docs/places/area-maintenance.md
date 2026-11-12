# Choose an area and keep Places data up to date

An administrator saves an area once, then reuses it to prepare later Overture releases. The viewer continues to use Places normally. No coordinates, import controls or hosting settings are added to the viewer panel.

**Search this area** reads the currently published dataset. **Refresh** in the helper downloads and prepares a newer dataset; it does not publish it or change the experience.

Examples use `istanbul-operations.places-area.json`. Replace it with your downloaded filename, such as `test.places-area.json`. Replace sample releases with the dated release printed by your helper, and replace example Portal URLs with your actual published URLs.

## Portal workflow at a glance

Follow this order for a new area or release:

1. Frame the area in the map and save its profile.
2. Activate your ordinary Python environment; run `check`, then `refresh`.
3. Open `changes.html` and review the prepared data.
4. Upload the final `places.geojson` to Portal, publish its hosted query layer and copy the URL ending in `/FeatureServer/0`.
5. Run `build_portal` in ArcGIS Pro. It runs native packaging, attribute restoration, icon styling and cluster preparation together.
6. Publish the final VTPK, test the new tile/query pair, then update the experience to that pair.
7. Run `mark-published` after the experience has switched successfully.

The ordinary Python environment handles downloading and comparison. ArcGIS Pro's Python environment handles native packaging; Pro is currently required for each new Portal dataset release. Use the printed final paths, not temporary staging folders.

## 1. Choose the area without typing coordinates

In Experience Builder:

1. Select the map used by Mapillary Explorer and switch it to **2D**.
2. Use the map's normal address/place search to find your city or operating area. Pan and zoom until the desired rectangle is visible.
3. In the widget settings, expand **Nearby Places · Overture → Data preparation**.
4. Give the area a useful name, such as **Istanbul operations**.
5. Click **Use this map area**. A contrasting dashed green/white boundary appears over the map. The map position, zoom and saved coordinates stay unchanged. Review it; if necessary, frame the map again and click the button again.
6. Click **Save area profile**. Move the downloaded `istanbul-operations.places-area.json` into a stable working folder before preparing data. A short Windows path such as `C:\Places` is useful for Pro packaging.

Commands below run from the widget root and show a relative profile filename for brevity. If the profile is in `C:\Places`, use `--profile "C:\Places\istanbul-operations.places-area.json"` instead. Output folders resolve beside the profile, not beside the script. Keep the profile and its output folder together.

The profile contains a name, WGS84 bounding box, source mode, release policy, relative output folder and record limit. It contains no Portal URLs, tokens, certificates or passwords. The existing Source selection chooses Portal or external preparation. Changing the map later does not change the saved profile. **Show saved area** redraws the saved boundary without moving the camera or recapturing the area. If you zoom inside it or pan away, the map badge says Inside saved area or Saved area is outside this view. Pan/zoom normally to see the boundary again. Closing the preparation section/removing the setting panel removes its temporary rectangle.

Each profile represents a rectangular download area. A boundary polygon is converted to its enclosing rectangle; this workflow does not clip places to an irregular administrative boundary. Date-line-crossing areas must be split. The map tool accepts WGS84/Web Mercator 2D views.

### Without Builder access

The Python helper does not require Builder credentials. Export a rectangle or boundary as **WGS84 GeoJSON** from your GIS tool, then run:

```bat
python tools/overture_places/places_area.py init --profile istanbul-operations.places-area.json --name "Istanbul operations" --boundary operation-boundary.geojson --source portal
```

Use `--source external` for the external service. The boundary must contain one Polygon/MultiPolygon feature. The helper computes the bounding box for you. Administrators who already know a rectangle can use `--bbox=west,south,east,north` instead.

## 2. Register data you already published (optional)

For an existing installation such as the Indianapolis test, you can keep its exact original area and establish a comparison baseline without downloading that release again.

Locate the **manifest from the original export**, then create the profile from it:

```bat
python tools/overture_places/places_area.py init --profile indianapolis.places-area.json --name "Indianapolis operations" --manifest places-all.manifest.json --source portal
```

Register the original full GeoJSON or GeoJSONL and its matching manifest:

```bat
python tools/overture_places/places_area.py adopt --profile indianapolis.places-area.json --input places-portal.geojson --manifest places-all.manifest.json --published
```

Replace the filenames with yours. GeoJSONL-to-GeoJSON conversion did not create a second manifest, so the original export manifest may have a different filename from the converted GeoJSON. The helper verifies the rectangle, record count, release, unfiltered status and identities before adopting it. It leaves the original files unchanged.

`--published` records **your declaration** that this exact snapshot is already deployed. It performs no Portal request or publication. Omit it if you only want a local comparison baseline. Do not use a 50-place package probe as a full regional source. If the original manifest is missing, create a new area profile and prepare a first snapshot instead of guessing its original bounds.

## 3. Install the downloader requirements once

Run from the widget root using ordinary Python 3.10 or later. Install the downloader requirements once in the environment you intend to use. Choose your existing environment or create a new one below.

### Windows Command Prompt and virtual environments

If you already have a working virtual environment, activate it in its existing location:

```bat
C:\path\to\your-venv\Scripts\activate.bat
python -m pip install -r tools/overture_places/requirements.txt
```

Replace that path with your actual venv path. Do not move the area profile into the venv. Its data folder is resolved beside the profile regardless of which Python environment you activate.

For a fresh environment, run these once from the widget root:

```bat
python -m venv tools\overture_places\.venv
tools\overture_places\.venv\Scripts\activate.bat
python -m pip install -r tools/overture_places/requirements.txt
```

In a new Command Prompt session, activate the environment again before running the helper. The prompt normally shows `(.venv)` or `(venv)`. These commands are for ordinary downloading/comparison; use Pro's Python window/environment for `build_portal`.

DuckDB reads the selected region from Overture's public Parquet data. You do not manually locate or download Parquet files, install a database server, or run this download inside the browser. Initial use also loads DuckDB's Spatial/HTTPFS extensions. Public catalog/storage and extension downloads require network access.

## 4. Check releases, then prepare the saved area

```bat
python tools/overture_places/places_area.py check --profile istanbul-operations.places-area.json
```

This reports:

- The release you last recorded as published.
- Releases already prepared locally.
- The newest release listed in Overture's public catalog.

For a first run, `published_release: null` means no publication has been recorded for this profile, and `prepared_releases: []` means no snapshots have been prepared by this helper. `newer_than_published: true` with no recorded publication is not proof that your currently served data is old.

`published_release` is local administrative bookkeeping, not a live service inspection. Use the builder connection test and the widget's Connected release to verify the actual deployment.

To download and prepare the newest listed release for the saved rectangle:

```bat
python tools/overture_places/places_area.py refresh --profile istanbul-operations.places-area.json
```

`prepare` is an alias for the same operation. The profile's default `release: "latest"` is resolved once and saved as a dated snapshot. Repeating it for an already prepared, unchanged release reuses that snapshot. It does not repeatedly download the same release or switch the live service.

To pin a specific available release:

```bat
python tools/overture_places/places_area.py refresh --profile istanbul-operations.places-area.json --release 2026-10-21.0
```

The date is an example. Use a release reported by `check` or `releases`. A pinned release avoids catalog lookup, but its data download still needs Overture storage access. Future source-schema changes can require an exporter update; release discovery alone does not certify schema compatibility.

### Catalog access

The official catalog is <https://stac.overturemaps.org/catalog.json>. To list its dated releases directly:

```bat
python tools/overture_places/places_area.py releases
```

If your network allows browser access but not the script, save that catalog as `catalog.json` and use `--catalog catalog.json` with `releases`, `check`, or `refresh`. This changes release discovery only; it does not make the data download offline. An already downloaded matching Parquet file can be supplied using `refresh --input-parquet file.parquet --release DATED_RELEASE`.

## 5. Review the prepared snapshot

For a Portal profile, output is anchored beside the profile:

```text
places-data/istanbul-operations/portal/releases/RELEASE/
  places.geojson
  places.manifest.json
  preparation.json
  changes.json
  changes.html
```

An external profile uses its own `external` folder and creates `places.geojsonl` plus `places.sqlite`. The two publishing modes do not overwrite each other.

The final helper result prints `folder`, `source_path` and `changes_report` as full paths. Open `source_path` for the data to upload, and `changes_report` for the HTML report. With older helper versions, the export message could mention a `.places-refresh-...` folder: that was temporary staging and must not be used for upload. The updated wrapper suppresses that misleading message. Your first snapshot lists every place as added because it has no comparison baseline.

Open **changes.html** for added/removed/changed/unchanged totals and up to 100 examples per change type. **changes.json** contains all changed IDs/field names, aggregate field counts and the bounded before/after examples. Confidence, name, category, status, address, website and location changes are compared. A different `data_release` alone does not mark every place changed.

The default baseline is the last locally recorded publication. If none is recorded, the newest complete local snapshot is used. `refresh --compare-to DATED_RELEASE` explicitly selects another prepared baseline in the same area when first preparing that release. Existing reports are immutable. The first snapshot has no baseline and is identified as such.

**Prepared is not published.** A failed export/import does not replace a previous release. Source/database hashes are checked before reuse or recording publication. Changing the area's rectangle requires a new profile/output folder; it must not produce a misleading comparison against the old area.

The default regional limit is 25,000 places. You may set `max_features` in the profile up to 100,000. Over-limit exports fail rather than silently truncating. Larger operations should use deliberately chosen regional areas; this helper does not establish national/global capacity. Retain old release folders for rollback; deletion is never automatic.

## 6A. Publish through Portal

For each refreshed release:

1. Upload that release's **places.geojson** and publish its matching hosted query layer as described in the [Portal guide](portal-administrator-guide.md). Copy its actual `/FeatureServer/0` URL.
2. In ArcGIS Pro's Python window, run the helper below. It builds the complete native package, restores attributes, embeds the category icons and adds filtered overview counts/zoom coverage in sequence.

```python
import os, runpy
os.chdir(r"C:\path\to\mapillary-explorer")
workflow = runpy.run_path("tools/overture_places/places_area.py")
workflow["build_portal"](
    "istanbul-operations.places-area.json",
    "2026-10-21.0",
    "https://portal.example.com/server/rest/services/Hosted/Places_NewRelease/FeatureServer/0"
)
```

Replace the folder, release and URL. Use the **new release's matching query URL**, not the previous release's layer. This uses the existing Pro package workflow, with the currently open project (`CURRENT`) by default. It does not sign in, publish, save your project or modify existing map layers. In Pro's Python environment, the equivalent CLI is:

```bat
python tools/overture_places/places_area.py build-portal --profile istanbul-operations.places-area.json --release 2026-10-21.0 --query-url https://portal.example.com/server/rest/services/Hosted/Places_NewRelease/FeatureServer/0 --project "C:\path\to\project.aprx"
```

A successful build prints its exact output folder. Publish **portal-build/places-portal-overview.vtpk**, test it in Map Viewer, and test both new service URLs in Builder. Update the experience to the matching new pair together. Keep the previous pair available for rollback.

### An existing build or upload name

There are two different cases:

- **Python reports that the build folder already exists:** keep it and rerun the same call with an unused build name:

  ```python
  workflow["build_portal"](
      "istanbul-operations.places-area.json",
      "2026-10-21.0",
      "https://portal.example.com/server/rest/services/Hosted/Places_NewRelease/FeatureServer/0",
      build_name="portal-build-2"
  )
  ```

  The new package is under `portal-build-2/places-portal-overview.vtpk`. The CLI equivalent adds `--build-name portal-build-2`. Existing files are never overwritten.

- **Portal upload reports that a file/item name already exists:** use a unique upload/item/service name. You do not need to rebuild the data for a naming conflict. If a different local filename is necessary for upload, make a copy:

  ```bat
  copy "places-data\istanbul-operations\portal\releases\2026-10-21.0\portal-build\places-portal-overview.vtpk" "places-istanbul-20261021.vtpk"
  ```

  Adjust the path to your printed build folder. Keep the original generated package in that folder: `mark-published` verifies it against the build report. Copy the actual published service URL from the new Portal item; do not derive it from the filename.

A failed packaging attempt retains its diagnostic files. Portal publication and device/3D validation remain separate steps.

After publication and the experience switch are complete:

```bat
python tools/overture_places/places_area.py mark-published --profile istanbul-operations.places-area.json --release 2026-10-21.0
```

This records the release locally for the next comparison. It does not publish anything. Publication history is retained under the profile's output folder.

## 6B. Switch the external service

The refresh already creates and integrity-checks the new release's **places.sqlite**.

1. Review the report and test the prepared database.
2. Stop the running Places service.
3. Change only `database` in your existing service JSON to the new database path. Paths in that JSON remain relative to the service JSON file. Keep your working HTTPS/certificate/origin configuration.
4. Restart using the same serve command, test connection, and reload the experience. Its API URL can remain the same.
5. Run `mark-published` for the new release using your external profile.

Rollback selects the previous database path, restarts, then records the previous release. See the [external service guide](administrator-guide.md) for service operation details.

## What is automated, and what could be automated next?

| Step | Available now |
|---|---|
| Select the area | Administrator uses the map once and saves a profile. |
| Discover/download a release | `check` and `refresh` use the saved profile. |
| Compare data and prepare files | Automatic during refresh; external mode also builds its SQLite database. |
| Build the Portal package | One `build_portal` call sequences the native Pro build, attributes, icons and clusters. Pro still runs the native build. |
| Upload/publish Portal items | Manual by default; the optional publisher automates a new private pair. |
| Test and switch the experience | Administrator reviews and tests the matching service pair before switching. |
| Record publication | Explicit local `mark-published` command. |

An optional [Pro-session publishing script](optional-publishing.md) now automates the Portal uploads, query publication, package build, tile publication and hosted checks. It uses a read-only plan followed by an explicit publish call, creates a new private pair and returns both URLs for review. It does not switch the experience or record publication. No toolbox or additional widget setting is required; the manual steps above remain available.

Pro remains installed/licensed on the publishing computer. This version runs from Pro's Python window; scheduling/headless operation is not provided. The optional script has fixture/resource validation, while real authenticated publication still requires a deployment test.

## Verification scope

Automated tests cover profile/rectangle validation, active-map ownership, asynchronous selection cleanup, credential-free downloads, release parsing, local snapshots and actual SQLite imports, change detection, idempotence, failed preparation, adoption of existing snapshots and ordered Portal pipeline orchestration. Portal pipeline tests inject the Pro builder; native ArcGIS Pro execution still requires your deployment.

The development environment could not reach the live catalog because its network proxy rejected the connection. Discovery is tested against catalog fixtures covering dated STAC child links and the existing `latest` field, with a local catalog fallback. The administrator has since confirmed live catalog discovery and preparation of a 10,740-place Portal snapshot for release 2026-10-21.0. That confirms this download path in their environment; future source schemas and the real Portal upload/build/publish steps still require deployment checks.
