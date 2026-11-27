import json
import unittest
from time import monotonic, sleep
from urllib.parse import urlencode

from roads_service import RoadQueryTimeout, RoadSource, parse_query, road_payload


def fixture_worker(pipe, release, max_roads):
    with pipe:
        pipe.send(("ready", None))
        while True:
            try:
                bbox = pipe.recv()
            except EOFError:
                return
            if bbox[0] == -1:
                sleep(30)
            pipe.send(("result", {"elements": [], "release": release}))


class RoadsServiceTest(unittest.TestCase):
    def test_accepts_atlanta_widget_query(self):
        query = '''[out:json][timeout:25];
way["highway"](33.743581155378024,-84.35153018365274,33.74775179391776,-84.34570281634727);
out body geom;'''
        timeout, bbox = parse_query(urlencode({"data": query}))
        self.assertEqual(timeout, 25)
        self.assertEqual(bbox, (-84.35153018365274, 33.743581155378024, -84.34570281634727, 33.74775179391776))

    def test_rejects_arbitrary_queries_and_large_extents(self):
        for query in ('node(1);out;', '[out:json][timeout:25]; way["highway"](1,2,3,4); out body geom;'):
            with self.subTest(query=query), self.assertRaises(ValueError):
                parse_query(urlencode({"data": query}))

    def test_projects_road_classes_and_lon_lat_geometry(self):
        shape = json.dumps({"type": "LineString", "coordinates": [[-84.35, 33.74], [-84.34, 33.74]]})
        result = road_payload([("road-1", "primary", shape)], "fixture")
        self.assertEqual(result["elements"], [{
            "id": "road-1", "type": "way", "tags": {"highway": "primary"},
            "geometry": [{"lon": -84.35, "lat": 33.74}, {"lon": -84.34, "lat": 33.74}],
        }])

    def test_invalid_geometry_fails_whole_response(self):
        shape = json.dumps({"type": "Point", "coordinates": [-84.35, 33.74]})
        with self.assertRaises(RuntimeError):
            road_payload([("bad", "service", shape)], "fixture")

    def test_feature_cap_can_be_raised_without_returning_partial_roads(self):
        shape = json.dumps({"type": "LineString", "coordinates": [[-84.35, 33.74], [-84.34, 33.74]]})
        rows = [("road-1", "primary", shape), ("road-2", "service", shape)]
        with self.assertRaisesRegex(ValueError, "too many segments"):
            road_payload(rows, "fixture", max_roads=1)
        self.assertEqual(len(road_payload(rows, "fixture", max_roads=2)["elements"]), 2)

    def test_deadline_stops_a_stalled_worker_and_next_query_recovers(self):
        source = RoadSource("fixture", worker=fixture_worker)
        try:
            source.start(monotonic() + 5)
            worker = source.process
            start = monotonic()
            with self.assertRaises(RoadQueryTimeout):
                source.fetch((-1, 0, 0, 1), 0.1)
            self.assertLess(monotonic() - start, 3)
            self.assertIsNone(source.process)
            self.assertEqual(source.fetch((0, 0, 1, 1), 5)["release"], "fixture")
            self.assertIsNot(source.process, worker)
        finally:
            source.close()
