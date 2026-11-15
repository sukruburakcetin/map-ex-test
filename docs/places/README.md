# Places: start here

Places adds businesses, services and landmarks to Mapillary Explorer. It is optional. Viewers click **Places** and explore; they do not download or publish data.

## Set it up

For most organizations, use **ArcGIS Portal**. You need a Portal account that can publish hosted layers and ArcGIS Pro on the publishing computer.

1. **[Download your area](area-maintenance.md)** — choose it on the map, save its profile and prepare the data.
2. **[Publish to Portal](portal-administrator-guide.md)** — upload the data, build one tile package and connect the two service URLs.
3. **[Update the same area later](area-maintenance.md#update-your-data-later)** — reuse the profile; keep the old services until the new pair works.

The Portal workflow publishes two services: **vector tiles draw the map**, and a **query layer supplies search and details**. The query layer is not added to the map as a FeatureLayer. Both come from the same downloaded release.

Only read these if you need them:

- [Optional publishing script](optional-publishing.md): automate the Portal upload/build/publish steps from Pro's sign-in. No toolbox. Manual publishing remains available.
- [External HTTPS service](external-service.md): an alternative for administrators who already manage a web server.
- [Troubleshooting](troubleshooting.md): common setup problems and the next action.

## Explore the published data

- Click **Places**, then select a map icon or a result to see details, nearby imagery or field-note actions.
- Use categories and quality filters to narrow the results. A minimum confidence excludes places with no score; a score is not a probability.
- Search checks matching places in the searched area, including those beyond the first 200. Small list pages browse the current batch; **Load more** requests another batch.
- **Auto** and **Search this area** refresh the results list. Map tiles continue following the map in either mode.
- Minimize the panel to see beneath it while keeping Places active. Use the Places toggle to disable the layer.
- Overview circles summarize places. Zoom in for individual icons. Dense icons may overlap, so filtering or zooming can reveal more.

Coverage is the area your administrator published. Panning outside it does not download another region. Nearby imagery is a discovery aid; it may not show a place's entrance.
