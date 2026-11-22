const {createMapClickHandler}=require('./mapClickSource.cjs');

function setup({ hovered = true, priority, detection = false, regional = false, legacy = false } = {}) {
  let release;
  const hits = new Promise(resolve => { release = resolve; });
  const trace = [], geometry = { type: 'point', longitude: 1, latitude: 2 };
  const view = { type: '3d', zoom: regional ? 8 : 19.9, stationary: true, destroyed: false,
    toScreen: () => ({ x: 100, y: 100 }), toMap: () => geometry,
    hitTest: () => { trace.push('SDK hit test'); return hits; } };
  const widget = { props: { state: 'OPENED' }, state: { turboModeActive: true, jimuMapView: { view },
    objectsActive: detection, placesActive: priority === 'places' },
    turboCoverageLayer: {}, _turboRequestCount: 1,
    _fieldNoteMap: { clearHighlight() {}, hasPickTargets: false, noteForGraphic: () => null },
    _coverageSelectionTargets: { snapshot: () => hovered && !regional ? { imageId: 'exact-image', sequenceId: 'sequence', geometry } : null, retain() {} },
    coverageSelectionContext: () => ({}), _pointCloudHits: { route: () => false },
    _turboMetadataCache: { get: () => undefined },
    ArcGISModules: { Graphic: class { constructor(properties) { Object.assign(this, properties); } } },
    setState(update) { Object.assign(this.state, update); },
    pickMapFeature: async () => { trace.push('native detection pick'); return null; },
    pickTurboGraphic: async () => ({ geometry, attributes: { image_id: 'exact-image', sequence_id: 'sequence' } }),
    getCoverageDisplayPosition: () => ({ lon: 1, lat: 2 }), drawClickRipple() {},
    loadSequenceById: async (...args) => { trace.push(['open image', args[0], args[1]]); },
    showPlacesHit: () => false, showToast() {}, _t: key => key, updateTurboPickWarning() {},
  };
  if (priority === 'notes') widget._sharedNotesLayer = {};
  if (priority === 'cloud') widget._pointCloudMapLayer = { layer: {} };
  if (priority === 'features') widget.mapillaryObjectsFeatureLayer = {};
  if (regional) {
    widget._turboHoverGraphic = { geometry };
    widget._turboHoveredScreen = { x: 100, y: 100 };
    widget._currentHoveredFeatureId = 'representative';
  }
  const handler = createMapClickHandler(widget, view, {
    TURBO_LIMITS:{pickRadiusPx:8}, LAYER_IDS:{OBJECTS_FL:'objects',TRAFFIC_SIGNS_FL:'signs',TURBO_COVERAGE:'coverage'},
    webMercatorUtils:{webMercatorToGeographic:point=>point},distanceMeters:()=>0,GRAPH_API:{BASE:'unused'}},legacy);
  return { widget, view, trace, handler: () => handler({ x: 100, y: 100, stopPropagation() {} }), release };
}

exports.setup=setup;
