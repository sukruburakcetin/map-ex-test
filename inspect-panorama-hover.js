(() => {
  const delay = 8000;
  const numeric = value => Number.isFinite(value) ? value : null;
  const normalize = value => ((value % 360) + 360) % 360;
  const id = value => value == null ? null : String(value);

  function widgetFor(element) {
    // Read the React instance from the widget root in the current frame.
    const key = Object.keys(element).find(name => name.startsWith('__reactFiber$'));
    for (let fiber = key && element[key]; fiber; fiber = fiber.return) {
      const instance = fiber.stateNode;
      if (instance?._turboMetadataCache && instance?.state?.jimuMapView) return instance;
    }
    return null;
  }

  console.info('Panorama check: hold the pointer over the preview for the next 8 seconds.');
  setTimeout(() => {
    const widgets = [...new Set(Array.from(document.querySelectorAll('.widget-mapillary'), widgetFor).filter(Boolean))];
    const hovered = widgets.filter(widget =>
      widget._currentHoveredFeatureId && widget.tooltipDiv?.style.display !== 'none' &&
      widget.tooltipDiv?.querySelector('img'));
    if (hovered.length !== 1) {
      console.warn('Panorama check: no unique visible hover card. Use the app frame and try again with the preview thumbnail visible.');
      return;
    }

    const widget = hovered[0];
    const view = widget.state.jimuMapView.view;
    const thumbnail = widget.tooltipDiv.querySelector('img').src;
    // Read entries directly so the diagnostic cannot change cache recency.
    const matches = Array.from(widget._turboMetadataCache.entries?.values() || [], entry => entry.value)
      .filter(data => data?.thumb_256_url && data.id != null && data.thumb_256_url === thumbnail);
    const data = matches.length === 1 ? matches[0] : null;
    const stored = numeric(data?.computed_compass_angle) ?? numeric(data?.compass_angle);
    const pointer = widget._turboHoverAnchor?.querySelector('[data-panorama-pointer]');
    const transform = pointer?.getAttribute('transform') || '';
    const drawnAngle = pointer && pointer.style.display !== 'none'
      ? numeric(Number(transform.match(/rotate\(([-+\d.eE]+)\)/)?.[1])) : null;
    const zoom = numeric(view?.zoom);
    const rotation = numeric(view?.rotation);
    const worldPath = view?.type === '2d' && zoom !== null && zoom < 4 &&
      view?.spatialReference?.isWebMercator === true && rotation !== null;
    const previewId = id(data?.id);
    const openId = widget.mapillaryViewer && widget._profileConfirmedViewer === widget.mapillaryViewer
      ? id(widget._profileConfirmedImageId) : null;
    const viewerHeading = numeric(widget._currentImageBearing?.read(widget.mapillaryViewer, openId));

    console.log(JSON.stringify({
      schema: 'mapillary-panorama-bearing-check/1',
      map: { type: view?.type ?? null, zoom, rotation, wkid: view?.spatialReference?.wkid ?? null, worldPath },
      hover: {
        pickedImageId: id(widget._currentHoveredFeatureId),
        previewImageId: previewId,
        thumbnailCacheMatches: matches.length,
        panorama: data?.is_pano ?? null,
        computedCompass: numeric(data?.computed_compass_angle),
        originalCompass: numeric(data?.compass_angle),
        arrowScreenAngle: drawnAngle === null ? null : normalize(drawnAngle),
        expectedWorldScreenAngle: worldPath && stored !== null ? normalize(stored - rotation) : null,
      },
      viewer: {
        confirmedImageId: openId,
        heading: viewerHeading,
        lastHeadingUsedByWidget: numeric(widget._lastBearing),
      },
      sameCapture: previewId && openId ? previewId === openId : null,
    }, null, 2));
  }, delay);
})();
