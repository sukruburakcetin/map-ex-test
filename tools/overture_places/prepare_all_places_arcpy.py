#!/usr/bin/env python3
"""Run in ArcGIS Pro's Python environment to import an all-places pilot snapshot.

Creates a WGS84 file-geodatabase point feature class with explicit nullable fields.
Does not publish, change sharing, or enable editing on any service.
"""
import argparse
import json
from pathlib import Path

FIELDS = [
    ('gers_id', 'TEXT', 160), ('place_name', 'TEXT', 2048), ('category', 'TEXT', 512),
    ('confidence', 'DOUBLE', None), ('operating_status', 'TEXT', 64),
    ('address', 'TEXT', 8192), ('website', 'TEXT', 8192), ('data_release', 'TEXT', 40),
]


def import_snapshot(source, geodatabase, name, arcpy):
    manifest = json.loads(source.with_suffix('.manifest.json').read_text(encoding='utf-8'))
    if manifest.get('schema') != 'overture-places-all-pilot-v1' or manifest.get('format') != 'geojsonl':
        raise ValueError('Expected an all-places pilot export and its matching manifest')
    destination = str(geodatabase / name)
    if arcpy.Exists(destination):
        raise ValueError('Destination exists; use a new release-specific feature class')
    if not arcpy.Exists(str(geodatabase)):
        arcpy.management.CreateFileGDB(str(geodatabase.parent), geodatabase.name)
    arcpy.management.CreateFeatureclass(str(geodatabase), name, 'POINT', spatial_reference=arcpy.SpatialReference(4326))
    try:
        for field, kind, length in FIELDS:
            kwargs = {'field_is_nullable': 'NULLABLE'}
            if length:
                kwargs['field_length'] = length
            arcpy.management.AddField(destination, field, kind, **kwargs)
        count, identifiers = 0, set()
        with source.open(encoding='utf-8') as stream, arcpy.da.InsertCursor(destination, ['SHAPE@XY'] + [f[0] for f in FIELDS]) as cursor:
            for line in stream:
                feature = json.loads(line)
                properties = feature['properties']
                identifier = properties['gers_id']
                if not identifier or identifier in identifiers:
                    raise ValueError('Missing or duplicate GERS ID; inspect source before publishing')
                identifiers.add(identifier)
                if properties['data_release'] != manifest['release']:
                    raise ValueError('Mixed releases in source')
                values = []
                for field, kind, length in FIELDS:
                    value = properties.get(field)
                    if kind == 'TEXT' and value is not None and (not isinstance(value, str) or len(value) > length):
                        raise ValueError(f'{field} exceeds the publishing schema; no text was silently truncated')
                    values.append(value)
                cursor.insertRow([tuple(feature['geometry']['coordinates'])] + values)
                count += 1
        if count != manifest['feature_count']:
            raise ValueError('Record count differs from manifest')
        arcpy.management.AddIndex(destination, 'gers_id', 'gers_lookup')
        # Point feature classes get a spatial index; explicitly rebuild after bulk import.
        arcpy.management.AddSpatialIndex(destination)
        return destination, count
    except Exception:
        arcpy.management.Delete(destination)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--geodatabase', type=Path, required=True)
    parser.add_argument('--name', default='overture_places_all_pilot')
    args = parser.parse_args()
    import arcpy
    if arcpy.ValidateTableName(args.name, str(args.geodatabase)) != args.name:
        parser.error('Choose a valid file-geodatabase feature class name')
    destination, count = import_snapshot(args.input, args.geodatabase, args.name, arcpy)
    print(f'Imported {count} places into {destination}. Publish from ArcGIS Pro after reviewing the map.')


if __name__ == '__main__':
    main()
