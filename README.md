# Mapillary Explorer

A custom ArcGIS Experience Builder widget for exploring Mapillary street-level imagery alongside coverage, detected objects, places and field notes.

## Use the widget

The widget targets **Experience Builder Developer Edition 1.20** (`manifest.json`). Place this repository in the host's `client/your-extensions/widgets/mapillary-explorer` directory, follow Esri's instructions to install/start that host, then add the widget to an experience and connect its map widget. Set the deployment's Mapillary access token in `manifest.json` under `properties.mapillaryAccessToken`, which the runtime reads, and configure the enabled tools in widget settings. Build and publish through the Experience Builder host; this repository is not a standalone web application.

Places, Enterprise notes and collaboration workspaces are optional. Each has a separate administrator setup; viewers use the configured tools without publishing data themselves.

| Task | Documentation |
|---|---|
| Explore available guides | [Documentation index](docs/README.md) |
| Prepare and connect Places data | [Places administrator guide](docs/places/administrator-guide.md) |
| Set up Enterprise field notes | [Enterprise notes](docs/administration/enterprise-notes.md) |
| Operate a collaboration workspace backend | [Workspace operator kit](tools/community-notes/README.md) |
| Develop, test or contribute | [Contributing](CONTRIBUTING.md) |
| Improve translations | [Translation guide](docs/localization/CONTRIBUTING.md) and [lookup table](docs/localization/translations.csv) |

Current source includes the supported features. No sequence of patch installers is required. Data/service hosting remains separate from the viewer interface. Review applicable Mapillary, Esri and Overture terms for your deployment.
