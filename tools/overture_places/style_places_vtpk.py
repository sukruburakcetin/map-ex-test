"""Embed category icon resources in a restored Places package; no ArcPy/network."""
import argparse
from copy import deepcopy
import json
from pathlib import Path, PurePosixPath
import tempfile
import zipfile

from places_sprite import GROUPS, make_sprite
from places_geojson import publish_files
from restore_places_vtpk import (RestorationError, MAX_PACKAGE_BYTES,
    _local_zip_extra_fields, _write_native_zip_member)


def category_style(style):
    result = deepcopy(style)
    contract = result.get('metadata', {}).get('mly:places', {})
    if result.get('version') != 8 or contract.get('version') != 1 or contract.get('sourceLayers') != ['places']:
        raise RestorationError('Use a restored Places package with its query URL configured')
    count = 0
    for layer in result.get('layers', []):
        if layer.get('source-layer') != 'places':
            continue
        if layer.get('type') == 'circle':
            family = layer.get('id', '').rsplit('/', 1)[-1]
            if family not in GROUPS:
                raise RestorationError('Unsupported category in native style')
            layer['type'] = 'symbol'
            layer.pop('paint', None)
            layer['layout'] = {'icon-image': family, 'icon-size': .8,
                'icon-allow-overlap': False, 'icon-ignore-placement': False, 'icon-padding': 2}
            count += 1
        elif layer.get('type') != 'symbol' or 'icon-image' in layer.get('layout', {}):
            raise RestorationError('Expected native category circles and text labels')
    if not count:
        raise RestorationError('No native category circles found; package may already be styled')
    if result.get('sprite') != '../sprites/sprite':
        raise RestorationError('Unsupported native sprite resource path')
    return result, count


def style_package(input_package, output_package):
    source, target = Path(input_package).resolve(), Path(output_package).resolve()
    if source == target or target.suffix.lower() != '.vtpk' or target.exists():
        raise RestorationError('Choose a new output .vtpk path')
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.places-icons-', dir=target.parent) as folder:
        staged = Path(folder)/'styled.vtpk'
        with zipfile.ZipFile(source) as zin:
            members = zin.infolist()
            names = [m.filename for m in members]
            if len(names) != len(set(names)) or len(names) > 20000 or any('..' in PurePosixPath(n).parts or n.startswith('/') or '\\' in n for n in names):
                raise RestorationError('Invalid archive paths')
            if sum(m.file_size for m in members) > MAX_PACKAGE_BYTES or any(m.flag_bits & 1 for m in members):
                raise RestorationError('Encrypted or oversized package')
            styles = [n for n in names if n.endswith('/resources/styles/root.json')]
            if len(styles) != 1 or zin.getinfo(styles[0]).file_size > 1024*1024:
                raise RestorationError('Expected one bounded native style')
            style_path = styles[0]
            style, count = category_style(json.loads(zin.read(style_path).decode('utf-8-sig')))
            resources = style_path[:-len('styles/root.json')]
            updates = {style_path: json.dumps(style, ensure_ascii=False, separators=(',', ':')).encode()}
            for scale, suffix in [(1, ''), (2, '@2x')]:
                png, metadata = make_sprite(scale)
                updates[resources+'sprites/sprite'+suffix+'.png'] = png
                updates[resources+'sprites/sprite'+suffix+'.json'] = json.dumps(metadata, separators=(',', ':')).encode()
            if not set(updates).issubset(names):
                raise RestorationError('Required native sprite resources missing')
            extras = _local_zip_extra_fields(source, members)
            with zipfile.ZipFile(staged, 'w') as zout:
                zout.comment = zin.comment
                for member in members:
                    _write_native_zip_member(zin, zout, member, extras[member.filename], updates.get(member.filename))
            with zipfile.ZipFile(staged) as check:
                if check.testzip() is not None or check.namelist() != names or _local_zip_extra_fields(staged, check.infolist()) != extras:
                    raise RestorationError('Styled archive verification failed')
                for member in members:
                    actual = check.getinfo(member.filename)
                    if actual.extra != member.extra:
                        raise RestorationError('Central header metadata changed')
                    if member.filename in updates:
                        if check.read(member.filename) != updates[member.filename]:
                            raise RestorationError('Style resource verification failed')
                    elif (actual.CRC, actual.file_size) != (member.CRC, member.file_size):
                        raise RestorationError('Tile or unrelated resource changed')
        publish_files([(staged, target)])
    return {'categoryLayers': count, 'tilePayloadsUnchanged': True, 'portalPublishingTested': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(style_package(args.input, args.output)))
    except (RestorationError, ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, 'Places icons: '+str(error)+'\n')
