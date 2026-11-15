"""Import regional Places snapshots and open immutable, versioned SQLite datasets.

Only import writes a database. Serving opens it read-only and never reindexes the
source. SQLite/R-tree are supplied by Python; no separate database server is used.
"""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sqlite3
import tempfile
import unicodedata

from place_categories import icon_group
from places_sprite import GROUPS

SCHEMA_VERSION = 1
APPLICATION_ID = 0x4D4C5950
MAX_RECORDS = 100_000
SNAPSHOT_SCHEMA = 'overture-places-all-pilot-v1'


def connection(database=':memory:', *, readonly=False):
    """One connection is borrowed by a Dataset's serialized query lock."""
    if readonly:
        uri = Path(database).resolve().as_uri() + '?mode=ro'
        db = sqlite3.connect(uri, uri=True, check_same_thread=False)
        db.execute('PRAGMA query_only=ON')
    else:
        db = sqlite3.connect(str(database), check_same_thread=False)
    db.execute('PRAGMA cache_size=-16384')

    def proximity(lon, lat, origin_lon, origin_lat):
        dlat = math.radians(lat - origin_lat)
        dlon = math.radians(lon - origin_lon)
        return math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat)) * math.cos(math.radians(origin_lat)) * math.sin(dlon / 2) ** 2

    db.create_function('proximity', 4, proximity, deterministic=True)
    return db


def manifest_for(source):
    manifest = json.loads(source.with_suffix('.manifest.json').read_text(encoding='utf-8-sig'))
    return validate_manifest(manifest)


def validate_manifest(manifest):
    if not isinstance(manifest, dict) or manifest.get('schema') != SNAPSHOT_SCHEMA:
        raise ValueError('Expected export_all_places.py data and its matching manifest')
    count, bbox = manifest.get('feature_count'), manifest.get('bbox')
    if type(count) is not int or not 1 <= count <= MAX_RECORDS:
        raise ValueError(f'Manifest feature_count must be 1..{MAX_RECORDS}')
    if not isinstance(bbox, (list, tuple)) or len(bbox) != 4 or any(type(n) not in (int, float) or not math.isfinite(n) for n in bbox):
        raise ValueError('Manifest bbox must contain four finite WGS84 coordinates')
    west, south, east, north = bbox
    if not (-180 <= west < east <= 180 and -85.051129 <= south < north <= 85.051129):
        raise ValueError('Manifest bbox is outside supported WGS84 bounds')
    if not isinstance(manifest.get('release'), str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+', manifest['release']):
        raise ValueError('Manifest must identify a pinned Overture release')
    return manifest


def populate(db, source):
    """Build tables/indexes once. Any invalid row rejects the complete import."""
    source = Path(source)
    manifest = manifest_for(source)
    db.execute('CREATE TABLE places (id INTEGER PRIMARY KEY, gers TEXT UNIQUE NOT NULL, x REAL, y REAL, lon REAL, lat REAL, properties TEXT, icon_group TEXT, confidence REAL, operating_status TEXT, search_text TEXT)')
    db.execute('CREATE VIRTUAL TABLE spatial USING rtree(id,minx,maxx,miny,maxy)')
    db.execute('CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
    icons, unmapped, digest = Counter(), Counter(), hashlib.sha256()
    west, south, east, north = manifest['bbox']
    count = 0
    with source.open('rb') as stream:
        for count, raw in enumerate(stream, 1):
            if count > MAX_RECORDS:
                raise ValueError(f'Regional service imports support up to {MAX_RECORDS} places')
            digest.update(raw)
            try:
                feature = json.loads(raw.decode('utf-8-sig'))
                if not isinstance(feature, dict) or feature.get('type') != 'Feature':
                    raise ValueError('Expected a GeoJSON Feature')
                geometry, properties = feature.get('geometry'), feature.get('properties')
                if not isinstance(geometry, dict) or geometry.get('type') != 'Point' or not isinstance(properties, dict):
                    raise ValueError('Expected Point geometry and object properties')
                coords = geometry.get('coordinates')
                if not isinstance(coords, list) or len(coords) not in (2, 3):
                    raise ValueError('Expected longitude/latitude coordinates')
                lon, lat = coords[:2]
                if any(type(n) not in (int, float) or not math.isfinite(n) for n in (lon, lat)) or not west <= lon <= east or not south <= lat <= north:
                    raise ValueError('Point is outside the manifest coverage')
                identifier = properties.get('gers_id')
                if not isinstance(identifier, str) or not identifier.strip() or identifier != identifier.strip() or len(identifier) > 160 or properties.get('data_release') != manifest['release']:
                    raise ValueError('Missing/invalid GERS ID or mismatched release')
                confidence = properties.get('confidence')
                if confidence is not None and (type(confidence) not in (int, float) or not math.isfinite(confidence) or not 0 <= confidence <= 1):
                    raise ValueError('Confidence must be null or a number from 0 to 1')
                x, y = (lon + 180) / 360, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2
                family = icon_group(properties.get('category'))
                icons[family] += 1
                if family == 'other':
                    unmapped[properties.get('category') or '(missing category)'] += 1
                words = ' '.join(str(properties.get(k) or '') for k in ('place_name', 'category', 'address')).replace('_', ' ').casefold()
                search = ''.join(c for c in unicodedata.normalize('NFKD', words) if not unicodedata.combining(c))
                db.execute('INSERT INTO places VALUES (?,?,?,?,?,?,?,?,?,?,?)', (count, identifier, x, y, lon, lat, json.dumps(properties, allow_nan=False), family, confidence, properties.get('operating_status'), search))
                db.execute('INSERT INTO spatial VALUES (?,?,?,?,?)', (count, x, x, y, y))
            except (ValueError, TypeError, KeyError, sqlite3.IntegrityError) as error:
                raise ValueError(f'Invalid place on line {count}: {error}') from error
    if count != manifest['feature_count']:
        raise ValueError('Empty data or manifest count mismatch')
    db.execute('CREATE INDEX places_icon_family ON places(icon_group)')
    metadata = {
        'schema_version': SCHEMA_VERSION, 'count': count, 'manifest': manifest,
        'icon_counts': dict(icons), 'unmapped_categories': dict(unmapped),
        'source_sha256': digest.hexdigest(), 'imported_utc': datetime.now(timezone.utc).isoformat(),
    }
    db.execute('INSERT INTO metadata VALUES (?,?)', ('dataset', json.dumps(metadata, allow_nan=False)))
    db.execute(f'PRAGMA user_version={SCHEMA_VERSION}')
    db.execute(f'PRAGMA application_id={APPLICATION_ID}')
    db.commit()
    return metadata


def import_database(source, destination):
    """Publish a fully checked new file atomically; never replace an existing release."""
    destination = Path(destination).resolve()
    if destination.exists():
        raise ValueError('Database already exists; choose a new dated database path')
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, name = tempfile.mkstemp(prefix='.' + destination.name + '-', suffix='.import', dir=destination.parent)
    os.close(descriptor)
    temporary, db = Path(name), None
    try:
        db = connection(temporary)
        metadata = populate(db, Path(source))
        if db.execute('PRAGMA quick_check').fetchone()[0] != 'ok':
            raise ValueError('Imported database failed its integrity check')
        if db.execute('SELECT count(*) FROM spatial').fetchone()[0] != metadata['count']:
            raise ValueError('Spatial index count mismatch')
        db.close()
        db = None
        with temporary.open('r+b') as stream:
            os.fsync(stream.fileno())
        # Exclusive atomic publication on the same filesystem (including NTFS).
        # A competing importer cannot overwrite a release published first.
        try:
            os.link(temporary, destination)
        except FileExistsError as error:
            raise ValueError('Database already exists; choose a new dated database path') from error
        return metadata
    finally:
        if db is not None:
            db.close()
        temporary.unlink(missing_ok=True)
        Path(str(temporary) + '-journal').unlink(missing_ok=True)


def open_database(database):
    """Read persisted metadata and indexes; no source-file read or index rebuild."""
    db = connection(database, readonly=True)
    try:
        if db.execute('PRAGMA application_id').fetchone()[0] != APPLICATION_ID or db.execute('PRAGMA user_version').fetchone()[0] != SCHEMA_VERSION:
            raise ValueError('Unsupported Places database; import with the matching service tools')
        row = db.execute("SELECT value FROM metadata WHERE key='dataset'").fetchone()
        if row is None:
            raise ValueError('Places database metadata is missing')
        metadata = json.loads(row[0])
        if not isinstance(metadata, dict) or metadata.get('schema_version') != SCHEMA_VERSION:
            raise ValueError('Unsupported Places metadata version')
        validate_manifest(metadata.get('manifest'))
        count = metadata.get('count')
        if type(count) is not int or not 1 <= count <= MAX_RECORDS or metadata.get('manifest', {}).get('feature_count') != count:
            raise ValueError('Invalid Places record count')
        icons = metadata.get('icon_counts')
        if not isinstance(icons, dict) or any(k not in GROUPS or type(v) is not int or v < 0 for k, v in icons.items()) or sum(icons.values()) != count:
            raise ValueError('Invalid Places icon metadata')
        unmapped = metadata.get('unmapped_categories')
        if not isinstance(unmapped, dict) or any(not isinstance(k, str) or type(v) is not int or v < 0 for k, v in unmapped.items()) or sum(unmapped.values()) > count:
            raise ValueError('Invalid Places category metadata')
        required = {'places', 'spatial', 'places_icon_family'}
        present = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE name IN ('places','spatial','places_icon_family')")}
        if required != present:
            raise ValueError('Places indexes are missing; import the dataset again')
        return db, metadata
    except Exception:
        db.close()
        raise
