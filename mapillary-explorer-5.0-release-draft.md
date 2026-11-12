# Mapillary Explorer 5.0 — release notes draft

**Unreleased. Development is continuing.** This draft records implemented changes so far; it is not a publication date or a declaration that every feature has passed final host validation. Refresh it against the final development commit before release.

## New exploration and analysis tools

- Optional Overture Places with an import-once, read-only SQLite service and configuration-based HTTPS startup: vector-tile POIs with scale-aware counts/icons, category and quality filters, area-wide text search, paged results, imagery exploration and field-note actions.
- Sequence elevation profiles with current-image tracking and separately identified camera-altitude information.
- Solar visualization based on capture location/time, with map/viewer overlays and scene-lighting controls.
- Shared field-note options through configured ArcGIS Enterprise services and operator-managed collaboration workspaces, alongside existing Local notes.
- Language selection for the viewer and builder, with 13 language/locale choices, localized formatting and Arabic RTL presentation.

## Improvements to existing workflows

- More responsive imagery opening and sequence navigation through shared requests, bounded caches and on-demand complete route loading.
- Closest-first nearby-image browsing, clearer thumbnail feedback and improved map/viewer hover and selection handling.
- Expanded capture-route planning with A/B selection, routing-provider choices, time-budget controls and an in-map route simulation with playback controls. Existing GPX export remains available.
- Field-note workflow statuses, resolution information, search and richer attachment handling. Detected objects can supply note position/provenance and an optional cropped image attachment.
- Point-cloud PLY/LAS export options alongside CSV, plus improvements to load cancellation, adaptive display and map/viewer selection consistency.
- In-widget Time travel thumbnail comparison, while retaining the external exploration action.
- Organization-based coverage filtering, clearer detection loading feedback, and improved spherical-image AI labels and detection exploration controls.
- More compact, responsive panels with improved scrolling, focus handling and map/imagery visibility while browsing Places.

## Developer and administrator improvements

- Clearer feature ownership, resource cleanup and regression coverage.
- Task-based documentation for viewers, service administrators and contributors, including Places data preparation and HTTPS configuration.
- Removal of redundant development delivery files and generated repository artifacts.

## Before publishing this draft

Complete Places hosting/capacity acceptance, validate the distributed build in the intended Experience Builder/Enterprise environments, verify each configured service and mobile layout, and select only accepted features for the final announcement. The current manifest targets Experience Builder 1.20; it does not establish compatibility with every older host.

Do not describe basic point-cloud viewing, measurement/lasso, Local field notes, AI overlays, coverage analysis, Turbo filtering or GPX export as new 5.0 features: they already existed in 4.6. Do not publish numerical speed or scale claims without measurements.

The [change inventory](5.0-change-inventory.md) records source evidence, pending work and the precise comparison baseline.
