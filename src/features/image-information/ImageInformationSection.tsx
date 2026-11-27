/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { distanceMeters } from '../../utils/geoUtils';
import { ImageInformationController, type ImageInformationHost, type ImagePosition, type InformationViewer, type ImageInformationView } from './ImageInformation';

interface Props {
  host?: ImageInformationHost;
  viewer?: InformationViewer | null;
  active: boolean;
  mapView?: object;
}

/** Metadata subscriptions are owned by the open disclosure. */
export const ImageInformationSection = React.memo(function ImageInformationSection({ host, viewer, active, mapView }: Props) {
  const { t, formatLocale } = useWidgetLocale();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<ImageInformationView>({ kind: 'empty' });
  const [position, setPosition] = React.useState<ImagePosition | null>(null);
  const details = React.useRef<HTMLDetailsElement>(null);
  const owner = React.useRef<{ host: ImageInformationHost; controller: ImageInformationController } | null>(null);
  React.useEffect(() => {
    if (!open || !active || !host || !viewer) return;
    if (owner.current?.host !== host) {
      owner.current?.controller.dispose();
      owner.current = { host, controller: new ImageInformationController(host) };
    }
    const controller = owner.current.controller;
    controller.start(viewer, setView, details.current?.ownerDocument);
    return () => {
      controller.stop();
      setView({ kind: 'empty' });
    };
  }, [host, viewer, open, active]);
  React.useEffect(() => () => owner.current?.controller.dispose(), []);

  const data = view.data;
  React.useEffect(() => {
    const update = () => {
      const next = open && active && viewer && data?.id ? host?.mapPosition?.(viewer, data.id) ?? null : null;
      setPosition(previous => previous?.lat === next?.lat && previous?.lon === next?.lon ? previous : next);
    };
    update();
    if (open && active && data?.id) return host?.watchMapPosition?.(update);
  }, [active, data?.id, host, mapView, open, viewer]);

  if (!host) return null;
  const unavailable = t('imageInfoUnavailable');
  const format = new Intl.NumberFormat(formatLocale, { maximumFractionDigits: 1 });
  const coords = new Intl.NumberFormat(formatLocale, { maximumFractionDigits: 6, useGrouping: false });
  const pointLabel = (point: ImagePosition) => `${coords.format(point.lat)}, ${coords.format(point.lon)}`;
  const unit = (number: number, measure: 'meter' | 'degree') => measure === 'degree' ? `${format.format(number)}°` : new Intl.NumberFormat(formatLocale, {
    style: 'unit', unit: measure, maximumFractionDigits: 1
  }).format(number);
  const projection = data?.projection?.toLowerCase();
  const spherical = projection === 'spherical' || projection === 'equirectangular';
  const formatLabel = data?.panorama === true || spherical ? t('imageInfoPanorama') :
    data?.panorama === false || projection === 'perspective' || projection === 'fisheye' ? t('imageInfoFlat') : null;
  const projectionLabel = projection === 'perspective' ? t('imageInfoPerspective') :
    projection === 'fisheye' ? t('imageInfoFisheye') : spherical ? t('imageInfoEquirectangular') : data?.projection;
  const captured = data?.capturedAt != null ? new Intl.DateTimeFormat(formatLocale, {
    dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC'
  }).format(new Date(data.capturedAt)) : unavailable;
  const dimensions = data?.width && data.height
    ? `${format.format(data.width)} × ${format.format(data.height)} · ${format.format(data.width * data.height / 1000000)} MP` : null;
  const original = data?.originalPosition;
  const processed = data?.processedPosition;
  const difference = original && processed ? distanceMeters(original.lat, original.lon, processed.lat, processed.lon) : null;
  const row = (label: string, content: string | null | undefined, help?: string) => content == null ? null :
    <div className="mly-image-information-row" key={label} title={help}><dt>{label}</dt><dd><bdi>{content}</bdi></dd></div>;
  return <details ref={details} className="mly-image-information" open={open} onToggle={event => {
    const next = event.currentTarget.open;
    if (next !== open) { setView({ kind: 'empty' }); setOpen(next); }
  }}>
    <summary>{t('imageInfoTitle')}</summary>
    {open && active && <div className="mly-image-information-content">
      {view.kind !== 'ready' && <div role="status">{t(view.kind === 'deferred' ? 'imageInfoDeferred' : view.kind === 'error' ? 'imageInfoError' : view.kind === 'empty' ? 'imageInfoNoImage' : 'imageInfoLoading')}</div>}
      {data && <React.Fragment>
        <dl>
          {row(t('imageInfoCaptured'), captured)}
          {row(t('imageInfoFormat'), formatLabel)}
          {row(t('imageInfoContributor'), data.contributor)}
          {row(t('imageInfoMapPosition'), position && pointLabel(position))}
        </dl>
        {(original || processed) && <details className="mly-image-information-group">
          <summary>{t('imageInfoAlignment')}</summary>
          <dl>
            {row(t('imageInfoOriginalGps'), original && pointLabel(original))}
            {row(t('imageInfoProcessedPosition'), processed && pointLabel(processed))}
            {row(t('imageInfoPositionDifference'), difference === null ? null : unit(difference, 'meter'))}
          </dl>
        </details>}
        {(dimensions || data.make || data.model || typeof data.onFoot === 'boolean') && <details className="mly-image-information-group">
          <summary>{t('imageInfoCaptureDetails')}</summary>
          <dl>
            {row(t('imageInfoCamera'), [data.make, data.model].filter(Boolean).join(' · ') || null)}
            {row(t('imageInfoDimensions'), dimensions, t('imageInfoOriginalNote'))}
            {row(t('imageInfoCaptureMethod'), data.onFoot === true ? t('imageInfoFoot') : data.onFoot === false ? t('imageInfoOther') : null)}
          </dl>
        </details>}
        {data.organization && <details className="mly-image-information-group">
          <summary>{t('imageInfoOrganization')}</summary>
          <dl>{row(t('imageInfoOrganization'), data.organization)}</dl>
        </details>}
        <details className="mly-image-information-group">
          <summary>{t('imageInfoTechnical')}</summary>
          <dl>
            {row(t('imageInfoId'), data.id)}
            {row(t('imageInfoSequenceId'), data.sequenceId)}
            {row(t('imageInfoProjection'), projectionLabel)}
            {row(t('imageInfoOriginalHeading'), data.originalHeading == null ? null : unit(data.originalHeading, 'degree'))}
            {row(t('imageInfoProcessedHeading'), data.processedHeading == null ? null : unit(data.processedHeading, 'degree'))}
            {row(t('imageInfoOriginalAltitude'), data.originalAltitude == null ? null : unit(data.originalAltitude, 'meter'))}
            {row(t('imageInfoProcessedAltitude'), data.processedAltitude == null ? null : unit(data.processedAltitude, 'meter'))}
            {row(t('imageInfoQuality'), data.quality == null ? null : new Intl.NumberFormat(formatLocale, { style: 'percent', maximumFractionDigits: 1 }).format(data.quality))}
          </dl>
        </details>
      </React.Fragment>}
      {view.kind === 'error' && <button className="mly-text-action" type="button" onClick={() => owner.current?.controller.refresh()}>{t('uiRetry')}</button>}
    </div>}
  </details>;
});
