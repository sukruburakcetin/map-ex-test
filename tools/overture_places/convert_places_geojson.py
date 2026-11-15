#!/usr/bin/env python3
"""Convert an existing exported Places GeoJSONL file into uploadable GeoJSON.

Uses standard-library Python and the included category mapping. No DuckDB,
Portal credentials, database or network access is required.
"""
import argparse
from pathlib import Path
import sys

from places_geojson import MAX_FEATURES, read_sequence, write_features


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True, help='Existing .geojsonl exported Places file.')
    parser.add_argument('--output', type=Path, required=True, help='New .geojson FeatureCollection for Portal upload.')
    parser.add_argument('--max-features', type=int, default=MAX_FEATURES)
    args = parser.parse_args(argv)
    if not args.input.is_file():
        parser.error('--input must be an existing GeoJSONL file')
    if args.output.suffix.lower() != '.geojson':
        parser.error('--output must end in .geojson')
    if args.input.resolve() == args.output.resolve():
        parser.error('Input and output must be different files')
    count = write_features(read_sequence(args.input), args.output, args.max_features, 'geojson')
    print(f'Wrote {count} places to {args.output}. Upload this GeoJSON to Portal as query data; it is not a vector tile package.')
    return count


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Conversion failed: {error}', file=sys.stderr)
        sys.exit(1)
