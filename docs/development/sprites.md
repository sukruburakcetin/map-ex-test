# Bundled traffic-sign and object sprites

Traffic-sign and object icons ship with the widget. The separate [sprite-source repository](https://github.com/sukruburakcetin/mapillary-explorer-sprite-source) remains the maintenance source, not a runtime dependency. Places sprites are a separate part of the Places service/package workflow.

## Source and deployed files

The current snapshot is commit `9aa64280d622e90e92cfcb29f0e68567a0ab1e54`. Files live under:

```text
src/runtime/assets/sprites/mapillary-9aa64280d622/
  package_signs/package_signs.json
  package_signs/package_signs.png
  package_signs/package_signs@2x.json
  package_signs/package_signs@2x.png
  package_objects/package_objects.json
  package_objects/package_objects.png
  package_objects/package_objects@2x.json
  package_objects/package_objects@2x.png
  LICENSE
  NOTICE.md
  SNAPSHOT.json
```

PNG and JSON files are copied unchanged. SNAPSHOT.json records source commit, byte counts and SHA-256 values. LICENSE retains the source repository's MIT notice. NOTICE.md retains its Mapillary attribution statement. Keep these notices with the distributed assets.

Experience Builder copies `src/runtime/assets` to `dist/runtime/assets`. This follows Esri's [use-assets sample](https://github.com/Esri/arcgis-experience-builder-sdk-resources/tree/master/widgets/use-assets). `widgetSpriteUrls` resolves absolute sprite base URLs from the host-provided `context.folderUrl`, not the application root or viewer URL. This supports a nested application path and a separately hosted widget. Normal and retina files keep the same base name, as required by vector-tile styles.

The versioned asset directory prevents a later source-repository edit from changing a published experience or mixing a cached atlas with another snapshot. There is no GitHub fallback. Missing files should be fixed in the deployment, rather than silently loading different files from another release.

## Loading and performance

The PNG/JSON assets are static files, not imports embedded in runtime JavaScript. Importing the URL helper does not fetch them. Existing deferred filter preloading, chunked icon cropping, filter callbacks, vector-tile style construction and sprite loading feedback retain their existing schedule and behavior. In particular, this update does not convert the existing startup filter preloading into on-demand loading.

Mapillary imagery and vector-tile APIs remain external. Bundling sprites alone does not make the widget offline. A cross-origin widget/CDN must serve its asset files with CORS access for the experience origin; same-origin hosting does not require a separate sprite endpoint or certificate.

## Updating for a widget release

1. Prepare and review the sprite-source repository first. Choose an exact commit, not a moving branch URL.
2. Copy both PNG/JSON pairs, including `@2x` variants, into a new commit-named directory under `src/runtime/assets/sprites`. Preserve bytes; do not independently regenerate or resize one member of a pair.
3. Retain source license/attribution and regenerate SNAPSHOT.json with byte counts and SHA-256 for all eight assets. Update both `SPRITE_ASSET_PATHS` constants to the new directory in the same widget release.
4. Run the bundled-sprite tests, check atlas bounds and icon cropping, then build in Experience Builder. Retain the previously deployed release as a complete rollback package.
5. Deploy the complete build, including its assets. Published experiences keep their pinned release until deliberately upgraded.

## Deployment acceptance

In the actual Builder, preview and published experience:

- Enable traffic signs and objects. Verify symbols, filter thumbnails, filters, selection and icon-size controls.
- Test normal and high-DPI displays. Expect local `.json` / `.png` or `@2x` files under the deployed widget's `dist/runtime/assets/sprites` path.
- Verify HTTP 200, JSON/PNG content types, HTTPS and cross-origin headers where applicable. A web server must not rewrite missing asset requests to the app's HTML page.
- Block `raw.githubusercontent.com` and confirm sign/object sprites still load. This does not test unrelated GitHub avatar assets or remove external Mapillary/API requirements.
- Check cold and warm cache, mobile, a nested deployment path and a widget CDN if used. Compare opening/playback behavior in the deployed host; portable fixture tests do not constitute a full Experience Builder/ArcGIS SDK acceptance run.
