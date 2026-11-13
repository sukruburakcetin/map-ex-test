# Mapillary Explorer

An ArcGIS Experience Builder widget for exploring Mapillary street-level imagery, detected objects, nearby places and field notes.

## Install the widget

Use **Experience Builder Developer Edition 1.20**. This repository is a widget, not a standalone web app.

1. Download the widget source and place it in your Experience Builder installation at `client/your-extensions/widgets/mapillary-explorer`. That folder must directly contain `manifest.json`, `src` and `tools`.
2. Follow Esri's Developer Edition setup instructions to install/start the Experience Builder host.
3. Set your Mapillary access token in `manifest.json` under `properties.mapillaryAccessToken`.
4. Add **Mapillary Explorer** to an experience, connect its map widget and configure the tools you want in widget settings.
5. Preview the experience, then build/publish it through the Experience Builder host. Check each desktop/mobile widget instance you offer.

Current source includes the implemented features; you do not apply a sequence of development patch installers.

## Add optional features

| What you want | Read this |
|---|---|
| Businesses, services and landmarks from Overture | **[Places setup: download, publish and maintain](docs/places/README.md)** |
| Organization-shared field notes | [Enterprise notes](docs/administration/enterprise-notes.md) |
| Team collaboration workspaces | [Workspace backend setup](tools/community-notes/README.md) |
| Viewer help or other documentation | [Documentation index](docs/README.md) |
| Code changes and tests | [Contributing](CONTRIBUTING.md) |
| Translation corrections | [Translation guide](docs/localization/CONTRIBUTING.md) |

Places and shared-note backends are optional. Viewers use tools configured by an administrator; they do not publish datasets. Review applicable Mapillary, Esri and Overture terms for your deployment.
