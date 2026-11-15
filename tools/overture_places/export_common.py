"""Shared release and geographic validation for regional Places exports."""
import argparse
import json
import math
import re
import urllib.request

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
        from places_releases import available_releases
        value = available_releases()[0]
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.\d+', value):
        raise ValueError('Use a dated release such as 2026-10-21.0, or latest.')
    return value
