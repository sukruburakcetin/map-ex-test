interface MinimapViewState<P> {
  jimuMapView: { view: { center: P; zoom: number } } | null;
  imageId: string | null;
  sequenceImages: readonly { id: string; lon: number; lat: number }[];
}
export interface MinimapViewOptionsInput<P, M, C> {
  state(): MinimapViewState<P>;
  container(): C;
  map: M;
  zoomOffset: number;
}

/** One-time view configuration; lazy reads preserve center/zoom lookup order. */
export function buildMinimapViewOptions<P, M, C>({
  state, container, map, zoomOffset,
}: MinimapViewOptionsInput<P, M, C>) {
  let initialCenter: P | [number, number] = state().jimuMapView!.view.center;
  if (state().imageId && state().sequenceImages.length > 0) {
    const currentImg = state().sequenceImages.find(img => img.id === state().imageId);
    if (currentImg) initialCenter = [currentImg.lon, currentImg.lat];
  }
  return {
    container: container(), map, center: initialCenter,
    zoom: state().imageId ? 15 : Math.max(3, state().jimuMapView!.view.zoom - zoomOffset),
    ui: { components: [] },
    constraints: { rotationEnabled: true, snapToZoom: true, minZoom: 0, maxZoom: 20 },
    navigation: { mouseWheelZoomEnabled: true, browserTouchPanEnabled: true },
  };
}
