#!/usr/bin/env python3
"""Regional Places service: import once, inspect, then serve read-only SQLite."""
import argparse
from http.server import ThreadingHTTPServer
import ipaddress
import json
import re
from pathlib import Path
import signal
import sqlite3
import ssl
import threading
from urllib.parse import urlparse

from places_store import import_database, SCHEMA_VERSION
from serve_places_local import Dataset, make_handler


def https_address(value, *, origin=False):
    if not isinstance(value, str) or any(c.isspace() for c in value):
        raise ValueError('Use an HTTPS address without whitespace')
    address = urlparse(value)
    if address.scheme != 'https' or not address.hostname or address.username or address.password or address.query or address.fragment:
        raise ValueError('Use an HTTPS address without credentials, query or fragment')
    if address.port is not None and not 1 <= address.port <= 65535:
        raise ValueError('Invalid HTTPS port')
    if not origin and re.search(r'/(?:FeatureServer|VectorTileServer|style\.json|query|search|status|health)(?:/|$)',address.path,re.I):
        raise ValueError('public_url must be the service base, not an endpoint or ArcGIS service URL')
    if origin and address.path not in ('', '/'):
        raise ValueError('An app origin must not include a page path')
    return value.rstrip('/')


def load_config(file):
    """Resolve all file paths relative to this configuration, never the shell cwd."""
    file = Path(file).resolve()
    config = json.loads(file.read_text(encoding='utf-8-sig'))
    allowed = {'database', 'public_url', 'host', 'port', 'origins', 'tls'}
    if not isinstance(config, dict) or set(config) - allowed:
        raise ValueError('Unexpected service configuration fields')
    required = {'database', 'public_url', 'origins', 'tls'}
    if not required <= config.keys():
        raise ValueError('Configuration requires database, public_url, origins and tls')

    def local(value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError('Expected a nonempty database/certificate path')
        path = Path(value).expanduser()
        return path.resolve() if path.is_absolute() else (file.parent / path).resolve()

    database = local(config['database'])
    if not database.is_file():
        raise ValueError('Configured database does not exist; import it first')
    base = https_address(config['public_url'])
    port = config.get('port', 3444)
    if type(port) is not int or not 1 <= port <= 65535:
        raise ValueError('Port must be an integer from 1 to 65535')
    host = config.get('host', '127.0.0.1')
    if not isinstance(host, str):
        raise ValueError('Host must be a local IPv4 bind address')
    ipaddress.IPv4Address(host)
    origins = config['origins']
    if not isinstance(origins, list) or not origins or len(origins) > 16:
        raise ValueError('Configure 1..16 exact HTTPS app origins')
    origins = list(dict.fromkeys(https_address(origin, origin=True) for origin in origins))
    tls = config['tls']
    if not isinstance(tls, dict) or set(tls) != {'cert', 'key'}:
        raise ValueError('tls requires cert and key paths')
    cert, key = local(tls['cert']), local(tls['key'])
    if not cert.is_file() or not key.is_file():
        raise ValueError('TLS certificate/key not found; supply your trusted HTTPS certificate')
    return {'database': database, 'public_url': base, 'host': host, 'port': port,
            'origins': origins, 'cert': cert, 'key': key}


class PlacesServer(ThreadingHTTPServer):
    """Bound request workers and socket waits; the Dataset serializes SQLite reads."""
    request_queue_size = 32
    daemon_threads = False
    block_on_close = True

    def __init__(self, address, handler, context):
        self.context = context
        self.slots = threading.BoundedSemaphore(16)
        super().__init__(address, handler)

    def get_request(self):
        request, address = super().get_request()
        request.settimeout(15)
        try:
            return self.context.wrap_socket(request, server_side=True), address
        except Exception:
            request.close()
            raise

    def process_request(self, request, address):
        if not self.slots.acquire(blocking=False):
            self.shutdown_request(request)
            return
        try:
            super().process_request(request, address)
        except Exception:
            self.slots.release()
            raise

    def process_request_thread(self, request, address):
        try:
            super().process_request_thread(request, address)
        finally:
            self.slots.release()


def serve(config):
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    context.load_cert_chain(config['cert'], config['key'])
    dataset = Dataset(database=config['database'])
    server = None
    try:
        server = PlacesServer((config['host'], config['port']), make_handler(dataset, config['public_url'], config['origins']), context)
        print(f"Places service: {config['public_url']}/status | {dataset.count} places | read-only SQLite | Ctrl+C to stop", flush=True)
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if server is not None:
            server.server_close()
        dataset.db.close()


def summary(database, dataset):
    return {'ready': True, 'database': str(Path(database).resolve()), 'storage': 'sqlite',
            'schema_version': SCHEMA_VERSION, 'count': dataset.count,
            'release': dataset.manifest['release'], 'bbox': dataset.manifest['bbox'],
            'source_sha256': dataset.source_sha256, 'imported_utc': dataset.imported_utc}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    importer = commands.add_parser('import', help='Build a new versioned database from GeoJSONL + manifest')
    importer.add_argument('--input', type=Path, required=True)
    importer.add_argument('--database', type=Path, required=True)
    inspector = commands.add_parser('inspect', help='Read persisted metadata without starting HTTPS')
    inspector.add_argument('--database', type=Path, required=True)
    server = commands.add_parser('serve', help='Start the configured HTTPS service')
    server.add_argument('--config', type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == 'import':
            metadata = import_database(args.input, args.database)
            print(json.dumps({'database': str(args.database.resolve()), 'count': metadata['count'],
                              'release': metadata['manifest']['release'], 'schema_version': SCHEMA_VERSION}))
        elif args.command == 'inspect':
            dataset = Dataset(database=args.database)
            try:
                print(json.dumps(summary(args.database, dataset)))
            finally:
                dataset.db.close()
        else:
            if threading.current_thread() is threading.main_thread():
                def terminate(_signal, _frame):
                    raise KeyboardInterrupt()
                signal.signal(signal.SIGTERM, terminate)
            serve(load_config(args.config))
    except (ValueError, OSError, sqlite3.Error) as error:
        parser.exit(1, f'Places service: {error}\n')


if __name__ == '__main__':
    main()
