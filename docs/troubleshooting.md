# Troubleshooting

Change one thing at a time. Record the Experience Builder version and first relevant error before trying another fix.

| Problem | Likely cause | Steps | Verify |
| --- | --- | --- | --- |
| Explorer is missing in the builder | Extra nesting or the client predates the new extension folder | Put `manifest.json` directly in the widget folder and restart the client. [Check the layout](installation.md#3-put-the-widget-in-the-correct-folder) | Add Explorer to a preview app. |
| Builder shows Style but options such as Appearance Settings are missing | The settings bundle or widget configuration did not load | Check that the source copy includes `config.json` and `src/setting/setting.tsx`. Rebuild the client and inspect the widget manifest and settings requests in DevTools. [Check the source layout](installation.md#3-put-the-widget-in-the-correct-folder) | Select the widget and confirm the **Content** tab appears. |
| Build reports missing packages | Dependencies were installed in the wrong folder | Verify the package is `exb-client`, then install with the version-specific command. [Check dependencies](installation.md#4-install-the-widgets-extra-dependencies) | Restart the client and confirm the missing-module error is gone. |
| Map appears but no capture opens | No connected map, no imagery at this location, or active filters | Select the Map widget in Explorer settings. Try a known covered street, zoom in and reset the panorama filter to **All**. [First capture](getting-started.md) | Select an individual point and confirm the viewer opens. |
| Preview appears but panorama direction is hidden at world scale | Panorama direction is gated to close zoom | Zoom to an individual panorama point with a bearing. | The preview stays available and the cyan cone can appear at close zoom. |
| Signs appear in preview but disappear after deployment | Output is missing sprite assets or the asset host rejects the app origin | Deploy the complete runtime asset directory with the widget build. Check image and JSON requests in the browser. [Deployment checklist](development/sprites.md) | Confirm both asset requests succeed and symbols render in the published app. |
| Places or shared notes fail | The app cannot reach the service, or the account lacks permissions | Confirm the configured URL and account. Follow the service-specific checks. [Places](places/troubleshooting.md) · [Enterprise notes](administration/enterprise-notes.md) · [Workspaces](../tools/community-notes/README.md) | Repeat a read in the published app with the intended role. Test writes in a test workspace. |

## Can I run the widget without Developer Edition?

App viewers only need the published experience and appropriate access. Developers need the host to build and test the widget. The repository has no standalone app server.

## Which features need a configured service?

Street-level imagery needs Mapillary access. Places, Enterprise notes, collaboration workspaces, and capture routing have separate configuration requirements. See [installation](installation.md) and the [configuration and integration reference](reference.md) for the service that owns each workflow.

If these steps do not resolve the problem, follow [Support](../SUPPORT.md) for what to include in a report.
