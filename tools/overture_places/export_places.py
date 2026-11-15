#!/usr/bin/env python3
"""Offline GeoParquet -> small, reproducible Enterprise Places publishing artifact.

Runs on an administrator's workstation/build host, never inside the widget.
"""
import argparse
import datetime as dt
import json
import math
from pathlib import Path
import re
import sys
import urllib.request

GROUP_CATEGORIES = {
    'health': ['hospital', 'clinic', 'medical_center', 'pharmacy', 'dentist', 'doctor'],
    'education': ['school', 'primary_school', 'secondary_school', 'university', 'college', 'kindergarten', 'library'],
    'parks': ['park', 'playground', 'garden', 'nature_reserve', 'national_park'],
    'landmarks': ['landmark', 'historic_site', 'monument', 'museum', 'tourist_attraction', 'memorial'],
    'services': ['bank', 'atm', 'post_office', 'gas_station', 'supermarket', 'grocery_store', 'police_station', 'fire_station'],
}
GROUP_HIERARCHIES = {
    'health': ['health', 'health_and_medical', 'health_and_medicine'],
    'education': ['education'], 'parks': ['park'],
    'landmarks': ['historic_site', 'landmark', 'museum'], 'services': [],
}
ATTRIBUTION = 'https://docs.overturemaps.org/attribution/'

def parse_bbox(value):
    try:
        values = tuple(float(v.strip()) for v in value.split(','))
        if len(values) != 4 or not all(math.isfinite(v) for v in values): raise ValueError()
        west, south, east, north = values
        if not (-180 <= west < east <= 180 and -85.051129 <= south < north <= 85.051129): raise ValueError()
        return values
    except ValueError as error:
        raise argparse.ArgumentTypeError('Use west,south,east,north in WGS84; antimeridian-crossing areas must be split.') from error

def release_id(value):
    if value == 'latest':
        with urllib.request.urlopen('https://stac.overturemaps.org/catalog.json', timeout=30) as response:
            value = json.load(response)['latest']
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+', value):
        raise ValueError('Use a dated release such as 2026-10-21.0, or latest.')
    return value

def group_sql():
    parts = []
    for group, categories in GROUP_CATEGORIES.items():
        quoted = ','.join("'" + category + "'" for category in categories)
        ancestors = ','.join("'" + category + "'" for category in GROUP_HIERARCHIES[group])
        hierarchy = f' OR list_has_any(taxonomy.hierarchy, [{ancestors}])' if ancestors else ''
        parts.append(f"WHEN basic_category IN ({quoted}){hierarchy} THEN '{group}'")
    return 'CASE ' + ' '.join(parts) + ' END'

def clean(value, limit):
    return str(value or '').strip()[:limit]

def write_geojson(rows, output, release):
    features, ids, locations = [], set(), set()
    for row in rows:
        gers_id, name, category, group, confidence, address, website, lon, lat = row
        if not gers_id or not name or not group or not all(math.isfinite(float(n)) for n in (confidence, lon, lat)): continue
        name, category = clean(name, 120), clean(category, 80)
        location = (name.lower(), category, round(lon, 6), round(lat, 6))
        if gers_id in ids or location in locations: continue
        ids.add(gers_id); locations.add(location)
        features.append({'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [lon, lat]},
            'properties': {'gers_id': clean(gers_id, 160), 'place_name': name, 'category': category,
                'place_group': group, 'confidence': float(confidence), 'address': clean(address, 180),
                'website': clean(website, 500), 'data_release': release}})
    if not features:
        raise ValueError('No matching places. Check the area, confidence threshold and category mappings.')
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + '.tmp')
    temporary.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False), encoding='utf-8')
    temporary.replace(output)
    return len(features)

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bbox', type=parse_bbox, required=True)
    parser.add_argument('--release', required=True, help='Pin a release for reproducible publishing; latest resolves via STAC.')
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--max-features', type=int, default=25000)
    parser.add_argument('--input-parquet', type=Path, help='Optional local current-schema GeoParquet file instead of cloud data.')
    args = parser.parse_args(argv)
    if args.max_features < 1 or args.max_features > 100000: parser.error('--max-features must be 1..100000')
    release = release_id(args.release)
    try: import duckdb
    except ImportError: parser.error('Install tools/overture_places/requirements.txt in your publishing environment.')
    connection = duckdb.connect()
    try:
        connection.execute("SET memory_limit='1GB'")
        commands = ['INSTALL spatial', 'LOAD spatial']
        if not args.input_parquet: commands += ['INSTALL httpfs', 'LOAD httpfs', "SET s3_region='us-west-2'"]
        for command in commands:
            connection.execute(command)
        source = f's3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*'
        if args.input_parquet:
            if not args.input_parquet.is_file(): raise ValueError('--input-parquet must be an existing file')
            source = str(args.input_parquet.resolve())
        connection.read_parquet(source).create_view('overture_places')
        columns = {row[0]: row[1] for row in connection.execute('DESCRIBE overture_places').fetchall()}
        required = {'id', 'names', 'basic_category', 'taxonomy', 'confidence', 'geometry', 'bbox'}
        if not required.issubset(columns):
            raise ValueError('This release does not match the current taxonomy/basic_category schema. Review its schema before exporting.')
        geometry = 'ST_GeomFromWKB(geometry)' if columns['geometry'] == 'BLOB' else 'geometry'
        address = "addresses[1].freeform" if 'addresses' in columns else "NULL::VARCHAR"
        website = "websites[1]" if 'websites' in columns else "NULL::VARCHAR"
        west, south, east, north = args.bbox
        query = f'''WITH pilot AS (
            SELECT id, names."primary" AS place_name, basic_category AS category,
              {group_sql()} AS place_group, confidence, {address} AS address,
              {website} AS website, ST_X({geometry}) AS longitude, ST_Y({geometry}) AS latitude
            FROM overture_places
            WHERE bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ? AND confidence >= 0.95
        ) SELECT * FROM pilot WHERE place_group IS NOT NULL AND place_name IS NOT NULL
          AND longitude BETWEEN ? AND ? AND latitude BETWEEN ? AND ?
          ORDER BY confidence DESC, id ASC LIMIT ?'''
        rows = connection.execute(query, [east, west, north, south, west, east, south, north, args.max_features + 1]).fetchall()
        if len(rows) > args.max_features:
            raise ValueError('Area exceeds --max-features. Split the area or explicitly raise the publishing limit; no truncated dataset was written.')
        count = write_geojson(rows, args.output, release)
        manifest = {'release': release, 'bbox': args.bbox, 'feature_count': count, 'min_confidence': .95,
            'created_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': source, 'attribution': ATTRIBUTION,
            'groups': GROUP_CATEGORIES, 'schema': 'mapillary-explorer-places-v1'}
        args.output.with_suffix('.manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
        print(f'Wrote {count} places to {args.output}. Release: {release}. Publish using the accompanying Enterprise workflow.')
    finally: connection.close()

if __name__ == '__main__':
    try: main()
    except Exception as error:
        print(f'Export failed: {error}', file=sys.stderr)
        sys.exit(1)
