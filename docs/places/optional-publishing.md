# Optional Portal publishing script

`tools/overture_places/publish_places_portal.py` is an **optional administrator script**. The manual [area maintenance workflow](area-maintenance.md) remains available. Nothing in the widget runs this publisher automatically, and it adds no toolbox, viewer button, browser credential setting or external hosting service.

It runs in **ArcGIS Pro's Python window** on the administrator's computer. Pro remains responsible for the native vector tile build. It uses the account already signed into the explicitly selected Portal through `GIS("pro")`; it does not ask you to copy a token or save a password.

## What the script does

After you explicitly publish a plan, it:

1. Creates a uniquely named folder and uploads a verified copy of the prepared GeoJSON.
2. Publishes a **new private hosted query layer** and checks its schema, complete count, release and sample attributes/location.
3. Runs the existing full-source Pro build, attribute restoration, category icon and overview-cluster tools using the new query URL.
4. Uploads a verified copy of the VTPK and publishes a **new private vector tile service**.
5. Checks hosted tile metadata, release/query pairing, cluster metadata, icon assets and a real sample tile's attributes.
6. Writes **connection.json** containing both widget URLs, plus a local publication report and returned Portal item IDs.

Existing services/items are retained. The script never overwrites a service, deletes content, makes items public, edits an experience or calls `mark-published`. You review and test the new pair before changing the live experience.

## Requirements

- A **Portal** area profile and a completed `refresh` for a pinned release. External-service profiles keep using their existing workflow.
- An installed/licensed ArcGIS Pro with a project open. This version's supported route is the interactive Pro Python window, using `CURRENT`. It is not a scheduled/headless publishing setup.
- Pro signed into the intended Portal with permission to create content, publish hosted feature layers and publish hosted tile layers. The script only creates content for that signed-in account.
- A compatible ArcGIS API for Python exposing `GIS("pro")`, `ItemProperties`, `content.folders`, `session` and item sharing APIs. Public API signatures were checked against **2.4.4**. Planning checks the needed interfaces. If unavailable in your Pro environment, use a compatible environment or the manual workflow; the ordinary downloader venv is not a replacement for Pro.
- Working Portal/service HTTPS trust in Pro's Python environment. Certificate validation remains enabled.

Do not store a password, token, client secret or certificate in the area profile or publication plan. The plan/report contains ordinary Portal URLs, account name, names/IDs and hashes; authentication stays in the SDK session.

## 1. Prepare your data as usual

In your ordinary Python environment, use your existing profile:

```bat
python tools/overture_places/places_area.py check --profile test.places-area.json
python tools/overture_places/places_area.py refresh --profile test.places-area.json
```

Review the returned `changes_report` and note the pinned release. The examples below use `2026-10-21.0`; replace it if your prepared release differs. The publisher does not silently download another release.

If you already uploaded the query data manually, you can finish that manual build instead. This optional publisher deliberately creates a fresh pair rather than adopting/replacing arbitrary existing Portal items.

## 2. Open Pro and select the Portal session

1. Open a project in ArcGIS Pro.
2. Use Pro's normal Portal/sign-in controls to select and sign into the intended Portal.
3. Open **View → Python Window**.

The Portal URL supplied to the script must match the active Portal shown by Pro. Use its root, such as `https://portal.example.com/portal`, without `/sharing/rest`, an app/item path, credentials or token parameters. A browser's Portal login alone does not establish Pro's session.

## 3. Create and review a plan (no Portal content writes)

```python
import os, runpy
os.chdir(r"C:\path\to\mapillary-explorer")
publisher = runpy.run_path("tools/overture_places/publish_places_portal.py")

plan = publisher["create_plan"](
    "test.places-area.json",
    "2026-10-21.0",
    portal_url="https://portal.example.com/portal"
)
```

Replace the folder, profile, release and Portal URL. Use a full profile path if it lives elsewhere.

This verifies the local snapshot, checks the active account and available query-service name, and prints the account/Portal. It creates a **local** `publication-plan.json`, not Portal content. Review that file: it identifies the area source hash, source count, new names, private sharing and the policy to retain existing services. Planning must not report an unexpected account or Portal.

Local plan/report location:

```text
<area output>/releases/<release>/publishing/<unique run ID>/
```

Names include a unique suffix. Each new plan has its own Portal folder, service names and short Pro build folder, so earlier builds/upload names do not need to be deleted.

## 4. Explicitly publish that plan

After reviewing it, run:

```python
result = publisher["publish_plan"](plan["plan_path"])
```

This call **creates Portal content**. Progress is printed at stage boundaries. Pro packaging/uploading may take several minutes. Keep Pro open and signed into the same Portal/account.

The script verifies that the profile/source still match the plan. Upload copies are retained in the run folder. The built package remains in its own short `pp_<unique suffix>` folder under the release. A local report is updated as stages complete and item IDs become known.

A successful result has:

```text
status: ready_for_review
experience_changed: false
publication_recorded: false
```

For the URLs:

```python
print(result["connection_file"])
```

Open that **connection.json**. It contains:

```json
{
  "placesSource": "portal",
  "placesPortalTilesUrl": "https://server.example.com/server/rest/services/Hosted/NEW_TILES/VectorTileServer",
  "placesPortalQueryUrl": "https://server.example.com/server/rest/services/Hosted/NEW_QUERY/FeatureServer/0"
}
```

The actual URLs come from the published items; the query layer number is discovered instead of assumed. No token is included.

## 5. Review, share and connect

1. Open the new vector tile item in Portal Map Viewer and test its overview/close-zoom appearance.
2. Review both service items' sharing. The script verifies them as **private**. Share **both published services** with the intended experience audience using your Portal's normal controls; source-file/package items can remain private.
3. Put the two returned URLs into the widget's Portal source settings and run **Test connection** using an account with access.
4. Test categories, confidence/closed filters, clusters, picking, nearby imagery and notes on your deployment. Complete the required 2D/3D and mobile checks.
5. Publish the updated experience with the matching pair. Retain the old pair for rollback.
6. Only after the experience is switched, record that release locally:

   ```bat
   python tools/overture_places/places_area.py mark-published --profile test.places-area.json --release 2026-10-21.0
   ```

The signed-in publisher seeing the data does not prove another viewer has access. The script therefore stages a new pair rather than silently changing sharing or switching the app for everyone.

## Failure, cancellation and retries

- Inspect **publication-report.json**. It records the stage, safe failure type and returned item IDs, without raw SDK error text or authentication material. `new_item_verified: false` means the item was returned/pending but did not complete new-item/privacy verification; inspect it before taking any manual action.
- Partial new items/build files are retained. Existing live services and the experience are unchanged. There is no automatic deletion or automatic retry of writes.
- A timed-out/interrupted upload or publishing job may continue on the server. Inspect the new folder, planned service names and Portal jobs before starting another attempt.
- A started plan cannot be published twice. For a deliberate new attempt, create a new plan, then explicitly publish it. Do not delete its started marker to force a rerun.
- `validation_timeout` controls read-only hosted readiness polling, defaulting to 600 seconds. It does not override the SDK's upload/job processing behavior. If your cache import needs longer, use `publish_plan(plan["plan_path"], validation_timeout=1200)` on the initial run.
- Wrong schemas, mixed releases, source/package changes, missing tile definitions and mismatched samples stop the run before a connection file is issued. Portal policies such as mandatory metadata/classification may require manual publication or an administrator-specific extension.
- Keep the original plan, profile and prepared files in their locations. If you change the profile/source, create a new plan.

## Verification status

The sequence, failure handling, privacy checks, no-overwrite behavior, changed-account/Portal guards and retry protection are covered by protocol fixtures. The validator also passed against extracted resources from the real 7,089-place package, including icons, cluster contract and a sample tile. Those checks do not publish to a live Enterprise site.

The ArcGIS Python API 2.4.4 source was inspected for the public folders, item properties, sharing, session and asynchronous publish interfaces. This development environment has no licensed Pro/Portal session; **the first real authenticated publication remains a deployment acceptance test**. Keep the current working service pair until that test succeeds. The manual guide remains the supported alternative throughout.
