#!/usr/bin/env python3
"""Serve Overture road geometry for Mapillary Explorer's coverage query."""
import argparse
import json
import logging
import math
import multiprocessing
import re
import ssl
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import BoundedSemaphore
from time import monotonic
from urllib.parse import parse_qs, urlsplit

NUMBER = r"-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?"
QUERY = re.compile(
    r'\s*\[out:json\]\[timeout:(12|25)\];\s*way\["highway"\]\(\s*'
    + r'\s*,\s*'.join([f"({NUMBER})"] * 4) + r'\s*\);\s*out body geom;\s*'
)
MAX_ROADS = 4000
MAX_VERTICES = 100_000


class RoadAreaLimit(ValueError):
    pass


def parse_query(body):
    values = parse_qs(body, max_num_fields=1, strict_parsing=True)
    if set(values) != {"data"} or len(values["data"]) != 1:
        raise ValueError("Expected a single data form field.")
    match = QUERY.fullmatch(values["data"][0])
    if not match:
        raise ValueError("Only the Mapillary Explorer road query is supported.")
    timeout, south, west, north, east = map(float, match.groups())
    if not (-90 <= south < north <= 90 and -180 <= west < east <= 180):
        raise ValueError("Expected a valid geographic bounding box.")
    if north - south > 0.25 or east - west > 0.5:
        raise RoadAreaLimit("Road area too large. Zoom in and try again.")
    return int(timeout), (west, south, east, north)


def road_payload(rows, release, max_roads=MAX_ROADS):
    ways = []
    vertices = 0
    for road_id, road_class, geometry in rows:
        if len(ways) >= max_roads:
            raise RoadAreaLimit("Road area contains too many segments. Zoom in and try again.")
        shape = json.loads(geometry)
        if shape["type"] != "LineString" or len(shape["coordinates"]) < 2:
            raise RuntimeError("Invalid Overture road geometry.")
        nodes = []
        for lon, lat, *_ in shape["coordinates"]:
            if not (math.isfinite(lon) and math.isfinite(lat) and abs(lon) <= 180 and abs(lat) <= 90):
                raise RuntimeError("Invalid Overture road coordinates.")
            nodes.append({"lon": lon, "lat": lat})
        vertices += len(nodes)
        if vertices > MAX_VERTICES:
            raise RoadAreaLimit("Road area contains too many vertices. Zoom in and try again.")
        ways.append({"type": "way", "id": road_id, "tags": {"highway": road_class or "residential"}, "geometry": nodes})
    return {"version": 0.6, "generator": "Mapillary Explorer Overture roads", "release": release, "elements": ways}


class DuckDBRoadSource:
    def __init__(self, release, max_roads=MAX_ROADS):
        import duckdb
        self.release = release
        self.max_roads = max_roads
        self.db = duckdb.connect()
        self.db.execute("SET memory_limit='512MB'; SET threads=2")
        self.db.execute("SET custom_extension_repository='https://extensions.duckdb.org'")
        for command in ("INSTALL spatial", "LOAD spatial", "INSTALL httpfs", "LOAD httpfs", "SET s3_region='us-west-2'"):
            print(f"DuckDB: {command}", flush=True)
            self.db.execute(command)
        source = f"s3://overturemaps-us-west-2/release/{release}/theme=transportation/type=segment/*"
        print(f"Opening Overture Transportation release {release}…", flush=True)
        self.db.read_parquet(source).create_view("transportation")
        columns = dict((row[0], row[1]) for row in self.db.execute("DESCRIBE transportation").fetchall())
        if not {"id", "class", "subtype", "bbox", "geometry"} <= columns.keys():
            raise ValueError("Overture Transportation schema is incompatible.")
        geometry = "ST_GeomFromWKB(geometry)" if columns["geometry"] == "BLOB" else "geometry"
        self.sql = f'''
            SELECT id, "class", ST_AsGeoJSON({geometry})
            FROM transportation
            WHERE subtype = 'road'
              AND bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ?
              AND ST_Intersects({geometry}, ST_MakeEnvelope(?, ?, ?, ?))
            LIMIT ?
        '''

    def fetch(self, bbox):
        west, south, east, north = bbox
        rows = self.db.execute(self.sql, [east, west, north, south, *bbox, self.max_roads + 1]).fetchall()
        return road_payload(rows, self.release, self.max_roads)


class RoadQueryTimeout(TimeoutError):
    pass


def _road_worker(pipe, release, max_roads):
    with pipe:
        try:
            roads = DuckDBRoadSource(release, max_roads)
        except Exception as error:
            logging.exception("Could not initialize the Overture road worker")
            pipe.send(("startup-error", str(error)))
            return
        pipe.send(("ready", None))
        while True:
            try:
                bbox = pipe.recv()
            except EOFError:
                return
            try:
                result = roads.fetch(bbox)
            except RoadAreaLimit as error:
                pipe.send(("area-limit", str(error)))
            except Exception:
                logging.exception("Overture road read failed")
                pipe.send(("error", None))
            else:
                pipe.send(("result", result))


class RoadSource:
    """Worker isolation lets the server reclaim the query slot after a stalled remote read."""

    def __init__(self, release, max_roads=MAX_ROADS, worker=_road_worker):
        self.release = release
        self.max_roads = max_roads
        self.worker = worker
        self.context = multiprocessing.get_context("spawn")
        self.process = None
        self.pipe = None

    def _receive(self, deadline):
        if not self.pipe.poll(max(0, deadline - monotonic())):
            raise RoadQueryTimeout("Overture road query timed out.")
        return self.pipe.recv()

    def start(self, deadline):
        if self.process is not None and self.process.is_alive():
            return
        self.close()
        parent, child = self.context.Pipe()
        process = self.context.Process(target=self.worker, args=(child, self.release, self.max_roads), daemon=True)
        try:
            process.start()
        except BaseException:
            parent.close()
            raise
        finally:
            child.close()
        self.pipe, self.process = parent, process
        try:
            status, detail = self._receive(deadline)
            if status != "ready":
                raise RuntimeError(detail or "Could not start the Overture road worker.")
        except BaseException:
            self.close()
            raise

    def fetch(self, bbox, timeout):
        deadline = monotonic() + timeout
        try:
            self.start(deadline)
            self.pipe.send(bbox)
            status, detail = self._receive(deadline)
        except (RoadQueryTimeout, EOFError, OSError):
            self.close()
            raise
        if status == "area-limit":
            raise RoadAreaLimit(detail)
        if status != "result":
            raise RuntimeError("Overture road data is temporarily unavailable.")
        return detail

    def close(self):
        if self.pipe is not None:
            self.pipe.close()
            self.pipe = None
        if self.process is not None:
            if self.process.is_alive():
                self.process.terminate()
                self.process.join(timeout=0.5)
                if self.process.is_alive():
                    self.process.kill()
            self.process.join()
            self.process.close()
            self.process = None


class RoadHandler(BaseHTTPRequestHandler):
    def cors_origin(self):
        origin = self.headers.get("Origin")
        return origin if origin in self.server.origins else None

    def reply(self, status, payload, retry=None):
        data = json.dumps(payload, separators=(",", ":")).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        origin = self.cors_origin()
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Expose-Headers", "Retry-After")
        self.send_header("Cache-Control", "no-store")
        if retry is not None:
            self.send_header("Retry-After", str(retry))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass
        return len(data)

    def do_GET(self):
        if self.path == "/health":
            self.reply(200, {"release": self.server.roads.release})
        else:
            self.reply(404, {"error": "Unknown path."})

    def do_POST(self):
        if self.path != "/api/interpreter":
            return self.reply(404, {"error": "Unknown path."})
        if not self.cors_origin():
            return self.reply(403, {"error": "Origin is not allowed."})
        if self.headers.get_content_type() != "application/x-www-form-urlencoded":
            return self.reply(415, {"error": "Use a URL-encoded data form field."})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 2048:
                raise ValueError("Invalid request size.")
            self.connection.settimeout(5)
            timeout, bbox = parse_query(self.rfile.read(length).decode("utf-8"))
        except RoadAreaLimit as error:
            return self.reply(422, {"error": str(error)})
        except (ValueError, OSError):
            return self.reply(400, {"error": "Invalid or oversized road query."})
        if not self.server.slot.acquire(blocking=False):
            return self.reply(503, {"error": "Road service is at capacity."}, retry=5)
        started = monotonic()
        self.log_message("Road query started (deadline %d s)", timeout)
        try:
            payload = self.server.roads.fetch(bbox, timeout)
        except RoadQueryTimeout:
            self.reply(504, {"error": "Overture road query timed out."})
        except ValueError as error:
            self.reply(422, {"error": str(error)})
        except Exception:
            logging.exception("Overture road query failed")
            self.reply(503, {"error": "Overture road data is temporarily unavailable."}, retry=10)
        else:
            size = self.reply(200, payload)
            ways = payload["elements"]
            vertices = sum(len(way["geometry"]) for way in ways)
            self.log_message("Road query: %d features, %d vertices, %d bytes, %.2f s",
                             len(ways), vertices, size, monotonic() - started)
        finally:
            self.server.slot.release()
            self.log_message("Road query slot released after %.2f s", monotonic() - started)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release", required=True)
    parser.add_argument("--origin", action="append", required=True)
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--max-roads", type=int, default=MAX_ROADS,
                        help=f"Maximum road features per request (default: {MAX_ROADS})")
    parser.add_argument("--cert", type=Path, help="Local HTTPS certificate, such as Experience Builder's server.cert")
    parser.add_argument("--key", type=Path, help="Private key for the certificate")
    args = parser.parse_args()
    if not 1 <= args.max_roads <= MAX_VERTICES // 2:
        parser.error(f"--max-roads must be between 1 and {MAX_VERTICES // 2}.")
    if bool(args.cert) != bool(args.key):
        parser.error("Provide --cert and --key together.")
    tls = None
    if args.cert and args.key:
        tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        try:
            tls.load_cert_chain(args.cert, args.key)
        except (OSError, ssl.SSLError) as error:
            parser.error(f"Could not load the HTTPS certificate and key: {error}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}\.\d+", args.release):
        parser.error("Use an Overture release ID such as YYYY-MM-DD.0.")
    for origin in args.origin:
        parts = urlsplit(origin)
        if parts.scheme != "https" or not parts.hostname or parts.username or parts.password or parts.path or parts.query or parts.fragment:
            parser.error("Use an exact HTTPS origin without a path.")
    with ThreadingHTTPServer(("127.0.0.1", args.port), RoadHandler) as server:
        if tls:
            server.socket = tls.wrap_socket(server.socket, server_side=True)
        server.roads = RoadSource(args.release, args.max_roads)
        server.origins = frozenset(args.origin)
        server.slot = BoundedSemaphore(1)
        server.roads.start(monotonic() + 60)
        base = f"{'https' if tls else 'http'}://localhost:{args.port}"
        print(f"Overture road service ready. Health check: {base}/health", flush=True)
        if tls:
            print(f"Builder coverage road service URL: {base}/api/interpreter", flush=True)
        try:
            server.serve_forever()
        finally:
            server.roads.close()


if __name__ == "__main__":
    main()
