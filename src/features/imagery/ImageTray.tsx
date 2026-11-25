/** @jsx jsx */
import { React, jsx } from "jimu-core";
import * as styles from "../../styles/imageTray";
import { OwnedMessage, type LocaleValue } from "../../i18n/WidgetLocale";
import type { NearbyImage, AssociatedImage } from "../../components/types";
/** Only the image-tray fields; SDK, request and selection ownership stay in the widget. */
export interface ImageTrayState {
  imageTrayTab?: "nearby" | "object";
  selectedFeatureMetadata?: {
    id: string;
  };
  nearbyCanExpand?: boolean;
  nearbyLoading?: boolean;
  nearbyImages?: NearbyImage[];
  alternateImages: AssociatedImage[];
  alternateImagesError?: string;
  isFetchingAlternates: boolean;
  imageId: string | null;
}
export interface ImageTrayProps {
  state: Readonly<ImageTrayState>;
  selectedNearbyId?: string | null;
  formatLocale?: string;
  t: LocaleValue["t"];
  owned: LocaleValue["owned"];
  onChangeTab(tab: "nearby" | "object"): void;
  onSearchMore(): void;
  onClose(): void;
  onNearbyPointerEnter: React.PointerEventHandler<HTMLDivElement>;
  onNearbyPointerLeave(): void;
  onSelectNearby(image: NearbyImage): void | Promise<void>;
  onHighlightNearby(image: NearbyImage | null): void;
  onSelectAssociated(image: AssociatedImage): void | Promise<void>;
  onRetryAssociated(): void;
}
/** Present nearby/associated captures; keep both rows mounted to retain their scroll positions. */
export function ImageTray({
  state,
  selectedNearbyId,
  formatLocale,
  t,
  owned,
  onChangeTab,
  onSearchMore,
  onClose,
  onNearbyPointerEnter,
  onNearbyPointerLeave,
  onSelectNearby,
  onHighlightNearby,
  onSelectAssociated,
  onRetryAssociated,
}: ImageTrayProps) {
  return (
    <div className="mapillary-image-tray" style={styles.container}>
      <style>{styles.responsiveCss}</style>
      <div style={styles.header}>
        <div
          role="tablist"
          aria-label={t("appImageSources")}
          style={styles.tabs}
        >
          {(["nearby", "object"] as const)
            .filter(
              (tab) => tab === "nearby" || !!state.selectedFeatureMetadata,
            )
            .map((tab) => (
              <button
                className="mly-text-action"
                key={tab}
                role="tab"
                aria-selected={(state.imageTrayTab || "nearby") === tab}
                onClick={() => onChangeTab(tab)}
                style={styles.tab((state.imageTrayTab || "nearby") === tab)}
              >
                {tab === "nearby" ? (
                  <OwnedMessage
                    source={"Nearby ({value0})"}
                    values={{
                      value0: String((state.nearbyImages || []).length),
                    }}
                  />
                ) : (
                  <OwnedMessage
                    source={"Selected object ({value0})"}
                    values={{ value0: String(state.alternateImages.length) }}
                  />
                )}
              </button>
            ))}
        </div>
        {state.imageTrayTab !== "object" && state.nearbyCanExpand && (
          <button
            className="mly-text-action"
            type="button"
            disabled={!!state.nearbyLoading}
            title={owned(
              "Search a larger sample and show the nearest 20 captures",
            )}
            onClick={onSearchMore}
            style={styles.searchMore}
          >
            {owned("Search more")}
          </button>
        )}
        <button onClick={onClose} style={styles.close}>
          ✕
        </button>
      </div>

      {/* Rows stay mounted while switching tabs, preserving independent scroll positions. */}
      <div
        role="tabpanel"
        aria-label={t("appNearbyImages")}
        aria-busy={!!state.nearbyLoading}
        onPointerEnter={onNearbyPointerEnter}
        onPointerLeave={onNearbyPointerLeave}
        style={styles.nearbyRow(state.imageTrayTab === "object")}
      >
        {state.nearbyLoading && !state.nearbyImages?.length && (
          <span role="status" style={styles.nearbyLoading}>
            {owned("Loading nearby captures…")}
          </span>
        )}
        {(state.nearbyImages ?? []).map((img) => {
          // Pending clicks highlight immediately without replacing the current image ID.
          const isCurrent = selectedNearbyId
            ? img.id === selectedNearbyId
            : img.id === state.imageId;
          const date = new Date(img.captured_at).toLocaleDateString(
            formatLocale,
            {
              year: "numeric",
              month: "short",
            },
          );
          return (
            <div
              key={img.id}
              className="mapillary-nearby-card"
              onClick={() => {
                void onSelectNearby(img);
              }}
              onMouseEnter={() => onHighlightNearby(img)}
              onMouseLeave={() => onHighlightNearby(null)}
              style={styles.nearbyCard(isCurrent)}
            >
              <img
                src={img.thumb_512_url ?? img.thumb_256_url}
                alt=""
                loading="lazy"
                style={styles.nearbyThumbnail}
              />
              <div style={styles.caption}>
                <div style={styles.creator}>{img.creator?.username ?? ""}</div>
                <div style={styles.captureDate}>{date}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        role="tabpanel"
        aria-label={t("appSelectedObjectImages")}
        style={styles.associatedRow(
          state.imageTrayTab === "object" && !!state.selectedFeatureMetadata,
        )}
      >
        {state.isFetchingAlternates && (
          <span style={styles.associatedStatus} role="status">
            {" "}
            {t("appLoadingAssociatedImages")}{" "}
          </span>
        )}
        {state.alternateImagesError && (
          <span style={styles.associatedStatus} role="alert">
            {<OwnedMessage source={String(state.alternateImagesError ?? "")} />}{" "}
            <button className="mly-text-action" onClick={onRetryAssociated}>
              {" "}
              {t("appRetry")}{" "}
            </button>
          </span>
        )}
        {!state.isFetchingAlternates &&
          !state.alternateImagesError &&
          !state.alternateImages.length && (
            <span>
              {" "}
              {t("appNoAssociatedImagesAvailableSelectASignOrObject")}{" "}
            </span>
          )}
        {state.alternateImages.map((img) => (
          <button
            className="mly-text-action mapillary-associated-card"
            key={img.id}
            onClick={() => void onSelectAssociated(img)}
            aria-label={owned("Open associated image {value0}", {
              value0: String(img.id),
            })}
            title={`${img.detectionLabel || "Detected object"} · ${Number.isFinite(img.capturedAt) ? new Date(img.capturedAt).toLocaleDateString(formatLocale) : t("appDateUnavailable")}`}
            style={styles.associatedCard(img.id === state.imageId)}
          >
            <span style={styles.associatedPreview}>
              <span className="mapillary-associated-image-frame" style={styles.associatedImageFrame}>
                <img
                  src={img.thumbUrl}
                  alt={t("appAssociatedCameraCapture")}
                  loading="lazy"
                  style={styles.associatedThumbnail}
                />
                {img.detectionBounds && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    style={styles.detectionOutline}
                  >
                    <rect
                      {...img.detectionBounds}
                      fill="none"
                      stroke="#111"
                      strokeWidth={4}
                      vectorEffect="non-scaling-stroke"
                    />
                    <rect
                      {...img.detectionBounds}
                      fill="none"
                      stroke="#ffe45e"
                      strokeWidth={2}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
              </span>
            </span>
            <span style={styles.associatedCaption}>
              {img.detectionBounds
                ? t("appOutlined")
                : t("appOutlineUnavailable")}{"  "}
              {t("appCaptured")}{" "}
              {Number.isFinite(img.capturedAt)
                ? new Date(img.capturedAt).toLocaleDateString(formatLocale)
                : t("appDateUnavailable")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
