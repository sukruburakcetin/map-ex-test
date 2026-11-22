/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { OwnedMessage, type LocaleValue } from "../../i18n/WidgetLocale";
import { MAPILLARY_IMAGE } from "../../utils/mapillary-image-base64";
import { coverageNoticeStyles } from "../../utils/styles";
import * as guideStyles from "../../styles/coverageGuide";

type CoverageGuideAction = "show" | "data" | "tilt" | "zoom" | "retry";

export interface CoverageGuideStatus {
  text: string;
  action?: CoverageGuideAction;
  label?: string;
  busy?: boolean;
}

interface CoverageGuideProps {
  t: LocaleValue["t"];
  visible: boolean;
  status: CoverageGuideStatus;
  settings: string[];
  mouseHint: string;
  touchHint: string;
  helpOpen: boolean;
  helpId: string;
  helpButtonRef: React.Ref<HTMLButtonElement>;
  helpPanelRef: React.Ref<HTMLDivElement>;
  travelMethodFiltered: boolean;
  turboActive: boolean;
  noticesHidden: boolean;
  warningVisible: boolean;
  warningMessage?: string;
  selectionError?: string;
  canRetry?: boolean;
  onAction(action: CoverageGuideAction): void;
  onToggleHelp(): void;
  onCloseHelp(): void;
  onHideNotices(): void;
  onRetryImage(): void;
  onDismissImageError(): void;
}

/** Embedded coverage status, explorer help, and imagery-selection feedback. */
export function CoverageGuide({
  t, visible, status, settings, mouseHint, touchHint, helpOpen, helpId, helpButtonRef, helpPanelRef,
  travelMethodFiltered, turboActive, noticesHidden, warningVisible, warningMessage, selectionError, canRetry,
  onAction, onToggleHelp, onCloseHelp, onHideNotices, onRetryImage, onDismissImageError,
}: CoverageGuideProps) {
  const settingsSummary = settings.join(" · ");
  const action = status.action;
  return (
    <React.Fragment>
      {visible && (
        <div className="mly-coverage-notice" style={coverageNoticeStyles.container}>
          <img src={MAPILLARY_IMAGE} alt="" aria-hidden="true" style={coverageNoticeStyles.statusIcon} />
          <div role="status" aria-live="polite" aria-atomic="true" style={coverageNoticeStyles.status}>
            {status.busy && <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={guideStyles.busyIcon}>
              <circle cx="8" cy="8" r="6" fill="none" stroke="#436052" strokeWidth="2" />
              <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="#91d9b5" strokeWidth="2" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="0.9s" repeatCount="indefinite" />
              </path>
            </svg>}
            <span style={coverageNoticeStyles.title} title={status.text}>{status.text}</span>
          </div>
          {!!settings.length && <span className="mly-coverage-filter-hint" title={settingsSummary} style={guideStyles.filterHint}>{settingsSummary}</span>}
          <span className="mly-coverage-context-hint" style={coverageNoticeStyles.secondary}>
            <span className="mly-coverage-mouse-hint">{mouseHint}</span>
            <span className="mly-coverage-touch-hint">{touchHint}</span>
          </span>
          {action && (
            <button className="mly-text-action" type="button" onClick={() => onAction(action)} style={coverageNoticeStyles.action}>
              {status.label}
            </button>
          )}
          <button ref={helpButtonRef} className="mly-coverage-help-button" type="button" aria-controls={helpId} aria-expanded={helpOpen} onClick={onToggleHelp} aria-label={t('appExplorerGuideAndActiveFilters')} title={t('appExplorerGuideAndActiveFilters')} style={coverageNoticeStyles.helpButton}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" style={guideStyles.helpIcon}><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="4.75" r="0.75" fill="currentColor" /><path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></button>
        </div>
      )}
      {selectionError && (
        <div role="alert" style={guideStyles.selectionAlert}>
          <div style={coverageNoticeStyles.message}>{<OwnedMessage source={String(selectionError ?? "")} />}</div>
          <div style={guideStyles.selectionActions}>
            {canRetry && <button className="mly-text-action" type="button" onClick={onRetryImage} style={coverageNoticeStyles.action}> {t('appRetryImage')} </button>}
            <button className="mly-text-action" type="button" aria-label={t('appDismissImageError')} onClick={onDismissImageError} style={coverageNoticeStyles.action}> {t('appDismiss')} </button>
          </div>
        </div>
      )}
      {visible && helpOpen && (
        <div id={helpId} className="mly-coverage-help" role="dialog" aria-label={t('appCoverageHelp')} aria-modal="false" tabIndex={-1} ref={helpPanelRef} onKeyDown={event => { if (event.key === "Escape") onCloseHelp(); }} style={coverageNoticeStyles.helpPanel}>
          <div style={guideStyles.helpHeader}>
            <div style={guideStyles.helpBrand}><img src={MAPILLARY_IMAGE} alt="" aria-hidden="true" style={coverageNoticeStyles.logo} /><div style={coverageNoticeStyles.brand}> {t('appMapillaryExplorerGuide')} </div></div>
            <button type="button" aria-label={t('appCloseCoverageHelp')} onClick={onCloseHelp} style={coverageNoticeStyles.close}>×</button>
          </div>
          <div style={guideStyles.helpStatus}><strong>{status.text}</strong></div>
          <div style={coverageNoticeStyles.message}>{travelMethodFiltered ? t('appTravelMethodCoverageStartsAtRegionalZoomZoomCloser') : t('appAtTheFarthestZoomsHoverAnOverviewDotTo')} {t('appAtRegionalZoomsClickACoverageLineToOpen')} </div>
          <div aria-label={t('appSelectedSequenceSymbols')} style={guideStyles.helpSection}>
            <div style={guideStyles.lineLegendRow}><span aria-hidden="true" style={guideStyles.lineSwatch} /><span> {t('appBlueLineSelectedSequence')} </span></div>
            <div style={guideStyles.pointLegendRow}><span aria-hidden="true" style={turboActive ? guideStyles.turboPointSwatch : guideStyles.pointSwatch} /><span>{turboActive ? t('appBlueCirclesSelectedSequence') : t('appBlueDotsNearbyFrames2')}</span></div>
            <p style={guideStyles.legendDescription}>{turboActive ? t('appBlueCirclesBelongToTheActiveSequenceItsFaint') : t('appMoreImageryMayContinueBeyondTheDotsSelectCoverage')}</p>
          </div>
          {!!settings.length && <div style={guideStyles.helpSection}><strong> {t('appActiveSettings')} </strong><ul style={guideStyles.settingsList}>{settings.map(item => <li key={item}>{item}</li>)}</ul></div>}
          {warningVisible && <p style={coverageNoticeStyles.message}>{<OwnedMessage source={String(warningMessage ?? "")} />}</p>}
          <label style={coverageNoticeStyles.optOut}>
            <input type="checkbox" checked={noticesHidden} onChange={event => { if (event.currentTarget.checked) onHideNotices(); }} style={guideStyles.optOutCheckbox} />
            <span> {t('appHideTheGuideBarUntilThePageIsRefreshed')} </span>
          </label>
        </div>
      )}
    </React.Fragment>
  );
}
