/** Control-panel static styles. Keep CSS text and style-tag injection order unchanged. */
export const controlBarInteractionCss = `.glass-control-panel button[class], .glass-control-panel button[class]:hover, .glass-control-panel.glass-control-panel .unified-control-buttons-filters, .glass-control-panel.glass-control-panel .unified-control-buttons-filters.is-hoverable:hover, .glass-image-utility-panel .utility-button, .glass-image-utility-panel .utility-button:hover { transform: none !important; transition: background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease !important; } .glass-control-panel button svg, .glass-image-utility-panel .utility-button svg { transform: none !important; transition: none !important; }`;

export const controlBarCompactCss = `
              /* Keep short viewers scrollable instead of squashing individual controls. */
              .glass-control-panel > *, .glass-control-panel button[class] { flex-shrink: 0; }

              @container (max-width: 480px) {
                .glass-control-panel { gap: 2px !important; padding: 2px !important; border-radius: 9px !important; }
                .glass-control-panel > div { gap: 2px !important; }
                .glass-control-panel button[class] { width: 26px !important; height: 26px !important; margin-bottom: 0 !important; }
                .glass-control-panel svg { width: 15px !important; height: 15px !important; }
                .glass-control-panel button.unified-control-buttons-filters { width: 20px !important; height: 20px !important; }
                .glass-control-panel button.unified-control-buttons-filters svg { width: 12px !important; height: 12px !important; }
              }
            `;

export const imageUtilityInteractionCss = `.glass-control-panel button[class], .glass-control-panel button[class]:hover, .glass-image-utility-panel .utility-button, .glass-image-utility-panel .utility-button:hover { transform: none !important; transition: background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease !important; } .glass-control-panel button svg, .glass-image-utility-panel .utility-button svg { transform: none !important; transition: none !important; }`;

export const pointCloudModeCss = `.mapillary-point-cloud-mode > summary { display: flex !important; visibility: visible !important; opacity: 1 !important; } .mapillary-point-cloud-mode > summary::-webkit-details-marker { display: none; }`;

export const imageUtilityPanelStyle = {
            position: "absolute",
            bottom: "22px",
            right: "55px",
            zIndex: 10000,
            gap: "3px",
            padding: "1px 3px 1px 2px",
            background: "rgba(20, 20, 20, 0.4)",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.30)",
        } as const;
