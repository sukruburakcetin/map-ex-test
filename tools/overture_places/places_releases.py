"""Bounded discovery of pinned releases from Overture's public STAC catalog."""
import datetime as dt
import json
from pathlib import Path
import re
import urllib.request
from urllib.parse import urljoin, urlsplit

CATALOG = 'https://stac.overturemaps.org/catalog.json'
PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}\.\d+$')


def pinned_release(value):
    if not isinstance(value,str) or not PATTERN.fullmatch(value):
        raise ValueError('Use a dated release such as 2026-10-21.0')
    dt.date.fromisoformat(value[:10])
    return value


def release_key(value):
    pinned_release(value)
    date, revision = value.rsplit('.',1)
    return date, int(revision)


def catalog_releases(document):
    if not isinstance(document,dict):raise ValueError('Expected an Overture STAC catalog object')
    found=set()
    latest=document.get('latest')
    if isinstance(latest,str) and PATTERN.fullmatch(latest):found.add(pinned_release(latest))
    for link in document.get('links',[]):
        if not isinstance(link,dict) or link.get('rel') not in ('child','latest'):continue
        href=link.get('href')
        if not isinstance(href,str):continue
        address=urlsplit(urljoin(CATALOG,href))
        if address.scheme!='https' or address.hostname!='stac.overturemaps.org' or address.username or address.password or address.query or address.fragment:continue
        for segment in address.path.split('/'):
            if PATTERN.fullmatch(segment):found.add(pinned_release(segment))
    if not found:raise ValueError('No dated releases found in the catalog; inspect the official catalog before downloading')
    return sorted(found,key=release_key,reverse=True)


def available_releases(catalog_file=None):
    if catalog_file:
        path=Path(catalog_file)
        if path.stat().st_size>2*1024*1024:raise ValueError('Release catalog exceeds 2 MiB')
        document=json.loads(path.read_text(encoding='utf-8-sig'))
    else:
        request=urllib.request.Request(CATALOG,headers={'User-Agent':'MapillaryExplorer-PlacesPreparation/1.0'})
        with urllib.request.urlopen(request,timeout=30) as response:
            data=response.read(2*1024*1024+1)
        if len(data)>2*1024*1024:raise ValueError('Release catalog exceeds 2 MiB')
        document=json.loads(data)
    return catalog_releases(document)
