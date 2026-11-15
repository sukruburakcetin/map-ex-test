import { loadArcGISJSAPIModules } from 'jimu-arcgis';

export interface NoteHighlightHandle { remove(): void }

/** Use ArcGIS's layer-view highlight and popup, never a replacement marker symbol.
 * Load SDK readiness before selecting; late results cannot reopen an old popup.
 * Closing the popup releases both handles. The map owner also removes them on
 * another click, a newer selection, view replacement or widget cleanup.
 */
export async function startNoteHighlight(
  view: __esri.MapView | __esri.SceneView,
  layer: __esri.GraphicsLayer,
  graphic: __esri.Graphic,
  current: () => boolean
): Promise<NoteHighlightHandle> {
  const [layerView, [reactiveUtils]] = await Promise.all([
    view.whenLayerView(layer), loadArcGISJSAPIModules(['esri/core/reactiveUtils'])
  ]);
  if (!current()) return { remove() {} };
  const highlight = (layerView as __esri.GraphicsLayerView).highlight(graphic);
  let watcher: NoteHighlightHandle | undefined;
  let removed = false;
  const closeOwnedPopup = () => { if (view.popup?.selectedFeature === graphic) view.closePopup(); };
  const remove = () => {
    if (removed) return;
    removed = true;
    highlight.remove();
    watcher?.remove();
    closeOwnedPopup();
  };
  try {
    watcher = reactiveUtils.watch(() => view.popup?.visible, (visible: boolean | undefined) => {
      if (visible === false) remove();
    });
    // openPopup may return a promise; report rejection without retaining a highlight.
    const opening = view.openPopup({ features: [graphic], location: graphic.geometry as __esri.Point });
    if (opening && typeof opening.then === 'function') void opening.then(() => { if (removed || !current()) { remove(); closeOwnedPopup(); } }, remove);
    if (!current()) remove();
    return { remove };
  } catch (error) { remove(); throw error; }
}
