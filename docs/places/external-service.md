# Use an external HTTPS Places service

This is an **alternative** to Portal for administrators who manage a web server. For most Portal users, follow [Publish through Portal](portal-administrator-guide.md) instead. The viewer has the same Places tools in either mode.

The external service uses Python and one local SQLite file. No ArcGIS Pro or separate database server is needed. You still need an HTTPS address reachable by your viewers, a trusted certificate and a host that keeps the process running.

## 1. Prepare the area

Follow [Download your area](area-maintenance.md), choosing **External Places service** before saving the profile. Use `--source external` if creating the profile from a boundary with Python.

The same `check` and `refresh` commands prepare:

```text
<area output>/external/releases/RELEASE/
  places.geojsonl
  places.manifest.json
  places.sqlite
  preparation.json
  changes.html
  changes.json
```

The database is already imported and checked. **You do not import it again.** Review `changes.html` and keep the printed database path. Keep `tools/overture_places` together when copying the tools to a service host.

## 2. Create the service configuration

From the widget folder in Command Prompt:

```bat
copy tools\overture_places\service.example.json places-service.json
```

Edit **places-service.json** with your actual values. This local-development example is not ready to paste without replacing the paths:

```json
{
  "database": "C:/Places/places-data/my-area/external/releases/2026-10-21.0/places.sqlite",
  "public_url": "https://localhost:3444",
  "host": "127.0.0.1",
  "port": 3444,
  "origins": ["https://localhost:3001"],
  "tls": {
    "cert": "C:/actual/certificate/server.cert",
    "key": "C:/actual/certificate/server.key"
  }
}
```

- **database:** the complete path printed by preparation. Use forward slashes in JSON Windows paths.
- **public_url:** the HTTPS base address viewers will reach.
- **host / port:** the address/port the Python service listens on. Loopback works for local use or a same-host proxy.
- **origins:** exact app origins, including scheme and port, without page paths. Include Builder and the published app when needed.
- **tls.cert / tls.key:** real certificate and private-key files on the service host. For development, locate your trusted Experience Builder server certificate. For deployment, ask your organization's web/server administrator for the appropriate files. These paths are not Portal URLs and the script does not issue certificates.

Relative paths resolve beside this JSON file. Keep service configuration and keys on the server; they are not public widget settings. CORS origins control browser access, not authentication.

## 3. Inspect and start

Use the service host's Python 3.10+ with SQLite R-tree support:

```bat
python tools/overture_places/places_service.py inspect --database "C:/Places/places-data/my-area/external/releases/2026-10-21.0/places.sqlite"
python tools/overture_places/places_service.py serve --config places-service.json
```

Replace the example database path/release. Leave the terminal running. Open:

```text
https://localhost:3444/health
https://localhost:3444/status
```

Check `ready: true`, the release and count. The browser must trust the certificate and hostname. Restart with the same serve command; no source import is needed. Ctrl+C stops it.

**For other devices:** `localhost` means that device, not your computer. Before sharing the app, host this service at a reachable address such as `https://maps.example.com/places`. Set the real `public_url` and app origins. Your administrator must arrange DNS, trusted HTTPS, routing/firewall access and process supervision. A reverse-proxy example and operational limits are in the [hosting reference](../development/places-service-contract.md#hosting-reference).

The service opens the database read-only. It does not download or update data during viewer requests. The supported regional preparation limit is 100,000 places; measure your audience's workload before expanding service scope.

## 4. Connect the widget

1. In **Nearby Places · Overture**, enable **Offer Places layer**.
2. Select **External Places service** and enter its **base URL**, such as `https://maps.example.com/places`.
3. Click **Test connection**, then enable Places in the viewer inside the downloaded area.
4. Check icons/counts, filters, search, place details, imagery and notes from a second device and your published mobile/desktop layouts.

Do not append `/health`, `/status`, `/style.json` or a service token. A FeatureServer/VectorTileServer address is not this external API.

For an already compiled app, edit the correct widget instance's served `config` object and redeploy it:

```json
{
  "enablePlaces": true,
  "placesSource": "external",
  "placesApiUrl": "https://maps.example.com/places"
}
```

Preserve other properties. Check which app configuration is actually served; editing widget-source `config.json` alone does not update a compiled app. These values do not go in `manifest.json`.

## Update or roll back

1. Run `check` and `refresh` with the saved **external** profile. Review the new changes report.
2. Keep the current database intact. Stop the service, change only `database` in the service JSON to the new release's file, and restart.
3. Check health/status and reload/test the app. The API URL and widget settings can stay the same.
4. Record the deployed release with `mark-published` as described in the [update guide](area-maintenance.md#update-your-data-later).

To roll back, stop, select the previous database, restart and reload clients. Record the previous release locally. There is a brief interruption; no automatic hot swap or file deletion is performed.

Have an existing GeoJSONL export or want the included sample? See [import an existing export](../development/places-service-contract.md#import-an-existing-export). For common failures, use [troubleshooting](troubleshooting.md).
