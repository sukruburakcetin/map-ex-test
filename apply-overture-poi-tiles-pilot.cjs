#!/usr/bin/env node
'use strict';
/**
 * Overture POI tiles pilot. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/runtime/widget.tsx block 1",
              "before": "import { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { PlaceImageryCache } from '../features/places/PlaceImageryCache';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory, readPlaceAutoUpdate, savePlaceAutoUpdate } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\n",
              "after": "import { rankPlaceImagery, facePlaceInPanorama, placeImageryBbox, PlaceImagery } from '../features/places/nearbyPlaceImagery';\nimport { PlaceImageryCache } from '../features/places/PlaceImageryCache';\nimport { ArcGISPlaces } from \"../features/places/ArcGISPlaces\";\nimport { PlacesTilesPrototype } from \"../features/places/PlacesTilesPrototype\";\nimport { placePreferenceKey, readPlaceCategory, savePlaceCategory, readPlaceAutoUpdate, savePlaceAutoUpdate } from '../features/places/placePreferences';\nimport { paddedPlacesExtent } from '../features/places/publishedPlacesExtent';\nimport { placeCameraDistanceLabel } from '../features/places/placeListUtils';\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesImageryCache:PlaceImageryCache|null=null;\n  private _placesExploreAbort: AbortController | null = null;\n  private placesPauseReason = (): string => {\n",
              "after": "  private _places: ArcGISPlaces | null = null;\n  private _placesView: __esri.MapView | __esri.SceneView | null = null;\n  private _placesUrl = '';\n  private _placesTilesPrototype: PlacesTilesPrototype | null = null;\n  private _placesTilesControl: any = null;\n  private _placesTilesView: any = null;\n  private installPlacesTilesPrototype() {\n    const root = ((window as any).__mlyPlacesTiles ||= {});\n    const control = {\n      start: async (styleUrl: string, detailsUrl: string) => {\n        this._placesTilesPrototype?.stop();\n        const view = this.state.jimuMapView?.view;\n        if (!view?.ready || view.destroyed) throw new Error('Open a ready map first');\n        const prototype = new PlacesTilesPrototype({ view, modules: this.ArcGISModules,\n          selected: (attributes, location) => {\n            const content = document.createElement('div');\n            content.textContent = String(attributes.place_name || attributes.gers_id);\n            view.openPopup({ title: 'Overture POI prototype', content, location });\n          }, error: error => console.warn('[Overture tile prototype]', error) });\n        this._placesTilesView = view;\n        this._placesTilesPrototype = prototype;\n        await prototype.start(styleUrl, detailsUrl);\n      },\n      stop: () => { this._placesTilesPrototype?.stop(); this._placesTilesPrototype = null; this._placesTilesView = null; },\n    };\n    root[String(this.props.id)] = this._placesTilesControl = control;\n  }\n\n  private _placesImageryCache:PlaceImageryCache|null=null;\n  private _placesExploreAbort: AbortController | null = null;\n  private placesPauseReason = (): string => {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "  private placesBusy = () => !!this.placesPauseReason();\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    if(this.props.state==='CLOSED')this._placeNoteReview?.cancel();\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n",
              "after": "  private placesBusy = () => !!this.placesPauseReason();\n  private syncPlaces = () => {\n    const view = this.state.jimuMapView?.view;\n    if (this._placesTilesPrototype && (this._placesTilesView !== view || this.props.state === 'CLOSED')) this._placesTilesControl?.stop();\n    if(this.props.state==='CLOSED')this._placeNoteReview?.cancel();\n    const url = placesServiceUrl(this.props.config.placesServiceUrl);\n    if (!this.state.placesActive || this.props.config.enablePlaces !== true || !url || !view?.ready || view.destroyed) {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "      await view.when();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.ensureArcGISModules();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.checkUrlForSharedState(current);\n    } catch (error) {\n",
              "after": "      await view.when();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.ensureArcGISModules();\n      this.installPlacesTilesPrototype();\n      if (!current() || this._sharedStateRestoreComplete) return;\n      await this.checkUrlForSharedState(current);\n    } catch (error) {\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "  // - Ensures all intervals, observers, and event listeners are removed\n  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._placeNoteDisposed=true;this._placeNoteReview?.cancel();\n    const pendingPlaceCrop=this.state.pendingFieldNote?.placeId&&this.state.pendingFieldNote.attachmentId;\n    if(pendingPlaceCrop)void deleteDetectionCrop(pendingPlaceCrop).catch(()=>{});\n",
              "after": "  // - Ensures all intervals, observers, and event listeners are removed\n  // - to prevent memory leaks when widget is closed or reloaded.\n  componentWillUnmount() {\n    this._placesTilesPrototype?.stop(); this._placesTilesPrototype = null;\n    const tilesControls = (window as any).__mlyPlacesTiles;\n    if (tilesControls?.[String(this.props.id)] === this._placesTilesControl) delete tilesControls[String(this.props.id)];\n    this._placeNoteDisposed=true;this._placeNoteReview?.cancel();\n    const pendingPlaceCrop=this.state.pendingFieldNote?.placeId&&this.state.pendingFieldNote.attachmentId;\n    if(pendingPlaceCrop)void deleteDetectionCrop(pendingPlaceCrop).catch(()=>{});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tools/overture_places/README.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "tools/overture_places/README.md block 1",
              "before": "## Refreshing data\n\nPrepare a new dated export and inspect it outside the application. Back up the hosted item and its sharing/settings before replacing its data through your normal Enterprise publishing process. Preserve field names and schema; GERS IDs link place identity across releases. Existing sessions retain at most six two-minute cache entries; reload after replacing a release. Test each updated release's category taxonomy and geographic coverage before production use.\n",
              "after": "## Refreshing data\n\nPrepare a new dated export and inspect it outside the application. Back up the hosted item and its sharing/settings before replacing its data through your normal Enterprise publishing process. Preserve field names and schema; GERS IDs link place identity across releases. Existing sessions retain at most six two-minute cache entries; reload after replacing a release. Test each updated release's category taxonomy and geographic coverage before production use.\n\n## Unfiltered vector tile experiment (Enterprise 12.1)\n\nThe separate `export_all_places.py` and `prepare_all_places_arcpy.py` tools retain all POI categories, confidence values and operating statuses in a bounded test area. They do not change the curated pilot exporter above. See [the Enterprise 12.1 workflow](../../docs/OVERTURE-ENTERPRISE-12.1.md) for export, ArcGIS Pro import, tile/details publishing and acceptance checks.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/PlacesTilesPrototype.ts",
      "content": "/** Opt-in feasibility harness. Native tiles draw POIs; only a bounded click query reaches JS.\n * Picking is proximity-based, not proof that a collision-hidden tile symbol was rendered.\n */\nexport class PlacesTilesPrototype {\n  private layer: any;\n  private service: any;\n  private click: any;\n  private movement: any;\n  private abort: AbortController | null = null;\n  private revision = 0;\n  constructor(private host: { view: any; modules: any; selected(attributes: any, point: any): void; error(error: unknown): void }) {}\n\n  async start(styleUrl: string, detailsUrl: string): Promise<void> {\n    this.stop();\n    for (const value of [styleUrl, detailsUrl]) {\n      const url = new URL(value);\n      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use HTTPS endpoints without embedded credentials');\n    }\n    if (!/\\/FeatureServer\\/\\d+\\/?$/.test(new URL(detailsUrl).pathname)) throw new Error('Expected a FeatureServer layer URL');\n    const { view, modules } = this.host, revision = this.revision;\n    if (!view?.ready || view.destroyed) throw new Error('Open a ready map first');\n    const layer = this.layer = new modules.VectorTileLayer({ url: styleUrl, id: 'overture-tiles-prototype', title: 'Overture POIs · prototype', listMode: 'hide' });\n    const service = this.service = new modules.FeatureLayer({ url: detailsUrl, popupEnabled: false });\n    try {\n      await Promise.all([layer.load(), service.load()]);\n      if (revision !== this.revision || view.destroyed) return;\n      if (!service.fields?.some((field: any) => field.name === 'gers_id')) throw new Error('Details service must expose gers_id');\n      view.map.add(layer);\n      this.movement = view.watch('stationary', (stationary: boolean) => {\n        if (!stationary) this.abort?.abort();\n      });\n      this.click = view.on('click', (event: any) => {\n        // This explicit test mode owns clicks. Stop it to restore normal navigation.\n        event.stopPropagation();\n        void this.pick(event).catch(error => { if (error?.name !== 'AbortError') this.host.error(error); });\n      });\n    } catch (error) { if (revision === this.revision) this.stop(); throw error; }\n  }\n\n  async pick(screen: { x: number; y: number }): Promise<void> {\n    this.abort?.abort();\n    const controller = this.abort = new AbortController(), { view } = this.host;\n    const revision = this.revision;\n    if (!this.layer || !this.service || view.destroyed || !view.stationary) return;\n    const point = view.toMap(screen);\n    if (!point) return;\n    // Derive a map-space search envelope from screen pixels; works in MapView and SceneView.\n    const corners = [[-12,-12],[12,-12],[12,12],[-12,12]].map(([x,y]) => view.toMap({ x: screen.x+x, y: screen.y+y }));\n    if (corners.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return;\n    const geometry = { type: 'extent', xmin: Math.min(...corners.map(p=>p.x)), ymin: Math.min(...corners.map(p=>p.y)), xmax: Math.max(...corners.map(p=>p.x)), ymax: Math.max(...corners.map(p=>p.y)), spatialReference: point.spatialReference };\n    const page = await this.service.queryFeatures({ where: '1=1', geometry, spatialRelationship: 'intersects', outFields: ['*'], returnGeometry: true, num: 32 }, { signal: controller.signal });\n    if (controller.signal.aborted || revision !== this.revision || view.destroyed || !view.stationary) return;\n    // Never claim a nearest result when the server truncated the candidates.\n    if (page.exceededTransferLimit || page.features?.length >= 32) { this.host.error(new Error('Too many nearby candidates; zoom in to select a place')); return; }\n    let nearest: any = null, distance = 12 * 12;\n    for (const feature of page.features || []) {\n      if (!feature.attributes?.gers_id || !feature.geometry) continue;\n      const pixel = view.toScreen(feature.geometry);\n      if (!pixel || !Number.isFinite(pixel.x) || !Number.isFinite(pixel.y)) continue;\n      const squared = (pixel.x-screen.x)**2 + (pixel.y-screen.y)**2;\n      if (squared < distance) { distance = squared; nearest = feature; }\n    }\n    if (nearest) this.host.selected(nearest.attributes, nearest.geometry);\n  }\n\n  stop(): void {\n    ++this.revision;\n    this.abort?.abort(); this.abort = null;\n    this.click?.remove(); this.click = null;\n    this.movement?.remove(); this.movement = null;\n    if (this.layer) { if (!this.host.view.destroyed) this.host.view.map?.remove(this.layer); this.layer.destroy(); this.layer = null; }\n    this.service?.destroy(); this.service = null;\n  }\n}\n"
    },
    {
      "file": "tools/overture_places/export_places.py",
      "content": "#!/usr/bin/env python3\n\"\"\"Offline GeoParquet -> small, reproducible Enterprise Places publishing artifact.\n\nRuns on an administrator's workstation/build host, never inside the widget.\n\"\"\"\nimport argparse\nimport datetime as dt\nimport json\nimport math\nfrom pathlib import Path\nimport re\nimport sys\nimport urllib.request\n\nGROUP_CATEGORIES = {\n    'health': ['hospital', 'clinic', 'medical_center', 'pharmacy', 'dentist', 'doctor'],\n    'education': ['school', 'primary_school', 'secondary_school', 'university', 'college', 'kindergarten', 'library'],\n    'parks': ['park', 'playground', 'garden', 'nature_reserve', 'national_park'],\n    'landmarks': ['landmark', 'historic_site', 'monument', 'museum', 'tourist_attraction', 'memorial'],\n    'services': ['bank', 'atm', 'post_office', 'gas_station', 'supermarket', 'grocery_store', 'police_station', 'fire_station'],\n}\nGROUP_HIERARCHIES = {\n    'health': ['health', 'health_and_medical', 'health_and_medicine'],\n    'education': ['education'], 'parks': ['park'],\n    'landmarks': ['historic_site', 'landmark', 'museum'], 'services': [],\n}\nATTRIBUTION = 'https://docs.overturemaps.org/attribution/'\n\ndef parse_bbox(value):\n    try:\n        values = tuple(float(v.strip()) for v in value.split(','))\n        if len(values) != 4 or not all(math.isfinite(v) for v in values): raise ValueError()\n        west, south, east, north = values\n        if not (-180 <= west < east <= 180 and -85.051129 <= south < north <= 85.051129): raise ValueError()\n        return values\n    except ValueError as error:\n        raise argparse.ArgumentTypeError('Use west,south,east,north in WGS84; antimeridian-crossing areas must be split.') from error\n\ndef release_id(value):\n    if value == 'latest':\n        with urllib.request.urlopen('https://stac.overturemaps.org/catalog.json', timeout=30) as response:\n            value = json.load(response)['latest']\n    if not isinstance(value, str) or not re.fullmatch(r'\\d{4}-\\d{2}-\\d{2}\\.\\d+', value):\n        raise ValueError('Use a dated release such as 2026-10-21.0, or latest.')\n    return value\n\ndef group_sql():\n    parts = []\n    for group, categories in GROUP_CATEGORIES.items():\n        quoted = ','.join(\"'\" + category + \"'\" for category in categories)\n        ancestors = ','.join(\"'\" + category + \"'\" for category in GROUP_HIERARCHIES[group])\n        hierarchy = f' OR list_has_any(taxonomy.hierarchy, [{ancestors}])' if ancestors else ''\n        parts.append(f\"WHEN basic_category IN ({quoted}){hierarchy} THEN '{group}'\")\n    return 'CASE ' + ' '.join(parts) + ' END'\n\ndef clean(value, limit):\n    return str(value or '').strip()[:limit]\n\ndef write_geojson(rows, output, release):\n    features, ids, locations = [], set(), set()\n    for row in rows:\n        gers_id, name, category, group, confidence, address, website, lon, lat = row\n        if not gers_id or not name or not group or not all(math.isfinite(float(n)) for n in (confidence, lon, lat)): continue\n        name, category = clean(name, 120), clean(category, 80)\n        location = (name.lower(), category, round(lon, 6), round(lat, 6))\n        if gers_id in ids or location in locations: continue\n        ids.add(gers_id); locations.add(location)\n        features.append({'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [lon, lat]},\n            'properties': {'gers_id': clean(gers_id, 160), 'place_name': name, 'category': category,\n                'place_group': group, 'confidence': float(confidence), 'address': clean(address, 180),\n                'website': clean(website, 500), 'data_release': release}})\n    if not features:\n        raise ValueError('No matching places. Check the area, confidence threshold and category mappings.')\n    output.parent.mkdir(parents=True, exist_ok=True)\n    temporary = output.with_suffix(output.suffix + '.tmp')\n    temporary.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False), encoding='utf-8')\n    temporary.replace(output)\n    return len(features)\n\ndef main(argv=None):\n    parser = argparse.ArgumentParser(description=__doc__)\n    parser.add_argument('--bbox', type=parse_bbox, required=True)\n    parser.add_argument('--release', required=True, help='Pin a release for reproducible publishing; latest resolves via STAC.')\n    parser.add_argument('--output', type=Path, required=True)\n    parser.add_argument('--max-features', type=int, default=25000)\n    parser.add_argument('--input-parquet', type=Path, help='Optional local current-schema GeoParquet file instead of cloud data.')\n    args = parser.parse_args(argv)\n    if args.max_features < 1 or args.max_features > 100000: parser.error('--max-features must be 1..100000')\n    release = release_id(args.release)\n    try: import duckdb\n    except ImportError: parser.error('Install tools/overture_places/requirements.txt in your publishing environment.')\n    connection = duckdb.connect()\n    try:\n        connection.execute(\"SET memory_limit='1GB'\")\n        commands = ['INSTALL spatial', 'LOAD spatial']\n        if not args.input_parquet: commands += ['INSTALL httpfs', 'LOAD httpfs', \"SET s3_region='us-west-2'\"]\n        for command in commands:\n            connection.execute(command)\n        source = f's3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*'\n        if args.input_parquet:\n            if not args.input_parquet.is_file(): raise ValueError('--input-parquet must be an existing file')\n            source = str(args.input_parquet.resolve())\n        connection.read_parquet(source).create_view('overture_places')\n        columns = {row[0]: row[1] for row in connection.execute('DESCRIBE overture_places').fetchall()}\n        required = {'id', 'names', 'basic_category', 'taxonomy', 'confidence', 'geometry', 'bbox'}\n        if not required.issubset(columns):\n            raise ValueError('This release does not match the current taxonomy/basic_category schema. Review its schema before exporting.')\n        geometry = 'ST_GeomFromWKB(geometry)' if columns['geometry'] == 'BLOB' else 'geometry'\n        address = \"addresses[1].freeform\" if 'addresses' in columns else \"NULL::VARCHAR\"\n        website = \"websites[1]\" if 'websites' in columns else \"NULL::VARCHAR\"\n        west, south, east, north = args.bbox\n        query = f'''WITH pilot AS (\n            SELECT id, names.\"primary\" AS place_name, basic_category AS category,\n              {group_sql()} AS place_group, confidence, {address} AS address,\n              {website} AS website, ST_X({geometry}) AS longitude, ST_Y({geometry}) AS latitude\n            FROM overture_places\n            WHERE bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ? AND confidence >= 0.95\n        ) SELECT * FROM pilot WHERE place_group IS NOT NULL AND place_name IS NOT NULL\n          AND longitude BETWEEN ? AND ? AND latitude BETWEEN ? AND ?\n          ORDER BY confidence DESC, id ASC LIMIT ?'''\n        rows = connection.execute(query, [east, west, north, south, west, east, south, north, args.max_features + 1]).fetchall()\n        if len(rows) > args.max_features:\n            raise ValueError('Area exceeds --max-features. Split the area or explicitly raise the publishing limit; no truncated dataset was written.')\n        count = write_geojson(rows, args.output, release)\n        manifest = {'release': release, 'bbox': args.bbox, 'feature_count': count, 'min_confidence': .95,\n            'created_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': source, 'attribution': ATTRIBUTION,\n            'groups': GROUP_CATEGORIES, 'schema': 'mapillary-explorer-places-v1'}\n        args.output.with_suffix('.manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')\n        print(f'Wrote {count} places to {args.output}. Release: {release}. Publish using the accompanying Enterprise workflow.')\n    finally: connection.close()\n\nif __name__ == '__main__':\n    try: main()\n    except Exception as error:\n        print(f'Export failed: {error}', file=sys.stderr)\n        sys.exit(1)\n"
    },
    {
      "file": "tools/overture_places/requirements.txt",
      "content": "duckdb>=1.4,<2\n"
    },
    {
      "file": "tools/overture_places/export_all_places.py",
      "content": "#!/usr/bin/env python3\n\"\"\"Stream an unfiltered test-area POI snapshot to GeoJSON sequence (one feature per line).\n\nOffline publishing tool; never runs in the widget. All categories, confidence values,\nunnamed records and operating statuses are retained. This is a bounded pilot exporter.\n\"\"\"\nimport argparse\nimport datetime as dt\nimport json\nimport math\nfrom pathlib import Path\nimport sys\n\nfrom export_places import ATTRIBUTION, parse_bbox, release_id\n\n\ndef write_sequence(cursor, output, release, limit):\n    \"\"\"Publish only complete, valid output; never leave a silently truncated snapshot.\"\"\"\n    output.parent.mkdir(parents=True, exist_ok=True)\n    temporary = output.with_suffix(output.suffix + '.tmp')\n    count = 0\n    try:\n        with temporary.open('w', encoding='utf-8') as stream:\n            while True:\n                rows = cursor.fetchmany(512)\n                if not rows:\n                    break\n                for identifier, name, category, confidence, status, address, website, lon, lat in rows:\n                    count += 1\n                    if count > limit:\n                        raise ValueError('Area exceeds --max-features; split the test area. No truncated snapshot was published.')\n                    if not identifier or not all(isinstance(n, (int, float)) and math.isfinite(n) for n in (lon, lat)):\n                        raise ValueError('Invalid source ID or geometry; inspect the source before publishing.')\n                    if confidence is not None and (not math.isfinite(confidence) or not 0 <= confidence <= 1):\n                        raise ValueError('Invalid source confidence; inspect the source before publishing.')\n                    properties = dict(zip(\n                        ['gers_id', 'place_name', 'category', 'confidence', 'operating_status', 'address', 'website'],\n                        [identifier, name, category, confidence, status, address, website]))\n                    properties['data_release'] = release\n                    feature = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [lon, lat]}, 'properties': properties}\n                    stream.write(json.dumps(feature, ensure_ascii=False, allow_nan=False) + '\\n')\n        if not count:\n            raise ValueError('No places in this area; no snapshot was published.')\n        temporary.replace(output)\n        return count\n    finally:\n        temporary.unlink(missing_ok=True)\n\n\ndef main(argv=None):\n    parser = argparse.ArgumentParser(description=__doc__)\n    parser.add_argument('--bbox', type=parse_bbox, required=True)\n    parser.add_argument('--release', required=True)\n    parser.add_argument('--output', type=Path, required=True, help='New .geojsonl file (not a Portal upload format).')\n    parser.add_argument('--input-parquet', type=Path)\n    parser.add_argument('--max-features', type=int, default=25000)\n    args = parser.parse_args(argv)\n    if not 1 <= args.max_features <= 100000:\n        parser.error('--max-features must be 1..100000 for this test-area exporter')\n    manifest_path = args.output.with_suffix('.manifest.json')\n    if args.output.exists() or manifest_path.exists():\n        parser.error('Use new output paths; existing release artifacts are never overwritten')\n    release = release_id(args.release)\n    import duckdb\n    connection = duckdb.connect()\n    try:\n        connection.execute(\"SET memory_limit='1GB'\")\n        for sql in ['INSTALL spatial', 'LOAD spatial']:\n            connection.execute(sql)\n        source = f's3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*'\n        if args.input_parquet:\n            if not args.input_parquet.is_file():\n                parser.error('--input-parquet must exist')\n            source = str(args.input_parquet.resolve())\n        else:\n            for sql in ['INSTALL httpfs', 'LOAD httpfs', \"SET s3_region='us-west-2'\"]:\n                connection.execute(sql)\n        connection.read_parquet(source).create_view('overture_places')\n        columns = {\n            row[0]: row[1] for row in connection.execute('DESCRIBE overture_places').fetchall()}\n        if not {'id', 'names', 'basic_category', 'confidence', 'geometry', 'bbox'} <= columns.keys():\n            raise ValueError('Source schema changed; review the release schema before publishing')\n        geometry = 'ST_GeomFromWKB(geometry)' if columns['geometry'] == 'BLOB' else 'geometry'\n        optional = lambda name, expression: expression if name in columns else 'NULL::VARCHAR'\n        status = optional('operating_status', 'operating_status')\n        address = optional('addresses', 'addresses[1].freeform')\n        website = optional('websites', 'websites[1]')\n        west, south, east, north = args.bbox\n        query = f'''WITH area AS (\n            SELECT id, names.\"primary\" AS place_name, basic_category AS category,\n                confidence, {status} AS operating_status, {address} AS address, {website} AS website,\n                ST_X({geometry}) AS longitude, ST_Y({geometry}) AS latitude\n            FROM overture_places\n            WHERE bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ?\n        ) SELECT * FROM area WHERE longitude BETWEEN ? AND ? AND latitude BETWEEN ? AND ? LIMIT ?'''\n        cursor = connection.execute(query, [east, west, north, south, west, east, south, north, args.max_features + 1])\n        count = write_sequence(cursor, args.output, release, args.max_features)\n        manifest = {'schema': 'overture-places-all-pilot-v1', 'release': release, 'bbox': args.bbox,\n            'feature_count': count, 'category_filter': None, 'confidence_filter': None,\n            'operating_status_filter': None, 'deduplication': False,\n            'created_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': source,\n            'attribution': ATTRIBUTION, 'format': 'geojsonl'}\n        manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')\n        print(f'Wrote {count} unfiltered places. Import with prepare_all_places_arcpy.py in ArcGIS Pro.')\n    finally:\n        connection.close()\n\n\nif __name__ == '__main__':\n    try:\n        main()\n    except Exception as error:\n        print(f'Export failed: {error}', file=sys.stderr)\n        sys.exit(1)\n"
    },
    {
      "file": "tools/overture_places/prepare_all_places_arcpy.py",
      "content": "#!/usr/bin/env python3\n\"\"\"Run in ArcGIS Pro's Python environment to import an all-places pilot snapshot.\n\nCreates a WGS84 file-geodatabase point feature class with explicit nullable fields.\nDoes not publish, change sharing, or enable editing on any service.\n\"\"\"\nimport argparse\nimport json\nfrom pathlib import Path\n\nFIELDS = [\n    ('gers_id', 'TEXT', 160), ('place_name', 'TEXT', 2048), ('category', 'TEXT', 512),\n    ('confidence', 'DOUBLE', None), ('operating_status', 'TEXT', 64),\n    ('address', 'TEXT', 8192), ('website', 'TEXT', 8192), ('data_release', 'TEXT', 40),\n]\n\n\ndef import_snapshot(source, geodatabase, name, arcpy):\n    manifest = json.loads(source.with_suffix('.manifest.json').read_text(encoding='utf-8'))\n    if manifest.get('schema') != 'overture-places-all-pilot-v1' or manifest.get('format') != 'geojsonl':\n        raise ValueError('Expected an all-places pilot export and its matching manifest')\n    destination = str(geodatabase / name)\n    if arcpy.Exists(destination):\n        raise ValueError('Destination exists; use a new release-specific feature class')\n    if not arcpy.Exists(str(geodatabase)):\n        arcpy.management.CreateFileGDB(str(geodatabase.parent), geodatabase.name)\n    arcpy.management.CreateFeatureclass(str(geodatabase), name, 'POINT', spatial_reference=arcpy.SpatialReference(4326))\n    try:\n        for field, kind, length in FIELDS:\n            kwargs = {'field_is_nullable': 'NULLABLE'}\n            if length:\n                kwargs['field_length'] = length\n            arcpy.management.AddField(destination, field, kind, **kwargs)\n        count, identifiers = 0, set()\n        with source.open(encoding='utf-8') as stream, arcpy.da.InsertCursor(destination, ['SHAPE@XY'] + [f[0] for f in FIELDS]) as cursor:\n            for line in stream:\n                feature = json.loads(line)\n                properties = feature['properties']\n                identifier = properties['gers_id']\n                if not identifier or identifier in identifiers:\n                    raise ValueError('Missing or duplicate GERS ID; inspect source before publishing')\n                identifiers.add(identifier)\n                if properties['data_release'] != manifest['release']:\n                    raise ValueError('Mixed releases in source')\n                values = []\n                for field, kind, length in FIELDS:\n                    value = properties.get(field)\n                    if kind == 'TEXT' and value is not None and (not isinstance(value, str) or len(value) > length):\n                        raise ValueError(f'{field} exceeds the publishing schema; no text was silently truncated')\n                    values.append(value)\n                cursor.insertRow([tuple(feature['geometry']['coordinates'])] + values)\n                count += 1\n        if count != manifest['feature_count']:\n            raise ValueError('Record count differs from manifest')\n        arcpy.management.AddIndex(destination, 'gers_id', 'gers_lookup')\n        # Point feature classes get a spatial index; explicitly rebuild after bulk import.\n        arcpy.management.AddSpatialIndex(destination)\n        return destination, count\n    except Exception:\n        arcpy.management.Delete(destination)\n        raise\n\n\ndef main():\n    parser = argparse.ArgumentParser(description=__doc__)\n    parser.add_argument('--input', type=Path, required=True)\n    parser.add_argument('--geodatabase', type=Path, required=True)\n    parser.add_argument('--name', default='overture_places_all_pilot')\n    args = parser.parse_args()\n    import arcpy\n    if arcpy.ValidateTableName(args.name, str(args.geodatabase)) != args.name:\n        parser.error('Choose a valid file-geodatabase feature class name')\n    destination, count = import_snapshot(args.input, args.geodatabase, args.name, arcpy)\n    print(f'Imported {count} places into {destination}. Publish from ArcGIS Pro after reviewing the map.')\n\n\nif __name__ == '__main__':\n    main()\n"
    },
    {
      "file": "docs/OVERTURE-ENTERPRISE-12.1.md",
      "content": "# All-places tile pilot on ArcGIS Enterprise 12.1\n\nEnterprise 12.1 can host vector tile layers and queryable feature layers. Use ArcGIS Pro to author a small test area, then publish both representations from the same imported feature class. GeoParquet remains the upstream source; direct Portal GeoParquet ingestion is not required for this workflow.\n\nThis pilot includes every POI record whose point is in the requested bounding box, across categories, confidence values (including missing confidence), names (including unnamed places), and operating statuses (including permanently closed). It preserves colocated records. It selects useful scalar attributes rather than every nested Overture property. It is complete relative to the selected release and box, not a guarantee of real-world completeness.\n\n## 1. Export a small area\n\nOn an administrator's workstation/build host with Python and internet access:\n\n```sh\npython -m venv .venv-overture\n# Activate the environment using your platform's normal command.\npython -m pip install -r tools/overture_places/requirements.txt\npython tools/overture_places/export_all_places.py \\\n  --release latest \\\n  --bbox=-86.16,39.75,-86.10,39.80 \\\n  --output /YOUR/PUBLISHING/DIRECTORY/places-all.geojsonl\n```\n\nThe example uses the existing Indianapolis pilot area so the new and existing approaches can be compared. `latest` resolves once and is recorded as a dated release in every row and in `places-all.manifest.json`. For a later rerun, use that dated release for reproducibility. Optional `--input-parquet` reads a local snapshot.\n\nThe default safety limit is 25,000 records, with an explicit ceiling of 100,000. An oversized area fails without publishing a truncated snapshot. Split the area instead of raising limits indefinitely. Results stream to disk in 512-row batches; the SQL engine has a 1 GB memory setting. This setting does not cap total process memory. No server-side nationwide export is claimed.\n\n`.geojsonl` is a line-delimited intermediate file, **not** a Portal upload or an ArcGIS JSON To Features input. Keep its manifest alongside it.\n\n## 2. Import in ArcGIS Pro\n\nRun this in ArcGIS Pro's Python environment, using absolute paths appropriate to your workstation:\n\n```sh\npython tools/overture_places/prepare_all_places_arcpy.py \\\n  --input /YOUR/PUBLISHING/DIRECTORY/places-all.geojsonl \\\n  --geodatabase /YOUR/PUBLISHING/DIRECTORY/overture.gdb \\\n  --name places_all_pilot\n```\n\nThe script creates a WGS84 point feature class with explicit nullable fields, a GERS attribute index and a spatial index. Explicit fields preserve confidence as numeric even when the first record has a null value. It validates the manifest count, IDs, release and field lengths. It rejects duplicates or overlong values instead of silently dropping records or truncating text. It cleans up an incomplete feature class on failure and never overwrites an existing one.\n\nReview the imported count against the manifest. Ensure low-confidence, unnamed and uncategorized records were retained if present in this test area. These scripts do not require or use Enterprise credentials.\n\n## 3. Author and publish\n\n1. Sign in to the Enterprise 12.1 portal from a compatible ArcGIS Pro installation. Publishing requires the appropriate portal privileges and a configured hosting server.\n2. Add the feature class to a **2D map** using the ArcGIS Online/Bing Maps/Google Maps-compatible Web Mercator tiling scheme. Use an explicit reference scale and a simple, centered point symbol suitable for vector tiles. Begin with one neutral symbol; category sprites can follow once alignment is validated.\n3. Apply **no definition query**, confidence threshold, category exclusion or operating-status exclusion. Set an explicit layer visibility range, initially matching the current nearby-places zoom range. Low-zoom collision handling is a visualization choice, not a source-record filter. Do not describe collision suppression as clustering or complete visible counts.\n4. Publish a read-only hosted feature layer from this feature class. Keep `gers_id`, `place_name`, `category`, `confidence`, `operating_status`, `address`, `website` and `data_release`. Disable editing and sync. Confirm querying works, GERS IDs remain strings and the service honors a 32-record request cap.\n5. Publish a hosted vector tile layer from the same map/source, using **Share As Web Layer → Vector Tile / Copy all data**, or create a `.vtpk` with **Create Vector Tile Package**, add it to Portal and publish it. Use the package route if the associated-feature options in your installed Pro version differ. Configure source attribution in the tile map/service.\n6. ArcGIS Pro can offer an associated feature layer when sharing vector tiles. If available in your compatible Pro/Enterprise combination, it can replace the separately published details layer; verify its schema, permissions and query limits. A vector tile package alone does not create a queryable POI details service.\n7. Keep tile and details services on the same dated release. Use matching sharing/access settings supported by the widget. Record the vector tile style URL and the actual feature sublayer URL ending in `/FeatureServer/<layer-id>`.\n\nThe Pro UI and associated-layer choices vary with Pro version. Run Share's analyzer and resolve errors before publishing. This repository cannot publish to your Enterprise installation without access to it, and ArcPy is not available in the Linux development environment.\n\n## 4. Connect and verify\n\nFollow [the prototype run instructions](OVERTURE-TILES-PROTOTYPE.md). Its runtime accepts an ArcGIS vector tile style/service URL and a FeatureServer sublayer URL. It does not accept a raw GeoParquet or PMTiles URL.\n\nFirst verify the 2D map, then switch to 3D and start the harness again. Check centered icons, terrain, overlaps, rapid clicks and cancellation. The prototype uses proximity picking, not rendered-symbol identity; it can select a record whose icon was hidden by collision handling. A dense, truncated candidate query intentionally produces no selection.\n\nCompare memory, network traffic and responsiveness with the test mode off/on on a low-end phone. Until those checks pass, keep the existing production POI path unchanged. Hover, existing imagery details, low-zoom aggregation and monthly publishing automation are later integration steps.\n\n## Release updates\n\nExport each new release to a new artifact and import to a new feature class. Validate both tile and detail services before switching the pair in the application. Do not update only one representation: geometry changes can otherwise make picking disagree with icons. Service replacement and cache invalidation need their own deployment design; these scripts do not schedule updates.\n\n## Official documentation\n\n- [Enterprise 12.1: Publish hosted vector tile layers](https://enterprise.arcgis.com/en/portal/12.1/use/publish-vector-tiles.htm)\n- [Enterprise 12.1: Publish hosted feature layers](https://enterprise.arcgis.com/en/portal/12.1/use/publish-features.htm)\n- [ArcGIS Pro: Share a vector tile layer](https://pro.arcgis.com/en/pro-app/latest/help/sharing/overview/vector-tile-layer.htm)\n- [ArcGIS Pro: Create Vector Tile Package](https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/create-vector-tile-package.htm)\n- [Overture cloud delivery and production tile caveats](https://docs.overturemaps.org/getting-data/cloud-sources/)\n"
    },
    {
      "file": "docs/OVERTURE-TILES-PROTOTYPE.md",
      "content": "# Overture POI tile feasibility prototype\n\nThis opt-in development harness renders an ArcGIS-compatible vector tile style without constructing a POI GraphicsLayer. It is a feasibility test, not a replacement for Nearby Places. No new dependency, automatic download, or production service is enabled.\n\nFor the export, ArcGIS Pro import and service publication steps, see [the Enterprise 12.1 workflow](OVERTURE-ENTERPRISE-12.1.md).\n\n## Run\n\nPublish a small test area before testing nationwide data. Supply two HTTPS endpoints from the **same Overture release and area**:\n\n1. An ArcGIS-compatible vector tile style/service using sprite symbols and retaining POI positions. Configure attribution, zoom visibility and collision rules in the published style. A PMTiles archive URL is not an interchangeable endpoint.\n2. A queryable ArcGIS FeatureServer layer with point geometries and `gers_id`; `place_name` supplies the preview name. Publish all source categories and confidence values for a complete-data experiment. The current curated pilot export is insufficient for this purpose.\n\nOpen the browser console with the widget and map ready:\n\n```js\nconst controls = window.__mlyPlacesTiles;\nObject.keys(controls); // widget IDs\nconst prototype = controls[Object.keys(controls)[0]];\nawait prototype.start(\n  'https://YOUR-HOST/VectorTileServer/resources/styles/root.json',\n  'https://YOUR-HOST/FeatureServer/0'\n);\n// Click near a symbol to open its name. Restore normal click handling:\nprototype.stop();\n```\n\nUse trusted endpoints. They need appropriate CORS/access configuration. Keep the existing Nearby Places overlay off during comparison. Test mode owns map clicks; stop it before normal imagery exploration. Changing the widget's map view, closing it, or unmounting stops the experiment.\n\n## Picking and limits\n\nArcGIS native tile rendering remains independent of picking. On click, a 24-pixel screen box is projected to map coordinates and queried with `where: 1=1`, requesting at most 32 candidate records. The nearest candidate within 12 screen pixels opens a plain-text popup. No confidence/category filtering, full-bbox paging, pointer-move fetching, or persistent candidate cache is performed. Map movement and subsequent clicks cancel stale work.\n\nThis is **proximity picking**, not tile-symbol hit testing. Collision-hidden places can be selected; ties and dense areas remain an interaction design issue. Truncated candidate sets are rejected with a console message rather than selecting an arbitrary result. No cluster interaction or complete-result listing is implemented. The details service must honor the request limit; deployment validation must check that explicitly.\n\nThe current popup displays a name only; the existing imagery/details workflow is not connected. It does not create a selection graphic. No claim of production 2D/3D correctness or performance is made from unit tests.\n\n## Acceptance checks before adopting\n\n- In both MapView and SceneView, verify sprite placement, terrain projection, click alignment, overlap behavior, attribution and service compatibility.\n- Compare identical areas with the harness off/on on a low-memory phone: browser memory, responsiveness, frame pacing, network bytes and repeated pan/zoom behavior.\n- Verify cancellation on movement, rapid clicks, view replacement, widget close and service errors.\n- Test a dense area: truncated picking must request zooming rather than choose an incomplete result.\n- Check a low-confidence and uncategorized record are present in the published backend and eligible for picking. Data missing from the backend cannot be recovered by removing runtime filters.\n- Keep tile and detail releases coordinated. Define low-zoom aggregation and complete-search/download behavior separately before national deployment.\n\nThe next infrastructure step is a versioned tile/details publishing pipeline from unfiltered GeoParquet, with a small reproducible test area first. The test-area exporter and ArcGIS Pro importer are available in `tools/overture_places`; this repository does not yet provide a national ingestion pipeline or host those services. Do not use Overture Explorer's demonstration PMTiles as a production backend.\n"
    },
    {
      "file": "tests/overtureAllPlacesExport.test.py",
      "content": "import json\nfrom pathlib import Path\nimport sys\nimport tempfile\nimport unittest\n\nROOT = Path(__file__).resolve().parents[1]\nsys.path.insert(0, str(ROOT / 'tools/overture_places'))\nimport export_all_places as export\n\nclass Cursor:\n    def __init__(self, rows): self.rows = iter(rows)\n    def fetchmany(self, limit):\n        import itertools\n        return list(itertools.islice(self.rows, limit))\n\nclass AllPlacesExportTest(unittest.TestCase):\n    def test_preserves_low_null_confidence_unnamed_uncategorized_closed_and_colocated(self):\n        rows = [('a', None, None, None, None, None, None, 29., 41.),\n                ('b', 'Closed', 'restaurant', 0., 'permanently_closed', '', '', 29., 41.),\n                ('c', 'Cafe', 'cafe', .1, 'open', '', '', 29., 41.)]\n        with tempfile.TemporaryDirectory() as folder:\n            output = Path(folder) / 'places.geojsonl'\n            self.assertEqual(export.write_sequence(Cursor(rows), output, '2026-10-21.0', 3), 3)\n            records = [json.loads(line) for line in output.read_text().splitlines()]\n            self.assertIsNone(records[0]['properties']['confidence'])\n            self.assertIsNone(records[0]['properties']['place_name'])\n            self.assertIsNone(records[0]['properties']['category'])\n            self.assertEqual(records[1]['properties']['operating_status'], 'permanently_closed')\n            self.assertEqual(records[2]['properties']['confidence'], .1)\n            self.assertFalse(output.with_suffix('.geojsonl.tmp').exists())\n\n    def test_limit_or_invalid_source_does_not_replace_existing_output(self):\n        row = ('a', 'A', 'cafe', .1, None, None, None, 29., 41.)\n        for rows in [[row, row], [(None, *row[1:])], [(*row[:-2], float('nan'), 41.)], []]:\n            with self.subTest(rows=rows), tempfile.TemporaryDirectory() as folder:\n                output = Path(folder) / 'places.geojsonl'\n                output.write_text('previous snapshot')\n                with self.assertRaises(ValueError): export.write_sequence(Cursor(rows), output, '2026-10-21.0', 1)\n                self.assertEqual(output.read_text(), 'previous snapshot')\n                self.assertFalse(output.with_suffix('.geojsonl.tmp').exists())\n\n\nclass AllPlacesQueryTest(unittest.TestCase):\n    def test_real_duckdb_query_retains_all_categories_and_confidence(self):\n        try:\n            import duckdb\n        except ImportError:\n            self.skipTest('Install the offline publishing requirements to exercise DuckDB')\n        import struct\n        from unittest.mock import patch\n        with tempfile.TemporaryDirectory() as folder:\n            folder = Path(folder)\n            connection = duckdb.connect()\n            connection.create_function('fixture_ST_GeomFromWKB', lambda value: value, ['BLOB'], 'BLOB')\n            connection.create_function('fixture_ST_X', lambda value: struct.unpack('<bIdd', value)[2], ['BLOB'], 'DOUBLE')\n            connection.create_function('fixture_ST_Y', lambda value: struct.unpack('<bIdd', value)[3], ['BLOB'], 'DOUBLE')\n            connection.execute('CREATE TABLE fixture (id VARCHAR, names STRUCT(\"primary\" VARCHAR), basic_category VARCHAR, confidence DOUBLE, operating_status VARCHAR, geometry BLOB, bbox STRUCT(xmin DOUBLE,xmax DOUBLE,ymin DOUBLE,ymax DOUBLE))')\n            for identifier, name, category, confidence, status, lon in [\n                ('unknown', None, None, None, None, 29.),\n                ('closed', 'Closed', 'restaurant', 0., 'permanently_closed', 29.),\n                ('low', 'Low', 'cafe', .1, 'open', 29.),\n                ('outside', 'Outside', 'cafe', .99, 'open', 35.)]:\n                connection.execute('INSERT INTO fixture VALUES (?, {\"primary\":?}, ?, ?, ?, ?, {xmin:?, xmax:?, ymin:41., ymax:41.})', [identifier, name, category, confidence, status, struct.pack('<bIdd',1,1,lon,41.), lon, lon])\n            parquet = folder / 'source.parquet'\n            connection.table('fixture').write_parquet(str(parquet))\n            class LocalConnection:\n                def execute(self, sql, *args):\n                    if sql.startswith(('INSTALL ', 'LOAD ')): return self\n                    return connection.execute(sql.replace('ST_GeomFromWKB(', 'fixture_ST_GeomFromWKB(').replace('ST_X(', 'fixture_ST_X(').replace('ST_Y(', 'fixture_ST_Y('), *args)\n                def read_parquet(self, source): return connection.read_parquet(source)\n                def close(self): connection.close()\n            output = folder / 'places.geojsonl'\n            with patch.object(duckdb, 'connect', return_value=LocalConnection()):\n                export.main(['--bbox=28.9,40.9,29.1,41.1','--release','2026-10-21.0','--input-parquet',str(parquet),'--output',str(output)])\n            features = [json.loads(line) for line in output.read_text().splitlines()]\n            self.assertEqual({f['properties']['gers_id'] for f in features}, {'unknown','closed','low'})\n            manifest = json.loads(output.with_suffix('.manifest.json').read_text())\n            self.assertEqual(manifest['feature_count'],3)\n            self.assertIsNone(manifest['confidence_filter'])\n            self.assertIsNone(manifest['category_filter'])\n\n\n\nclass ArcGISImportTest(unittest.TestCase):\n    def test_nullable_values_survive_import_and_count_mismatch_rolls_back(self):\n        import prepare_all_places_arcpy as prepare\n        from types import SimpleNamespace\n        for expected_count in [1, 2]:\n            with self.subTest(count=expected_count), tempfile.TemporaryDirectory() as folder:\n                folder = Path(folder)\n                source = folder / 'places.geojsonl'\n                export.write_sequence(Cursor([('a', None, None, None, None, None, None, 29., 41.)]), source, '2026-10-21.0', 10)\n                source.with_suffix('.manifest.json').write_text(json.dumps({'schema':'overture-places-all-pilot-v1','format':'geojsonl','release':'2026-10-21.0','feature_count':expected_count}))\n                inserted, events, fields = [], [], []\n                class InsertCursor:\n                    def __enter__(self): return self\n                    def __exit__(self, *args): return False\n                    def insertRow(self, row): inserted.append(row)\n                management = SimpleNamespace(\n                    CreateFileGDB=lambda *args: None, CreateFeatureclass=lambda *args, **kwargs: None,\n                    AddField=lambda destination, name, kind, **kwargs: fields.append((name,kind,kwargs)),\n                    AddIndex=lambda *args: events.append('index'), AddSpatialIndex=lambda *args: events.append('spatial'),\n                    Delete=lambda *args: events.append('delete'))\n                arcpy = SimpleNamespace(Exists=lambda path: False, SpatialReference=lambda wkid: wkid,\n                    management=management, da=SimpleNamespace(InsertCursor=lambda *args: InsertCursor()))\n                if expected_count == 2:\n                    with self.assertRaisesRegex(ValueError,'count'):\n                        prepare.import_snapshot(source, folder/'test.gdb', 'places', arcpy)\n                    self.assertEqual(events,['delete'])\n                else:\n                    destination, count = prepare.import_snapshot(source, folder/'test.gdb', 'places', arcpy)\n                    self.assertEqual(count,1)\n                    self.assertEqual(inserted[0][1],'a')\n                    self.assertIsNone(inserted[0][4])\n                    self.assertIn(('confidence','DOUBLE',{'field_is_nullable':'NULLABLE'}),fields)\n                    self.assertEqual(events,['index','spatial'])\n\nif __name__ == '__main__': unittest.main()\n"
    },
    {
      "file": "tests/placesTilesPrototype.test.cjs",
      "content": "const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict');\nconst ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};\nnew Function('exports',ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname,'../src/features/places/PlacesTilesPrototype.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports);\nfunction setup(query){\n const events=[],chosen=[];let watcher;\n class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy-tiles')}}\n class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}queryFeatures(q,o){events.push(q);return query(q,o)}destroy(){events.push('destroy-service')}}\n const view={ready:true,stationary:true,map:{add(){events.push('add')},remove(){events.push('remove')}},watch(_,fn){watcher=fn;return{remove(){}}},on(){return{remove(){events.push('remove-click')}}},toMap:p=>({...p,spatialReference:{wkid:3857}}),toScreen:p=>p};\n const errors=[];const p=new m.exports.PlacesTilesPrototype({view,modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected:a=>chosen.push(a.gers_id),error:e=>errors.push(e)});\n return {p,events,chosen,errors,move:()=>watcher(false)};\n}\nconst start=h=>h.p.start('https://example.org/VectorTileServer/resources/styles/root.json','https://example.org/FeatureServer/0');\ntest('native tiles are attached and click query is bounded and unfiltered',async()=>{\n const h=setup(async()=>({features:[{attributes:{gers_id:'a'},geometry:{x:1,y:2}}]}));await start(h);await h.p.pick({x:0,y:0});\n assert.deepEqual(h.chosen,['a']);const q=h.events.find(e=>e.num);assert.equal(q.num,32);assert.equal(q.where,'1=1');h.p.stop();assert(h.events.includes('remove-click'));\n});\ntest('truncated candidates never select an arbitrary nearest place',async()=>{\n const h=setup(async()=>({exceededTransferLimit:true,features:[{attributes:{gers_id:'a'},geometry:{x:0,y:0}}]}));await start(h);await h.p.pick({x:0,y:0});assert.deepEqual(h.chosen,[]);assert.equal(h.errors.length,1);h.p.stop();\n});\ntest('moving or stopping discards an outstanding click',async()=>{\n for(const action of ['move','stop']){let resolve;const h=setup(()=>new Promise(r=>resolve=r));await start(h);const pending=h.p.pick({x:0,y:0});action==='move'?h.move():h.p.stop();resolve({features:[{attributes:{gers_id:'late'},geometry:{x:0,y:0}}]});await pending;assert.deepEqual(h.chosen,[]);h.p.stop();}\n});\ntest('failed service preparation removes resources without attaching tiles',async()=>{\n const h=setup(async()=>({features:[]}));await assert.rejects(h.p.start('http://example.org/style.json','https://example.org/FeatureServer/0'),/HTTPS/);assert(!h.events.includes('add'));\n});\ntest('stopping during service preparation prevents later layer attachment',async()=>{\n let release;const events=[];\n class Tiles{load(){return new Promise(r=>release=r)}destroy(){events.push('destroy')}}\n class Service{fields=[{name:'gers_id'}];load(){return Promise.resolve()}destroy(){}}\n const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});\n const pending=p.start('https://example.org/style.json','https://example.org/FeatureServer/0');p.stop();release();await pending;assert.deepEqual(events,['destroy']);\n});\ntest('service load failure destroys the candidate layer',async()=>{\n const events=[];\n class Tiles{load(){return Promise.resolve()}destroy(){events.push('destroy')}}\n class Service{load(){return Promise.reject(new Error('offline'))}destroy(){events.push('service-destroy')}}\n const p=new m.exports.PlacesTilesPrototype({view:{ready:true,map:{add(){events.push('add')},remove(){}}},modules:{VectorTileLayer:Tiles,FeatureLayer:Service},selected(){},error(){}});\n await assert.rejects(p.start('https://example.org/style.json','https://example.org/FeatureServer/0'),/offline/);assert.deepEqual(events,['destroy','service-destroy']);\n});\n"
    }
  ]
};
const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'overture-poi-tiles-pilot-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed Overture POI tiles pilot installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'overture-poi-tiles-pilot' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after Overture POI tiles pilot installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after Overture POI tiles pilot installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed Overture POI tiles pilot installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-overture-poi-tiles-pilot.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'Overture POI tiles pilot is already uninstalled. No files changed.' : 'Overture POI tiles pilot is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'overture-poi-tiles-pilot', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Overture POI tiles pilot ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Next: read docs/OVERTURE-ENTERPRISE-12.1.md. Export with python tools/overture_places/export_all_places.py --help. Rebuild/reload Experience Builder for the optional tile prototype. This installer does not publish services or install Python dependencies.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
