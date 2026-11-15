"""Streaming regional Places interchange formats. No database or network required."""
import json
import math
import os
from pathlib import Path
import tempfile

from place_categories import icon_group

MAX_FEATURES = 100_000
TEXT_FIELDS = ('place_name', 'category', 'operating_status', 'address', 'website', 'data_release')


def portal_feature(feature):
    """Keep identity, nulls and colocated places; derive the shared category family."""
    if not isinstance(feature, dict) or feature.get('type') != 'Feature':
        raise ValueError('Expected a GeoJSON Feature')
    geometry, properties = feature.get('geometry'), feature.get('properties')
    if not isinstance(geometry, dict) or geometry.get('type') != 'Point' or not isinstance(properties, dict):
        raise ValueError('Expected Point geometry and object properties')
    coords = geometry.get('coordinates')
    if not isinstance(coords, (list, tuple)) or len(coords) not in (2, 3):
        raise ValueError('Expected longitude/latitude point coordinates')
    if any(type(n) not in (int, float) or not math.isfinite(n) for n in coords):
        raise ValueError('Coordinates must be finite numbers')
    if not (-180 <= coords[0] <= 180 and -85.051129 <= coords[1] <= 85.051129):
        raise ValueError('Point is outside supported WGS84/Web Mercator bounds')
    identifier = properties.get('gers_id')
    if not isinstance(identifier, str) or not identifier.strip() or identifier != identifier.strip() or len(identifier) > 160:
        raise ValueError('Expected a nonempty GERS ID of at most 160 characters')
    confidence = properties.get('confidence')
    if confidence is not None and (type(confidence) not in (int, float) or not math.isfinite(confidence) or not 0 <= confidence <= 1):
        raise ValueError('Confidence must be null or a number from 0 to 1')
    for field in TEXT_FIELDS:
        if properties.get(field) is not None and not isinstance(properties[field], str):
            raise ValueError(f'Expected text or null for {field}')
    normalized = dict(properties)
    for field in TEXT_FIELDS:
        normalized.setdefault(field, None)
    normalized['confidence'] = confidence
    normalized['icon_group'] = icon_group(normalized['category'])
    return {**feature, 'geometry': {**geometry, 'coordinates': list(coords)}, 'properties': normalized}


def publish_files(pairs):
    """Exclusive publication on the same filesystem; never overwrite another snapshot."""
    published = []
    try:
        for temporary, destination in pairs:
            os.link(temporary, destination)
            published.append((temporary, destination))
    except Exception:
        for temporary, destination in reversed(published):
            if Path(destination).exists() and os.path.samefile(temporary, destination):
                Path(destination).unlink()
        raise


def write_features(features, output, limit, output_format='geojson'):
    """Bounded streaming conversion; only complete files become visible at output."""
    if output_format not in ('geojson', 'geojsonl'):
        raise ValueError('Format must be geojson or geojsonl')
    if type(limit) is not int or not 1 <= limit <= MAX_FEATURES:
        raise ValueError(f'Feature limit must be 1..{MAX_FEATURES}')
    output = Path(output)
    if output.exists():
        raise ValueError('Output already exists; choose a new filename')
    output.parent.mkdir(parents=True, exist_ok=True)
    handle, filename = tempfile.mkstemp(prefix='.' + output.name + '-', suffix='.tmp', dir=output.parent)
    temporary = Path(filename)
    count, seen = 0, set()
    try:
        with os.fdopen(handle, 'w', encoding='utf-8', newline='\n') as stream:
            if output_format == 'geojson':
                stream.write('{"type":"FeatureCollection","features":[\n')
            for item in features:
                count += 1
                if count > limit:
                    raise ValueError('Area exceeds --max-features; split the area. No truncated snapshot was published.')
                feature = portal_feature(item)
                identifier = feature['properties']['gers_id']
                if identifier in seen:
                    raise ValueError(f'Duplicate GERS ID on feature {count}; no records were deduplicated')
                seen.add(identifier)
                if output_format == 'geojson' and count > 1:
                    stream.write(',\n')
                stream.write(json.dumps(feature, ensure_ascii=False, allow_nan=False))
                if output_format == 'geojsonl':
                    stream.write('\n')
            if not count:
                raise ValueError('No places in this area; no snapshot was published.')
            if output_format == 'geojson':
                stream.write('\n]}\n')
            stream.flush()
            os.fsync(stream.fileno())
        publish_files([(temporary, output)])
        return count
    finally:
        temporary.unlink(missing_ok=True)


def read_sequence(source):
    """Read exported GeoJSONL with bounded line size and useful line errors."""
    with Path(source).open('r', encoding='utf-8-sig') as stream:
        number = 0
        while True:
            line = stream.readline(1024 * 1024 + 1)
            if not line:
                return
            number += 1
            if len(line) > 1024 * 1024:
                raise ValueError(f'GeoJSONL line {number} exceeds 1 MiB of text')
            if not line.strip():
                continue
            try:
                def reject_constant(_value):
                    raise ValueError('Non-finite JSON number')
                feature = json.loads(line, parse_constant=reject_constant)
                yield portal_feature(feature)
            except (ValueError, TypeError) as error:
                raise ValueError(f'Invalid GeoJSONL on line {number}: {error}') from error
