/** @jsx jsx */
import { React, jsx } from "jimu-core";
import * as styles from "../styles/fullscreenViewer";
import { FullscreenControls } from "./FullscreenControls";
import * as Icons from "./Icons";
import type { LocaleValue } from "../i18n/WidgetLocale";
import { getMinimapContainerStyle } from "../utils/styles";
export interface FullscreenViewerProps {
  children: React.ReactNode;
  direction: "ltr" | "rtl";
  formatLocale: string;
  showMinimap: boolean;
  minimapExpanded?: boolean;
  hideInfoBox?: boolean;
  address: string | null;
  image?: {
    lat: number;
    lon: number;
  } | null;
  minimapRef: React.Ref<HTMLDivElement>;
  t: LocaleValue["t"];
  onExit(): void;
  onToggleMinimap(): void;
  onToggleExpanded(): void;
  onCopyCoordinates(lat: number, lon: number): void | Promise<void>;
}
/** Fullscreen chrome only; the runtime retains portal, viewer and ArcGIS lifecycle ownership. */
export function FullscreenViewer({
  children,
  direction,
  formatLocale,
  showMinimap,
  minimapExpanded,
  hideInfoBox,
  address,
  image,
  minimapRef,
  t,
  onExit,
  onToggleMinimap,
  onToggleExpanded,
  onCopyCoordinates,
}: FullscreenViewerProps) {
  return (
    <div
      dir={direction}
      lang={formatLocale}
      className={`mly-fullscreen-viewer${minimapExpanded ? " mly-minimap-expanded" : ""}`}
      style={styles.overlay}
    >
      <style>{styles.responsiveCss}</style>
      {children}
      <FullscreenControls
        showMinimap={showMinimap}
        onExit={onExit}
        onToggleMinimap={onToggleMinimap}
      />

      {!hideInfoBox && image && (
        <div className="mly-fullscreen-location">
          <div
            title={address || t("currentImage")}
            style={styles.locationTitle}
          >
            {address || t("currentImage")}
          </div>
          <button
            type="button"
            title={t("appCopyLatitudeAndLongitude")}
            aria-label={t("appCopyCurrentImageCoordinates")}
            onClick={() => void onCopyCoordinates(image.lat, image.lon)}
          >
            {image.lat.toFixed(6)}, {image.lon.toFixed(6)}
          </button>
        </div>
      )}
      {/* Minimap frame keeps React controls separate from ArcGIS-managed content. */}
      <div
        className="minimap-container"
        style={getMinimapContainerStyle(showMinimap)}
      >
        {minimapExpanded && (
          <div style={styles.minimapHeader}>
            <div
              title={address || t("currentImage")}
              style={styles.locationTitle}
            >
              {address || t("currentImage")}
            </div>
            {!hideInfoBox && image && (
              <button
                type="button"
                title={t("appCopyLatitudeAndLongitude")}
                onClick={() => void onCopyCoordinates(image.lat, image.lon)}
                style={styles.coordinatesButton}
              >
                {image.lat.toFixed(6)}, {image.lon.toFixed(6)}
              </button>
            )}
          </div>
        )}
        <div ref={minimapRef} style={styles.minimapViewport(minimapExpanded)} />
        <button
          type="button"
          aria-label={
            minimapExpanded ? t("appCollapseMinimap") : t("appExpandMinimap")
          }
          aria-expanded={!!minimapExpanded}
          title={
            minimapExpanded ? t("appCollapseMinimap") : t("appExpandMinimap")
          }
          onClick={onToggleExpanded}
          style={styles.expandButton}
        >
          {minimapExpanded ? (
            <Icons.Minimize size={14} />
          ) : (
            <Icons.Maximize size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
