/** @jsx jsx */
import { React, jsx } from "jimu-core";
import * as styles from "../styles/viewerSurface";
import { ImageryLoading } from "./ImageryLoading";
import * as Icons from "./Icons";
import type { LocaleValue } from "../i18n/WidgetLocale";
import { glassStyles } from "../utils/styles";
export interface ViewerSurfaceProps {
  children: React.ReactNode;
  viewerRef: React.Ref<HTMLDivElement>;
  measurementRef: React.Ref<HTMLDivElement>;
  t: LocaleValue["t"];
  imageId: string | null;
  isLoading: boolean;
  turboLoading?: boolean;
  featuresLoading?: boolean;
  noImageMessageVisible: boolean;
  loading: React.ComponentProps<typeof ImageryLoading>;
  lasso: {
    active: boolean;
    polygon: readonly [number, number][];
    onStart: React.PointerEventHandler<SVGSVGElement>;
    onMove: React.PointerEventHandler<SVGSVGElement>;
    onEnd: React.PointerEventHandler<SVGSVGElement>;
    onCancel: React.PointerEventHandler<SVGSVGElement>;
  };
}
/** Keep React overlays outside the SDK-owned viewer node; refs and interaction owners remain external. */
export function ViewerSurface({
  children,
  viewerRef,
  measurementRef,
  t,
  imageId,
  isLoading,
  turboLoading,
  featuresLoading,
  noImageMessageVisible,
  loading,
  lasso,
}: ViewerSurfaceProps) {
  return (
    <div style={styles.container}>
      {/* This empty div is controlled by Mapillary, React will never touch its internals */}
      <div dir="ltr" ref={viewerRef} style={styles.viewer} />
      {lasso.active && (
        <svg
          style={styles.lasso}
          onPointerDown={lasso.onStart}
          onPointerMove={lasso.onMove}
          onPointerUp={lasso.onEnd}
          onPointerLeave={lasso.onEnd}
          onPointerCancel={lasso.onCancel}
        >
          {lasso.polygon.length > 0 && (
            <polygon
              points={lasso.polygon.map((p) => `${p[0]},${p[1]}`).join(" ")}
              fill="rgba(0, 255, 255, 0.2)"
              stroke="cyan"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}
        </svg>
      )}
      <div ref={measurementRef} style={styles.measurement}></div>
      {featuresLoading && (
        <div style={glassStyles.featuresLoadingBadge}>
          <div style={glassStyles.featuresLoadingSpinner} />
          <span style={glassStyles.featuresLoadingText}>
            {" "}
            {t("appLoadingFeatures")}{" "}
          </span>
        </div>
      )}

      {/* Loading feedback preserves the previous image while the selection opens. */}
      <ImageryLoading {...loading} />
      {!imageId && !isLoading && !turboLoading && !noImageMessageVisible && (
        <div style={glassStyles.initialStateContainer}>
          <div
            className="initial-state-card"
            style={glassStyles.initialStateCard}
          >
            <span style={styles.initialHeading}>
              {t("appClickAPointToViewImagery")}{" "}
            </span>
            <span style={glassStyles.initialStateTextSecondary}>
              {" "}
              {t("appMapillaryImageryWillAppearHere")}{" "}
            </span>
          </div>
        </div>
      )}
      {noImageMessageVisible && (
        <div style={glassStyles.noImageContainer}>
          <div className="no-image-card" style={glassStyles.noImageContent}>
            <div style={styles.noImageIcon}>
              <Icons.NoImage size={32} />
            </div>

            <span> {t("appNoNearbyMapillaryImageryFound")} </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
