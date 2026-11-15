# Mapillary Explorer

An ArcGIS Experience Builder widget for exploring Mapillary street-level imagery, detected objects, nearby places and field notes.

## Install the widget

Follow the **[installation guide for Experience Builder 1.20 and 1.21](docs/installation.md)**. It covers host setup, the correct package manager, exact widget dependencies and moving an existing test installation.

- **1.20:** existing development target; install dependencies with npm.
- **1.21:** Esri requires pnpm (recommended Node.js 24 / pnpm 11). Full widget compatibility testing remains pending.

Place the source at `client/your-extensions/widgets/mapillary-explorer`, configure your Mapillary token, start the host and add the widget to an experience. This repository is a widget, not a standalone app. Current source includes the implemented features; new users do not apply a sequence of development patch installers.

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
