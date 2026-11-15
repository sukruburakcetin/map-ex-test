#!/usr/bin/env python3
"""Create and inspect a SMALL diagnostic VTPK using a real ArcGIS Pro installation.

In Pro's Python window, use runpy.run_path(...) then call build_test(...).
Does not log in, publish, save the current project, or alter existing maps/layers.
The created package is a publishing investigation, not a complete Places dataset.
"""
import argparse
import datetime as dt
import importlib
import json
import math
from pathlib import Path
import sys

_TOOL_DIRECTORY = str(Path(__file__).resolve().parent)
if _TOOL_DIRECTORY not in sys.path:
    sys.path.insert(0, _TOOL_DIRECTORY)
# Pro keeps imported helpers cached between runpy calls. Reload only this tool's
# own modules so installed reader/restoration fixes are used without a Pro restart.
for _helper in ('inspect_places_vtpk','places_geojson','restore_places_vtpk'):
    _loaded = sys.modules.get(_helper)
    if _loaded is not None:
        if Path(getattr(_loaded,'__file__','')).resolve() != Path(_TOOL_DIRECTORY,_helper+'.py').resolve():
            raise RuntimeError('A Places helper is loaded from another tool folder; reopen the Pro Python session')
        importlib.reload(_loaded)
from places_geojson import portal_feature
from inspect_places_vtpk import inspect_package

FIELDS = [
    ('gers_id','TEXT',160), ('place_name','TEXT',512), ('category','TEXT',256),
    ('icon_group','TEXT',64), ('confidence','DOUBLE',None), ('operating_status','TEXT',80),
    ('address','TEXT',2048), ('website','TEXT',2048), ('data_release','TEXT',80),
]


def _distance(a, b):
    lon1, lat1, lon2, lat2 = map(math.radians, (*a, *b))
    h = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 12742000 * math.asin(min(1, math.sqrt(h)))


def select_sample(source, sample_size=50):
    """Select real nearby records, including varied categories/statuses where available."""
    if type(sample_size) is not int or not 1 <= sample_size <= 250:
        raise ValueError('Sample size must be 1..250')
    source = Path(source)
    if source.stat().st_size > 128 * 1024 * 1024:
        raise ValueError('Use a regional GeoJSON smaller than 128 MiB for this probe')
    with source.open(encoding='utf-8-sig') as stream:
        collection = json.load(stream)
    if not isinstance(collection, dict) or collection.get('type') != 'FeatureCollection' or not isinstance(collection.get('features'), list):
        raise ValueError('Input must be the exported .geojson FeatureCollection, not GeoJSONL')
    features = collection['features']
    if not 1 <= len(features) <= 100000:
        raise ValueError('Use a regional input with 1..100000 places')
    first, varied, ordinary, seen, selected_ids = None, [], [], set(), set()
    seen_groups, seen_statuses, seen_scores = set(), set(), set()
    nearby = 0
    for raw in features:
        feature = portal_feature(raw)
        properties = feature['properties']
        identifier = properties['gers_id']
        if identifier in seen:
            raise ValueError('Duplicate GERS IDs are not valid for the package test')
        seen.add(identifier)
        coords = feature['geometry']['coordinates'][:2]
        if first is None:
            first = coords
        if _distance(first, coords) > 2000:
            continue
        nearby += 1
        group, status = properties['icon_group'], properties['operating_status']
        score = 'unknown' if properties['confidence'] is None else 'known'
        diverse = group not in seen_groups or status not in seen_statuses or score not in seen_scores
        if diverse and len(varied) < sample_size:
            varied.append(feature)
            selected_ids.add(identifier)
        elif len(ordinary) < sample_size:
            ordinary.append(feature)
        seen_groups.add(group);seen_statuses.add(status);seen_scores.add(score)
    sample = varied + [f for f in ordinary if f['properties']['gers_id'] not in selected_ids][:max(0,sample_size-len(varied))]
    if max(f['geometry']['coordinates'][0] for f in sample)-min(f['geometry']['coordinates'][0] for f in sample)>180:
        raise ValueError('Split an antimeridian-crossing source before running the regional probe')
    # This is explicitly a subset even when the tiny source has fewer than sample_size records.
    return sample, {'inputRecords':len(features),'nearbyCandidates':nearby,'sampleRecords':len(sample),'sampleRadiusMeters':2000}


def _build_native(source, output_directory, *, project='CURRENT', sample_size=50, fresh_output=False, arcpy_module=None, full_dataset=False):
    """Run in Pro; outputs a new GDB, genuine VTPK and sanitized report in a NEW folder."""
    source = Path(source).resolve()
    if full_dataset:
        from restore_places_vtpk import load_source
        sample, _ = load_source(source)
        if max(f['geometry']['coordinates'][0] for f in sample)-min(f['geometry']['coordinates'][0] for f in sample)>180:
            raise ValueError('Split an antimeridian-crossing dataset before packaging')
        sampling = {'inputRecords':len(sample),'sampleRecords':len(sample),'fullSource':True}
    else:
        sample, sampling = select_sample(source, sample_size)
    # Fail before creating any output when called from ordinary Python.
    if arcpy_module is None:
        try:
            import arcpy as arcpy_module
        except ImportError as error:
            raise RuntimeError('Run this in the ArcGIS Pro Python window or its Python environment') from error
    arcpy = arcpy_module
    base_output = Path(output_directory).resolve()
    base_output.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(10000):
        output = base_output if attempt == 0 else base_output.with_name(base_output.name + '-' + str(attempt + 1))
        try:
            output.mkdir(exist_ok=False)
            break
        except FileExistsError:
            if not fresh_output:
                raise ValueError('Output folder already exists; use fresh_output=True or a new test folder')
    else:
        raise ValueError('Too many existing test folders; choose a new base name')
    print('Package test output:',output)
    package = output / ('places-native.vtpk' if full_dataset else 'places-attribute-probe.vtpk')
    report_path = output / 'places-package-report.json'
    selected_path = output / ('places-package-source.geojson' if full_dataset else 'places-probe.geojson')
    selected_path.write_text(json.dumps({'type':'FeatureCollection','features':sample},ensure_ascii=False,allow_nan=False),encoding='utf-8')
    aprx, test_map, layer = None, None, None
    report = {'kind':'places-pro-package-probe','version':1,'purpose':'diagnostic-only','sampling':sampling,
              'portalPublishingTested':False,'completeDatasetValidation':False,'state':'preparing'}
    try:
        report['arcgisProVersion'] = arcpy.GetInstallInfo().get('Version','unknown')
        gdb = output / 'places-probe.gdb'
        arcpy.management.CreateFileGDB(str(output),gdb.name)
        features = str(gdb / 'places')
        arcpy.management.CreateFeatureclass(str(gdb),'places','POINT',spatial_reference=arcpy.SpatialReference(4326))
        for name, kind, length in FIELDS:
            options = {'field_length':length} if length is not None else {}
            arcpy.management.AddField(features,name,kind,field_is_nullable='NULLABLE',**options)
        names = [field[0] for field in FIELDS]
        with arcpy.da.InsertCursor(features,['SHAPE@XY',*names]) as cursor:
            for feature in sample:
                props = feature['properties']
                for name, _, length in FIELDS:
                    if length is not None and props.get(name) is not None and len(props[name])>length:
                        raise ValueError('Source text exceeds the test field length: '+name)
                cursor.insertRow([feature['geometry']['coordinates'][:2],*[props.get(name) for name in names]])
        arcpy.management.AddIndex(features,'gers_id','gers_id_idx','UNIQUE')
        # Use the Esri Web Mercator Auxiliary Sphere definition used by ONLINE tiles.
        web_mercator = arcpy.SpatialReference(102100)
        projected_features = str(gdb / 'places_web_mercator')
        arcpy.management.Project(features,projected_features,web_mercator)
        aprx = arcpy.mp.ArcGISProject(project)
        map_name = 'Places package probe ' + dt.datetime.now().strftime('%Y%m%d_%H%M%S')
        test_map = aprx.createMap(map_name,'MAP')
        # CreateVectorTilePackage validates map item metadata, not just tool arguments.
        metadata = test_map.metadata
        if metadata.isReadOnly:
            raise RuntimeError('The diagnostic map metadata must be writable')
        metadata.title = 'Overture Places attribute probe'
        metadata.summary = 'Small regional vector tile attribute-retention test'
        metadata.description = 'Diagnostic package of real Overture Places records for inspecting exported tile attributes. This subset is not a complete published Places dataset.'
        metadata.tags = 'Overture,Places,vector tiles,diagnostic'
        metadata.credits = 'Overture Maps Foundation; https://docs.overturemaps.org/attribution/'
        test_map.metadata = metadata
        # Only the newly created map is edited; remove its automatically added basemap.
        for existing in list(test_map.listLayers()):
            test_map.removeLayer(existing)
        layer = test_map.addDataFromPath(projected_features)
        # Adding the first layer can reset a map's spatial reference: assign it afterward.
        test_map.spatialReference = web_mercator
        layer.name = 'places'
        coordinates = [f['geometry']['coordinates'] for f in sample]
        extent = arcpy.Extent(
            max(-180,min(p[0] for p in coordinates)-.001),max(-85.051128,min(p[1] for p in coordinates)-.001),
            min(180,max(p[0] for p in coordinates)+.001),min(85.051128,max(p[1] for p in coordinates)+.001),
            spatial_reference=arcpy.SpatialReference(4326))
        test_map.defaultCamera.setExtent(extent.projectAs(web_mercator))
        symbology = layer.symbology
        symbology.updateRenderer('UniqueValueRenderer')
        symbology.renderer.fields = ['icon_group']
        layer.symbology = symbology
        # Include ordinary place-name labels. We deliberately do not hide attributes in label strings.
        if layer.supports('SHOWLABELS'):
            classes = layer.listLabelClasses()
            for label in classes:
                label.expressionEngine = 'Arcade'
                label.expression = '$feature.place_name'
                label.visible = True
            layer.showLabels = True
        # Reassert and verify the final map and source coordinate systems before packaging.
        test_map.spatialReference = web_mercator
        map_wkid = test_map.spatialReference.factoryCode
        input_wkid = arcpy.Describe(projected_features).spatialReference.factoryCode
        report['mapSpatialReferenceWkid'] = map_wkid
        report['packageInputSpatialReferenceWkid'] = input_wkid
        if map_wkid not in (3857,102100,102113) or input_wkid not in (3857,102100,102113):
            raise RuntimeError('The package map and projected input must both use Web Mercator')
        # Standard 512-pixel Web Mercator vector scales, levels 14..17, small regional probe.
        arcpy.management.CreateVectorTilePackage(
            test_map, str(package), 'ONLINE', None, 'FLAT',
            295828763.795777 / 2**14, 295828763.795777 / 2**17,
            summary=metadata.summary, tags=metadata.tags)
        if not package.is_file():
            raise RuntimeError('ArcGIS Pro did not create the vector tile package')
        expected = {feature['properties']['gers_id']:feature['properties'] for feature in sample}
        inspection = inspect_package(package,expected=expected)
        report.update(inspection)
        report.update({'state':'inspection-complete','sampling':sampling,'arcgisProVersion':arcpy.GetInstallInfo().get('Version','unknown')})
        if full_dataset:report.update({'kind':'places-native-package-build','purpose':'full-source-native-build'})
    except Exception as error:
        # Do not write raw ArcPy errors: they can contain service URLs/session details.
        report['state'] = 'failed'
        report['failureType'] = type(error).__name__
        report['nextStep'] = 'Review the local ArcGIS Pro error and share only the sanitized package report'
        raise
    finally:
        if aprx is not None and test_map is not None:
            try:
                aprx.deleteItem(test_map)
            except Exception:
                report['temporaryMapCleanup'] = 'Remove the Places package probe map manually; existing maps were not changed'
        # No aprx.save() and no publishing or identity calls.
        with report_path.open('x',encoding='utf-8') as stream:
            json.dump(report,stream,indent=2,ensure_ascii=False)
    print('Created a native VTPK and report in:' if full_dataset else 'Created a diagnostic VTPK and report in:',output)
    if full_dataset:
        print('Native full-source package created; restoring and verifying source attributes next.')
    else:
        print('Next: share places-package-report.json for the attribute/layout review. The full Portal workflow is not certified yet.')
    return report, output


def build_test(source, output_directory, *, project='CURRENT', sample_size=50, fresh_output=False, arcpy_module=None):
    return _build_native(source,output_directory,project=project,sample_size=sample_size,fresh_output=fresh_output,arcpy_module=arcpy_module)[0]


def build_portal_package(source, output_directory, *, query_url, project='CURRENT', fresh_output=True, arcpy_module=None):
    """Build the entire regional source in Pro, then restore attributes offline.

    Does not upload or publish. Portal acceptance remains a separate test.
    """
    from restore_places_vtpk import restore_package, query_layer_url
    query_url = query_layer_url(query_url)
    if query_url is None:
        raise ValueError('Supply the matching FeatureServer numeric query-layer URL')
    _, output = _build_native(source,output_directory,project=project,fresh_output=fresh_output,arcpy_module=arcpy_module,full_dataset=True)
    try:
        result = restore_package(output/'places-native.vtpk',output/'places-package-source.geojson',output/'places-portal.vtpk',query_url=query_url)
    except Exception as error:
        from restore_places_vtpk import RestorationError
        detail = str(error) if isinstance(error,RestorationError) else 'Inspect the local exception; raw exception data is not copied to the report'
        with (output/'places-restoration-error.json').open('x',encoding='utf-8') as stream:
            json.dump({'state':'restoration-failed','failureType':type(error).__name__,'detail':detail,'portalPublishingTested':False},stream,indent=2)
        raise
    print('Attribute-restored full-source package:',output/'places-portal.vtpk')
    print('Next: test publication and the widget connection against the matching Portal query layer.')
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    parser.add_argument('--project',default='CURRENT',help='CURRENT inside Pro, or an existing .aprx when using the Pro Python command prompt')
    parser.add_argument('--sample-size',type=int,default=50)
    parser.add_argument('--query-url',help='Build ALL source records and restore attributes, paired to this FeatureServer layer URL')
    parser.add_argument('--fresh-output',action='store_true',help='Choose a new numbered folder without overwriting earlier attempts')
    args = parser.parse_args(argv)
    if args.query_url:
        return build_portal_package(args.input,args.output_dir,query_url=args.query_url,project=args.project,fresh_output=args.fresh_output)
    return build_test(args.input,args.output_dir,project=args.project,sample_size=args.sample_size,fresh_output=args.fresh_output)


if __name__ == '__main__':
    main()
