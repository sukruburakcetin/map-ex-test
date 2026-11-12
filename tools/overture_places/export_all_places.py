#!/usr/bin/env python3
"""Stream an unfiltered regional POI snapshot to GeoJSON or GeoJSONL.

Offline publishing tool; never runs in the widget. All categories, confidence values,
unnamed records and operating statuses are retained. This is a bounded regional exporter.
"""
import argparse
import datetime as dt
import json
from pathlib import Path
import sys
import tempfile

from export_common import ATTRIBUTION, parse_bbox, release_id
from places_geojson import write_features, publish_files


def write_sequence(cursor, output, release, limit, output_format='geojsonl'):
    """Stream DuckDB batches into either format without buffering the full dataset."""
    def features():
        while True:
            rows = cursor.fetchmany(512)
            if not rows:
                return
            for identifier, name, category, confidence, status, address, website, lon, lat in rows:
                properties = dict(zip(
                    ['gers_id', 'place_name', 'category', 'confidence', 'operating_status', 'address', 'website'],
                    [identifier, name, category, confidence, status, address, website]))
                properties['data_release'] = release
                yield {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [lon, lat]}, 'properties': properties}
    return write_features(features(), output, limit, output_format)


def main(argv=None, *, quiet=False):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bbox', type=parse_bbox, required=True)
    parser.add_argument('--release', required=True)
    parser.add_argument('--output', type=Path, required=True, help='New .geojson for Portal or .geojsonl for the external service.')
    parser.add_argument('--format', choices=['geojson', 'geojsonl'], help='Defaults to the output filename extension.')
    parser.add_argument('--input-parquet', type=Path)
    parser.add_argument('--max-features', type=int, default=25000)
    args = parser.parse_args(argv)
    if not 1 <= args.max_features <= 100000:
        parser.error('--max-features must be 1..100000 for this regional exporter')
    output_format = args.format or {'.geojson':'geojson', '.geojsonl':'geojsonl'}.get(args.output.suffix.lower())
    if not output_format or args.output.suffix.lower() != '.' + output_format:
        parser.error('Use a matching .geojson or .geojsonl output extension and format')
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
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.places-export-', dir=args.output.parent) as folder:
            staged = Path(folder) / args.output.name
            count = write_sequence(cursor, staged, release, args.max_features, output_format)
            manifest = {'schema': 'overture-places-all-pilot-v1' if output_format == 'geojsonl' else 'overture-places-portal-v1', 'release': release, 'bbox': args.bbox,
                'feature_count': count, 'category_filter': None, 'confidence_filter': None,
                'operating_status_filter': None, 'deduplication': False,
                'created_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'source': source,
                'attribution': ATTRIBUTION, 'format': output_format}
            staged_manifest = Path(folder) / manifest_path.name
            staged_manifest.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
            publish_files([(staged, args.output), (staged_manifest, manifest_path)])
        if not quiet and output_format == 'geojson':
            print(f'Wrote {count} places and matching manifest. Upload {args.output} to Portal as query data; it is not a vector tile package.')
        elif not quiet:
            print(f'Wrote {count} places and matching manifest. Import with places_service.py import --input {args.output} --database data/places.sqlite')
    finally:
        connection.close()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Export failed: {error}', file=sys.stderr)
        sys.exit(1)
