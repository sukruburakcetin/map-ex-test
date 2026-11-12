#!/usr/bin/env python3
"""Bounded, offline attribute inspection of a Pro-produced VTPK.

Reads ZIP members without extracting them. Compact V2 offsets follow Esri's
published CompactCacheV2 description; this is not a VTPK writer or publisher.
Reports property names/counts, never property values, URLs or credentials.
"""
from collections import Counter
import argparse
import gzip
import io
import json
from pathlib import Path
import struct
import sys
import zipfile

TILE_FIELDS = ('gers_id', 'place_name', 'icon_group', 'confidence', 'operating_status')
MAX_TILE_BYTES = 4 * 1024 * 1024


def _fields(data):
    position, count = 0, 0

    def integer():
        nonlocal position
        value = 0
        for shift in range(0, 70, 7):
            if position >= len(data):
                raise ValueError('Truncated protobuf integer')
            byte = data[position]
            position += 1
            value |= (byte & 127) << shift
            if not byte & 128:
                return value
        raise ValueError('Invalid protobuf integer')

    while position < len(data):
        tag = integer()
        number, wire = tag >> 3, tag & 7
        if not number:
            raise ValueError('Invalid protobuf field')
        if wire == 0:
            value = integer()
        else:
            size = integer() if wire == 2 else 8 if wire == 1 else 4 if wire == 5 else -1
            if size < 0 or position + size > len(data):
                raise ValueError('Truncated or unsupported protobuf field')
            value = data[position:position + size]
            position += size
        count += 1
        if count > 100000:
            raise ValueError('Protobuf field budget exceeded')
        yield number, wire, value


def _packed(data):
    position = 0
    while position < len(data):
        value = 0
        for shift in range(0, 70, 7):
            if position >= len(data):
                raise ValueError('Truncated MVT tags')
            byte = data[position]
            position += 1
            value |= (byte & 127) << shift
            if not byte & 128:
                break
        else:
            raise ValueError('Invalid MVT tag integer')
        yield value


def tile_properties(data):
    if len(data) > MAX_TILE_BYTES:
        raise ValueError('Sample tile exceeds 4 MiB')
    if data[:2] == b'\x1f\x8b':
        with gzip.GzipFile(fileobj=io.BytesIO(data)) as stream:
            data = stream.read(MAX_TILE_BYTES + 1)
        if len(data) > MAX_TILE_BYTES:
            raise ValueError('Decompressed sample tile exceeds 4 MiB')
    rows = 0
    for number, wire, value in _fields(data):
        if number != 3 or wire != 2:
            continue
        layer = list(_fields(value))
        name = next((v.decode('utf-8') for n, w, v in layer if n == 1 and w == 2), '')
        keys = [v.decode('utf-8') for n, w, v in layer if n == 3 and w == 2]
        values = []
        for n, w, v in layer:
            if n != 4 or w != 2:
                continue
            parsed = list(_fields(v))
            if not parsed:
                values.append(None)
                continue
            vn, vw, vv = parsed[0]
            if vn == 1 and vw == 2:
                values.append(vv.decode('utf-8'))
            elif vn == 2 and vw == 5:
                values.append(struct.unpack('<f', vv)[0])
            elif vn == 3 and vw == 1:
                values.append(struct.unpack('<d', vv)[0])
            elif vw == 0:
                values.append(bool(vv) if vn == 7 else -(vv + 1) // 2 if vn == 6 and vv & 1 else vv // 2 if vn == 6 else vv)
            else:
                values.append(None)
        for n, w, v in layer:
            if n != 2 or w != 2:
                continue
            rows += 1
            if rows > 20000:
                raise ValueError('Sample tile feature budget exceeded')
            tags = next((fv for fn, fw, fv in _fields(v) if fn == 2 and fw == 2), b'')
            packed = list(_packed(tags))
            if len(packed) % 2:
                raise ValueError('Odd MVT attribute tag count')
            properties = {}
            for key, index in zip(packed[::2], packed[1::2]):
                if key >= len(keys) or index >= len(values):
                    raise ValueError('Invalid MVT attribute index')
                properties[keys[key]] = values[index]
            yield name, properties


def _bundle_tiles(archive, member, maximum, observations=None):
    if member.file_size > 32 * 1024 * 1024:
        raise ValueError('Bundle exceeds the 32 MiB probe budget')
    with archive.open(member) as stream:
        header = stream.read(64)
        if len(header) != 64:
            raise ValueError('Bundle header is truncated')
        version, records, _, offset_size = struct.unpack_from('<4I', header)
        index_size = struct.unpack_from('<I', header, 60)[0]
        maximum_record_size=struct.unpack_from('<I',header,8)[0]
        if (version, offset_size, index_size) != (3, 5, 131072):
            raise ValueError('Unsupported Compact V2 version, offset width or index size')
        if records == 16384:
            layout = 'compact-v2-capacity-count'
        elif (0 <= records < 16384 and 131092 <= maximum_record_size <= MAX_TILE_BYTES
              and struct.unpack_from('<I',header,48)[0] == 0
              and struct.unpack_from('<I',header,52)[0] == 16384):
            # Observed in the supplied native ArcGIS Pro 3.6 package: offset 4
            # stores populated entries, while the full 16384-slot index is retained.
            layout = 'pro-3.6-populated-count'
        else:
            raise ValueError('Unsupported Compact V2 header variant')
        index = stream.read(index_size)
        if len(index) != index_size:
            raise ValueError('Bundle index is truncated')
        entries = []
        for slot, (record,) in enumerate(struct.iter_unpack('<Q', index)):
            offset, size = record & ((1 << 40) - 1), record >> 40
            if size:
                if size>maximum_record_size:
                    raise ValueError('Bundle tile exceeds its declared maximum record size')
                if offset < 64 + index_size + 4 or offset + size > member.file_size:
                    raise ValueError('Bundle tile offset is outside the file')
                entries.append((offset, size, slot))
        if layout == 'pro-3.6-populated-count' and len(entries) != records:
            raise ValueError('Pro bundle populated count does not match its tile index')
        if observations is not None:
            observations['layout'] = layout
            observations['maximumRecordSize'] = maximum_record_size
            observations['availableTiles'] = len(entries)
            observations['sampledTiles'] = min(len(entries),maximum)
        # Bound sample reads and visit in ascending physical offset.
        for offset, size, slot in sorted(entries)[:maximum]:
            if size > MAX_TILE_BYTES:
                raise ValueError('Sample tile exceeds 4 MiB')
            stream.seek(offset-4)
            length_record = stream.read(4)
            if len(length_record) != 4 or struct.unpack('<I',length_record)[0] != size:
                raise ValueError('Bundle tile length prefix does not match its index')
            payload = stream.read(size)
            if len(payload) != size:
                raise ValueError('Bundle tile is truncated')
            yield slot, payload


def inspect_package(package, *, expected=None, max_bundles=8, max_tiles=32, max_tiles_per_bundle=4):
    """A diagnostic sample only, never a full-data or Portal acceptance certificate."""
    if not 1 <= max_bundles <= 32 or not 1 <= max_tiles <= 128 or not 1 <= max_tiles_per_bundle <= 128:
        raise ValueError('Inspection budget exceeds allowed limits')
    report = {'kind':'places-pro-package-probe', 'version':1, 'purpose':'diagnostic-only',
              'portalPublishingTested':False, 'completeDatasetValidation':False,
              'tilesInspected':0, 'bundlesInspected':0, 'sourceLayers':{}, 'styles':[], 'issues':[]}
    counts, matched = {}, set()
    layouts, known_available, skipped_tiles = Counter(), 0, 0
    with zipfile.ZipFile(package) as archive:
        members = archive.infolist()
        if len(members) > 20000 or len({m.filename for m in members}) != len(members):
            raise ValueError('Package has too many members or duplicate paths')
        bundles = sorted((m for m in members if m.filename.lower().endswith('.bundle')), key=lambda m:m.filename, reverse=True)
        report['bundleCount'] = len(bundles)
        report['hasSeparateBundleIndexes'] = any(m.filename.lower().endswith('.bundlx') for m in members)
        for member in [m for m in members if m.filename.lower().endswith('root.json')][:16]:
            if member.file_size > 1024 * 1024:
                continue
            try:
                root = json.loads(archive.read(member).decode('utf-8-sig'))
            except (ValueError, UnicodeError):
                continue
            if root.get('version') == 8 and isinstance(root.get('layers'), list):
                report['styles'].append({'member':member.filename, 'sourceLayers':sorted({l['source-layer'] for l in root['layers'] if isinstance(l.get('source-layer'), str)})})
            info = root.get('tileInfo')
            if isinstance(info, dict):
                report['tileScheme'] = {key:info.get(key) for key in ('rows','cols','dpi')}
                report['tileScheme']['wkid'] = (info.get('spatialReference') or {}).get('latestWkid') or (info.get('spatialReference') or {}).get('wkid')
                report['tileScheme']['levels'] = [lod.get('level') for lod in info.get('lods', [])]
        if not bundles:
            report['issues'].append('No bundle files found; this package layout needs investigation')
        for member in bundles[:max_bundles]:
            if report['tilesInspected'] >= max_tiles:
                break
            report['bundlesInspected'] += 1
            observations = {}
            try:
                for _, payload in _bundle_tiles(archive, member, min(max_tiles_per_bundle, max_tiles - report['tilesInspected']), observations):
                    report['tilesInspected'] += 1
                    for name, attributes in tile_properties(payload):
                        count = counts.setdefault(name, {'features':0, 'fields':Counter(), 'matchingExpectedRecords':0})
                        count['features'] += 1
                        count['fields'].update(attributes.keys())
                        identifier = attributes.get('gers_id')
                        if expected and identifier in expected:
                            wanted = expected[identifier]
                            valid = True
                            for field in TILE_FIELDS:
                                actual, desired = attributes.get(field), wanted.get(field)
                                if desired is None or desired == '':
                                    valid = valid and actual in (None, '')
                                elif field == 'confidence':
                                    valid = valid and type(actual) in (int,float) and abs(actual - desired) <= .000001
                                else:
                                    valid = valid and actual == desired
                            if valid:
                                matched.add(identifier)
                                count['matchingExpectedRecords'] += 1
            except (ValueError, OSError, EOFError, struct.error, UnicodeError) as error:
                # These are fixed parser diagnostics, not raw attributes or service errors.
                report['issues'].append(str(error))
            finally:
                if 'layout' in observations:
                    layouts[observations['layout']] += 1
                    known_available += observations['availableTiles']
                    skipped_tiles += observations['availableTiles'] - observations['sampledTiles']
        for name, count in counts.items():
            report['sourceLayers'][name] = {**count, 'fields':dict(sorted(count['fields'].items())),
                'requiredFieldsSeen':{field:field in count['fields'] for field in TILE_FIELDS}}
    report['bundleLayouts'] = dict(layouts)
    report['tileEntriesSeen'] = known_available
    report['tilesSkippedBySampling'] = skipped_tiles
    report['sampleBudgetReached'] = skipped_tiles > 0 or report['bundlesInspected'] < report.get('bundleCount', 0)
    report['expectedRecordCount'] = len(expected) if expected is not None else None
    report['uniqueMatchingExpectedRecords'] = len(matched)
    report['sampleContainsRequiredFields'] = bool(counts) and any(all(field in c['fields'] for field in TILE_FIELDS) for c in counts.values())
    report['nextStep'] = 'Review retained fields and package layout before building the full dataset or publishing'
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--tiles-per-bundle',type=int,default=4,help='Bounded sample per bundle (1..128); total limit remains 32')
    args = parser.parse_args(argv)
    if args.report.exists():
        parser.error('Report already exists; use a new filename')
    report = inspect_package(args.input,max_tiles_per_bundle=args.tiles_per_bundle)
    with args.report.open('x', encoding='utf-8') as stream:
        json.dump(report, stream, indent=2, ensure_ascii=False)
    print(f'Wrote attribute/layout diagnostic to {args.report}. This is not publishing approval.')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Inspection failed: {error}', file=sys.stderr)
        sys.exit(1)
