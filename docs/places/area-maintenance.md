# Download and update your Places area

Follow this guide once to download your area. Later, reuse the saved profile to get a newer release. **Downloading prepares files on your computer; publishing makes them available to viewers.**

These Windows examples run from the widget folder containing `src` and `tools`. Use **Command Prompt** for the downloader and **ArcGIS Pro's Python window** only when the publishing guide asks. macOS/Linux users can use `python3`, a local profile path and `.venv-places/bin/python`.

## 1. Save the area you want

1. In Experience Builder, select Mapillary Explorer and use its connected **2D map** to find your area. Pan and zoom until the desired area fills the map.
2. In widget settings, open **Nearby Places · Overture**. Choose **ArcGIS Portal** as the source.
3. Open **Data preparation**, enter an area name such as **My area**, and click **Use this map area**.
4. Review the dashed boundary. Reframe the map and click again if needed. Capturing or showing the area does not change the map's zoom.
5. Click **Save area profile**. Create `C:\Places` and move the downloaded profile there. For these examples, name it **`my-area.places-area.json`**.

Use your actual filename if different. Keep the profile in a stable folder, outside your Python environment. Data is saved **beside this profile**, even when the commands run from the widget folder.

The profile saves a rectangle, source choice and download settings. It contains no credentials. Changing the map later does not change the file. To download a different area, save a new profile.

**No Builder access?** Export your boundary as a WGS84 GeoJSON Polygon/MultiPolygon from your GIS tool, then create a profile from it:

```bat
python tools/overture_places/places_area.py init --profile C:\Places\my-area.places-area.json --name "My area" --boundary C:\Places\boundary.geojson --source portal
```

The download covers the boundary's enclosing rectangle. It does not clip to an irregular boundary.

## 2. Install the downloader once

Install Python **3.10 or later** if needed. In Command Prompt, go to your widget folder:

```bat
cd /d "C:\path\to\mapillary-explorer"
python -m venv .venv-places
.venv-places\Scripts\activate.bat
python -m pip install -r tools/overture_places/requirements.txt
```

Replace the example widget path with your installation. Already have a working environment? Activate it and run only the requirements command. Do not create another environment unnecessarily.

In a new Command Prompt, return to the widget folder and activate the environment again:

```bat
.venv-places\Scripts\activate.bat
```

This installs DuckDB for downloading public Overture data. You do not need a database server or to find Parquet files yourself. The computer needs internet access to Overture and DuckDB's extension downloads.

## 3. Check and download

```bat
python tools/overture_places/places_area.py check --profile C:\Places\my-area.places-area.json
python tools/overture_places/places_area.py refresh --profile C:\Places\my-area.places-area.json
```

`check` lists available releases. On a first run, `published_release: null` and an empty `prepared_releases` list are normal.

`refresh` downloads and prepares the release selected by the profile. A normal new profile uses the latest listed release. The result prints its exact dated **release**, **folder**, **source_path** and **changes_report**. Keep that release identifier for publishing.

For a particular available release, add `--release`:

```bat
python tools/overture_places/places_area.py refresh --profile C:\Places\my-area.places-area.json --release 2026-10-21.0
```

The date here is an example. Use a release reported by `check`. Repeating an unchanged, already prepared release reuses it.

## 4. Review the files

Open the printed **changes_report** (`changes.html`) in your browser. It shows added, removed and changed places. The first download shows all places as added because there is no earlier snapshot to compare.

For a Portal profile, the folder looks like this:

```text
C:\Places\
  my-area.places-area.json
  places-data\my-area\portal\releases\RELEASE\
    places.geojson           upload this data to Portal
    places.manifest.json     keep with the data
    preparation.json         preparation record
    changes.html             open this report
    changes.json             detailed changes
```

Use the **printed final paths**. Do not use a `.places-refresh-...` temporary folder. Keep the profile, reports, source and previous releases together.

The default limit is 25,000 places. If the helper says the area is too large, choose a smaller area, or deliberately raise `max_features` in the profile up to **100,000**. The helper refuses an incomplete download. This regional workflow does not currently prepare a whole-country/global dataset.

## 5. Publish the prepared release

Continue with **[Publish through Portal](portal-administrator-guide.md)**. It includes one Pro build call for attributes, icons and overview counts; you do not run separate patch tools.

If you want to automate publication, the **[optional publishing script](optional-publishing.md)** is an alternative to those manual publishing steps. It still requires ArcGIS Pro.

For an **external** profile, `refresh` creates `places.geojsonl` and `places.sqlite` under its `external` folder. Continue with the [external service guide](external-service.md).

## Update your data later

1. Activate your downloader environment in Command Prompt.
2. Run the same `check` and `refresh` commands from step 3. Use the same profile and rectangle.
3. Review the new `changes.html`. By default, it compares with the locally recorded published release, or the newest local snapshot when none is recorded.
4. Publish the new release using the same Portal guide or optional script. Use **new service names** and the new release's matching query URL. Pro is needed again to build the new native tile package.
5. Test the new pair, then update **both** widget URLs and publish the experience. Keep the previous services for rollback.
6. After the experience successfully uses the new pair, record its release:

```bat
python tools/overture_places/places_area.py mark-published --profile C:\Places\my-area.places-area.json --release 2026-10-21.0
```

Replace the example release with the one you actually deployed. This command only updates your local record for the next comparison; it does not publish data or inspect the live services.

For rollback, restore the previous matching URLs and republish the experience, then record that previous release locally. No old files or services are deleted automatically.

If you already published data before creating a profile, see [register an existing snapshot](../development/places-packages.md#register-an-existing-snapshot). For an error, use [troubleshooting](troubleshooting.md).
