# Customize and maintain Mapillary Explorer

Use this guide to change an existing Mapillary Explorer experience. Pick the path that matches what you have access to.

| I want to | Start here |
| --- | --- |
| Use an app someone published | [Viewer guide](user-guide/README.md) |
| Change which tools an app shows | [Customize in Builder](#customize-in-builder) |
| Improve the widget's source | [Make a source change](#make-a-source-change) |
| Distribute or update a deployed copy | [Publish and verify](#publish-and-verify) |

## Customize in Builder

You need permission to edit the experience and a working Mapillary Explorer instance. If the widget is missing, follow [Getting started](getting-started.md).

Try hiding the **Keep image in view / Lock to image** button in a test copy of your experience.

1. Open the experience in Builder and select Mapillary Explorer. In **Map connection**, confirm it uses the intended Map widget.
2. Open **Appearance** and find **Hide Keep image in view / Lock to image button** under **Map navigation**. Turn the switch on. To see the effect, start with a setup where **Enable Sync** is on and the button is visible.
3. Open Preview and select a Mapillary capture. Confirm the image opens and the button is hidden. Switch it back off if viewers should have the control. The setting controls button visibility and leaves map synchronization configured as before.
4. If your app uses Widget Controller, open, close, and resize the panel in Preview. Verify that viewers can still reach the controls you expect them to use before publishing.

Use the same workflow for other appearance options. Set coverage defaults separately. Places and shared notes require their own service and permission checks. [Appearance settings](administration/builder-appearance.md) · [Places setup](places/README.md) · [Enterprise notes](administration/enterprise-notes.md)

## Make a source change

Use a test experience and a Developer Edition client configured for this checkout. The [installation guide](installation.md) lists the host dependencies and startup commands. For changes you plan to share, follow the [contribution workflow](../CONTRIBUTING.md).

1. **Reproduce the behavior.** Record the widget and host versions, the steps, and the result you want. For a display change, compare the regular layout with the Widget Controller panel.
2. **Find the owner.** For example, to adjust imagery loading feedback, start with [ImageryLoading.tsx](../src/components/ImageryLoading.tsx) for the message and loading states and [imageryLoading.ts](../src/styles/imageryLoading.ts) for the layout. Builder controls live under [the settings component](../src/setting/setting.tsx). Consult the [architecture guide](development/architecture.md) for lifecycle, map, and imagery ownership.
3. **Keep the change focused.** For a banner layout change, adjust the styles and leave the existing message keys, loading behavior, and Cancel action intact. If text needs to change, use the [localization workflow](localization/CONTRIBUTING.md). For a new Builder option, review the setting, [configuration type](../src/config.ts), [default configuration](../config.json), and runtime reader together. Check how saved experiences behave when the key is absent.
4. **Verify in the host.** Wait for the client to recompile, reload Preview, and repeat the original steps. For the banner example, open captures in a wide viewer and in a narrow Widget Controller panel. Check that the message fits and existing controls remain usable.
5. **Check and share.** If you updated Markdown, run `node tools/check-docs.cjs` from the widget root. Use the [test environment guide](development/portable-tests.md) for source changes and include the checks you ran in your pull request.

The [technical reference](reference.md) points to host integration, metadata, configuration and service contracts.

## Publish and verify

1. Identify the candidate commit, the target Experience Builder version, and the previous known-good artifact. Preserve the experience configuration so you can restore it.
2. Build with the target host and use the [live acceptance checklist](development/exb-1.21-validation.md). Verify the customizations in a test experience before updating the published app.
3. Deploy the full widget build with runtime assets. From the published URL, open a capture as an ordinary viewer and check the features and services your deployment enables.

See the [publisher guide](publishing.md) for review criteria, deployment checks and rollback. For an existing 4.6 deployment, follow the [5.0 migration guide](releases/5.0-migration.md).
