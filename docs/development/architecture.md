# Widget architecture

`src/runtime/widget.tsx` coordinates Experience Builder/ArcGIS view lifecycle and cross-feature interaction. `src/setting/setting.tsx` owns builder configuration. Feature modules under `src/features/` own bounded resources and pure helpers; `src/components/` composes the viewer UI, `src/styles/` its styles, and `src/i18n/` presentation/localization.

| Area | Entry point |
|---|---|
| Places data and interactions | [Places owners](../places/architecture.md) |
| Shared coverage/imagery dispatch | [Interaction UX](interaction-ux.md) |
| InfoBox composition | [Sections](info-box.md) |
| Field-note ownership | [Feature README](../../src/features/field-notes/README.md) and [viewer](field-note-viewer.md) |
| Point-cloud tools | [Feature README](../../src/features/point-cloud/README.md) and [owners](point-cloud.md) |
| Collaboration backend/client | [Operator kit](../../tools/community-notes/README.md) and [client](../../src/features/community-notes/README.md) |
| Elevation and solar | [Elevation](../../src/features/elevation/README.md) and [solar](../../src/features/solar/README.md) |

Preserve foreground work priority, latest-request ownership, cancellation and view disposal. Native layers render bulk data; bounded overlays support feedback/selection. Ordinary image opening should not wait for optional complete route loading. Source organization alone does not establish runtime performance; measure in the host.
