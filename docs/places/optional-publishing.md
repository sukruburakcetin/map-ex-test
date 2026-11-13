# Optional Portal publishing script

Use this **instead of the manual upload/build/publish steps** in the [Portal guide](portal-administrator-guide.md). Download your area with the [download guide](area-maintenance.md) first. This script is optional, has no toolbox and adds no widget controls.

It runs on your computer in **ArcGIS Pro's Python window**, using Pro's existing Portal sign-in. A browser login alone is not enough. Pro is still needed to build native vector tiles for each new release.

## Before you start

- Open a project in licensed ArcGIS Pro and sign into the intended Portal.
- Your account must be allowed to create items, publish hosted feature layers and publish hosted tile layers.
- Use a compatible ArcGIS API for Python with the public folders/session/sharing interfaces. Signatures were checked against **2.4.4**; the script checks the required interfaces. If your Pro environment lacks them, use the manual guide or an administrator-approved compatible environment.
- Have your prepared **Portal** profile and the exact release printed by `refresh`.

No copied token, password or certificate is entered into the script. HTTPS trust must already work in Pro.

## 1. Create a plan

In **Pro's Python window**, run:

```python
import os, runpy
os.chdir(r"C:\path\to\mapillary-explorer")
publisher = runpy.run_path("tools/overture_places/publish_places_portal.py")
plan = publisher["create_plan"](
    r"C:\Places\my-area.places-area.json",
    "2026-10-21.0",
    portal_url="https://portal.example.com/portal"
)
```

Replace the widget folder, profile, release and Portal root. Use the Portal root shown in Pro, not a service URL or `/sharing/rest` address.

Planning **creates no Portal content**. It checks the local data and signed-in account, then prints the local **publication-plan.json** path. Open it and review the Portal, account, release and source count before continuing.

## 2. Publish the plan

In the same Python window, run:

```python
result = publisher["publish_plan"](plan["plan_path"])
print(result["connection_file"])
```

This step **creates Portal content** and can take several minutes. Keep Pro open and signed into the same account/Portal.

It creates a uniquely named folder and a **new private service pair**: query layer first, then the complete package and vector tile service. It checks hosted schema, count, release pairing, icon/cluster resources and a sample tile. It retains the source upload, package and reports.

Successful output says **ready_for_review**. Open the printed **connection.json** for:

- `placesPortalTilesUrl`: the vector tile service URL.
- `placesPortalQueryUrl`: the numeric query-layer URL.

Local plans, reports and upload copies are under:

```text
<area output>/releases/RELEASE/publishing/UNIQUE_RUN/
```

The build has its own short `pp_...` folder under that release. New names avoid overwriting earlier files and services.

## 3. Review and connect

Continue at **[Share and connect the two services](portal-administrator-guide.md#4-share-and-connect-the-two-services)**:

1. Check the tile item in Map Viewer.
2. Share **both published services** with your intended audience. Source-file/package items can stay private.
3. Paste both URLs into Builder, test the connection and check the viewer workflows/mobile layouts.
4. Update the experience only when the new pair works. Keep the previous pair for rollback.
5. Record the deployed release using `mark-published` in the [update guide](area-maintenance.md#update-your-data-later).

The script does not change the experience, record publication, delete items, overwrite services or make content public.

## If a run fails

Open **publication-report.json**. It records the stage and known item IDs. Partial files and new Portal items are retained for inspection; a failed run does not remove the current live pair. `new_item_verified: false` means that returned/pending item still needs inspection.

An upload or publication may continue on Portal after a timeout or interruption. Check the new folder, planned names and Portal job before trying again. A started plan cannot be run twice. For a deliberate new attempt, create a new plan; do not remove its started marker or automatically delete partial items.

The default read-only readiness wait is 600 seconds. On the **initial** publishing call, a longer wait can be selected with `validation_timeout=1200`. This changes validation polling, not the SDK's upload/job timeout. Portal policies that require extra metadata may need manual publishing.

## What has been tested

Automated fixtures cover planning, publishing order, privacy checks, source/account/Portal mismatch, partial failures and repeat protection. Validation also passed against resources from a real 7,089-place package. Public SDK signatures were checked against ArcGIS API for Python 2.4.4.

**A real authenticated Pro/Portal publication still needs deployment testing.** Offline checks do not prove hosted import or viewer performance. Keep your working services until your first run passes the checks above. Scheduled/headless publishing is not provided.
