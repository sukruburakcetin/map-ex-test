/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { ImageInformationController, type ImageInformationHost, type InformationViewer, type ImageInformationView } from './ImageInformation';
interface Props { host?: ImageInformationHost; viewer?: InformationViewer | null; active: boolean; }
/** Stable props + memo prevent image/playback state renders from reaching this closed disclosure. */
export const ImageInformationSection = React.memo(function ImageInformationSection({ host, viewer, active }: Props) {
  const { t, formatLocale } = useWidgetLocale();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<ImageInformationView>({ kind: 'empty' });
  const details = React.useRef<HTMLDetailsElement>(null);
  const owner = React.useRef<{ host: ImageInformationHost; controller: ImageInformationController } | null>(null);
  React.useEffect(() => {
    if (!open || !active || !host || !viewer) return;
    if (owner.current?.host !== host) { owner.current?.controller.dispose(); owner.current = { host, controller: new ImageInformationController(host) }; }
    const controller = owner.current!.controller;
    controller.start(viewer, setView, details.current?.ownerDocument);
    return () => controller.stop();
  }, [host, viewer, open, active]);
  React.useEffect(() => () => owner.current?.controller.dispose(), []);
  if (!host) return null;
  const data = view.data, unavailable = t('imageInfoUnavailable');
  const value = (v: string | null | undefined) => v || unavailable;
  const format = new Intl.NumberFormat(formatLocale, { maximumFractionDigits: 1 });
  const projection = data?.projection?.toLowerCase();
  const projectionLabel = projection === 'perspective' ? t('imageInfoPerspective') : projection === 'fisheye' ? t('imageInfoFisheye') : projection === 'spherical' || projection === 'equirectangular' ? t('imageInfoPanorama') : unavailable;
  const captured = data?.capturedAt != null ? new Intl.DateTimeFormat(formatLocale, { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'UTC' }).format(new Date(data.capturedAt)) : unavailable;
  const dimensions = data?.width && data.height ? `${format.format(data.width)} × ${format.format(data.height)} · ${format.format(data.width * data.height / 1000000)} MP` : unavailable;
  const row = (label: string, content: string, dimensionHelp = false) => <div className="mly-image-information-row" key={label} title={dimensionHelp ? t('imageInfoOriginalNote') : undefined}>
    <dt>{label}</dt>
    <dd><bdi>{content}</bdi></dd>
  </div>;
  return <details ref={details} className="mly-image-information" open={open}  onToggle={event => { const next = event.currentTarget.open; if (next !== open) { setView({ kind: 'loading' }); setOpen(next); } }}>
    <summary>{t('imageInfoTitle')}</summary>
    {open && active && <div className="mly-image-information-content">
      {view.kind !== 'ready' && <div role="status">{t(view.kind === 'deferred' ? 'imageInfoDeferred' : view.kind === 'error' ? 'imageInfoError' : view.kind === 'empty' ? 'imageInfoNoImage' : 'imageInfoLoading')}</div>}
      {data && <React.Fragment>
        <dl>
          {row(t('imageInfoCaptured'), captured)}
          {row(t('imageInfoContributor'), value(data.contributor))}
          {row(t('imageInfoOrganization'), value(data.organization))}
          {row(t('imageInfoCamera'), [data.make, data.model].filter(Boolean).join(' · ') || unavailable)}
          {row(t('imageInfoProjection'), projectionLabel)}
          {row(t('imageInfoDimensions'), dimensions, true)}
          {row(t('imageInfoCaptureMethod'), data.onFoot === true ? t('imageInfoFoot') : data.onFoot === false ? t('imageInfoOther') : t('imageInfoUnknownMethod'))}
        </dl>
        <div className="mly-image-information-id"><bdi>ID: {data.id}</bdi></div>
      </React.Fragment>}
      {view.kind === 'error' && <button className="mly-text-action" type="button" style={{ marginTop: 5 }} onClick={() => owner.current?.controller.refresh()}>{t('uiRetry')}</button>}
    </div>}
  </details>;
});
