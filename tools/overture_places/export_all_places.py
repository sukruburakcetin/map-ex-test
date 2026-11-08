#!/usr/bin/env python3
"""Stream an unfiltered test-area POI snapshot to GeoJSON sequence (one feature per line).

Offline publishing tool; never runs in the widget. All categories, confidence values,
unnamed records and operating statuses are retained. This is a bounded pilot exporter.
"""
import argparse
import datetime as dt
import json
import math
from pathlib import Path
import sys

from export_places import ATTRIBUTION, parse_bbox, release_id


def write_sequence(cursor, output, release, limit):
    """Publish only complete, valid output; never leave a silently truncated snapshot."""
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + '.tmp')
    count = 0
    try:
        with temporary.open('w', encoding='utf-8') as stream:
            while True:
                rows = cursor.fetchmany(512)
                if not rows:
                    break
                for identifier, name, category, confidence, status, address, website, lon, lat in rows:
                    count += 1
                    if count > limit:
                        raise ValueError('Area exceeds --max-features; split the test area. No truncated snapshot was published.')
                    if not identifier or not all(isinstance(n, (int, float)) and math.isfinite(n) for n in (lon, lat)):
                        raise ValueError('Invalid source ID or geometry; inspect the source before publishing.')
                    if confidence is not None and (not math.isfinite(confidence) or not 0 <= confidence <= 1):
                        raise ValueError('Invalid source confidence; inspect the source before publishing.')
                    properties = dict(zip(
                        ['gers_id', 'place_name', 'category', 'confidence', 'operating_status', 'address', 'website'],
                        [identifier, name, category, confidence, status, address, website]))
                    properties['data_release'] = release
                    feature = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [lon, lat]}, 'properties': properties}
                    stream.write(json.dumps(feature, ensure_ascii=False, allow_nan=False) + '\n')
        if not count:
            raise ValueError('No places in this area; no snapshot was published.')
        temporary.replace(output)
        return count
    finally:
        temporary.unlink(missing_ok=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bbox', type=parse_bbox, required=True)
    parser.add_argument('--release', required=True)
    parser.add_argument('--output', type=Path, required=True, help='New .geojsonl file (not a Portal upload format).')
    parser.add_argument('--input-parquet', type=Path)
    parser.add_argument('--max-features', type=int, default=25000)
    args = parser.parse_args(argv)
    if not 1 <= args.max_features <= 100000:
        parser.error('--max-features must be 1..100000 for this test-area exporter')
    manifest_path = args.output.with_suffix('.manifest.json')
    if args.output.exists() or manifest_path.exists():
        parser.error('Use new output paths; existing release artifacts are never overwritten')
    release = release_id(args.release)
    import duckdb
    connection = duckdb.connect()
    try:
        connection.execute("SET memory_limit='1GB'")
        for sql in ['INSTALL spatial', 'LOAD spatial']:
            connection.execute(sql)
        source = f's3://overturemaps-us-west-2/release/{release}/theme=places/type=place/*'
        if args.input_parquet:
            if not args.input_parquet.is_file():
                parser.error('--input-parquet must exist')
            source = str(args.input_parquet.resolve())
        else:
            for sql in ['INSTALL httpfs', 'LOAD httpfs', "SET s3_region='us-west-2'"]:
                connection.execute(sql)
        connection.read_parquet(source).create_view('overture_places')
        columns = {
            row[0]: row[1] for row in connection.execute('DESCRIBE overture_places').fetchall()}
        if not {'id', 'names', 'basic_category', 'confidence', 'geometry', 'bbox'} <= columns.keys():
            raise ValueError('Source schema changed; review the release schema before publishing')
        geometry = 'ST_GeomFromWKB(geometry)' if columns['geometry'] == 'BLOB' else 'geometry'
        optional = lambda name, expression: expression if name in columns else 'NULL::VARCHAR'
        status = optional('operating_status', 'operating_status')
        address = optional('addresses', 'addresses[1].freeform')
        website = optional('websites', 'websites[1]')
        west, south, east, north = args.bbox
        query = f'''WITH area AS (
            SELECT id, names."primary" AS place_name, basic_category AS category,
                confidence, {status} AS operating_status, {address} AS address, {website} AS website,
                ST_X({geometry}) AS longitude, ST_Y({geometry}) AS latitude
            FROM overture_places
            WHERE bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ?
        ) SELECT * FROM area WHERE longitude BETWEEN ? AND ? AND latitude BETWEEN ? AND ? LIMIT ?'''
        cursor = connection.execute(query, [east, west, north, south, west, east, south, north, args.max_features + 1])
        count = write_sequence(cursor, args.output, release, args.max_features)
        manifest = {'schema': 'overture-places-all-pilot-v1', 'release': release, 'bbox': args.bbox,
            'feature_count': count, 'category_filter': None, 'confidence_filter': None,
            'operating_status_filter': None, 'deduplication': False,
            'created_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': source,
            'attribution': ATTRIBUTION, 'format': 'geojsonl'}
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
        print(f'Wrote {count} unfiltered places. Import with prepare_all_places_arcpy.py in ArcGIS Pro.')
    finally:
        connection.close()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Export failed: {error}', file=sys.stderr)
        sys.exit(1)
