# Nearby places · Overture

Places is a built-in, optional context layer for Mapillary exploration. Turn it on from the viewer toolbar to explore nearby businesses, services and landmarks.

- [Portal and external source behavior](portal-administrator-guide.md#7-what-viewers-can-do) explains publishing requirements and search-order differences.
- Map tiles follow the visible map area; overview display, icons and label scales follow the published source style.
- Category, minimum confidence and permanently closed filters apply to tiles, picking and results together. All scores includes missing values; a numeric threshold excludes them.
- Search matches places throughout the searched area before returning batches of up to 200. The four-row list pagination browses that batch; Load more requests the next batch.
- Auto and Search this area control result-list refreshes. They do not pause map tiles.
- Select a map icon or result to inspect details, show its location, search nearby imagery or prepare a field note. Nearby imagery does not guarantee a visible entrance.
- Minimize the panel to see the map or imagery beneath it; the layer stays active. Close hides the panel; the Places toggle disables the layer.

New configurations default to **ArcGIS Portal**: administrators provide a vector tile service URL and a query-layer URL. **External Places service** remains available with one API base URL. Existing configured external-service apps retain that source. Neither mode adds a bulk POI FeatureLayer or Graphics collection. Viewers do not supply URLs or import data.

| Task | Guide |
|---|---|
| Choose a map area, download data and refresh releases | [Area maintenance guide](area-maintenance.md) |
| Optionally publish a prepared Portal release from Pro sign-in | [Optional publishing script](optional-publishing.md) |
| Publish through ArcGIS Portal (default source) | [Portal administrator guide](portal-administrator-guide.md) |
| Prepare, serve and connect an external Places service | [Administrator guide](administrator-guide.md) |
| Implement or host a compatible API | [Service contract](service-contract.md) |
| Change feature ownership or behavior | [Architecture](architecture.md) |
| Verify functionality and performance | [Testing](testing.md) |

Developer investigation: [global/direct-browser exploration](global-exploration.md). This records source findings and the next prototype gates; it is not a newly enabled provider.
