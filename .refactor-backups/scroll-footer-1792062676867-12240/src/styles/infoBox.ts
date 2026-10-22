import type { React } from 'jimu-core';
/** InfoBox status presentation. Keep layout values aligned with the existing compact status card. */
export const infoStatusHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3px",
    opacity: 0.8,
    fontSize: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "4px",
};
export const infoStatusTitleStyle: React.CSSProperties = { fontWeight: 600, fontSize: "8px" };
export const infoStatusSearchStyle: React.CSSProperties = { marginRight: "2px", marginLeft: "2px" };
export const infoStatusZoomStyle: React.CSSProperties = { fontSize: "8px" };
export const infoStatusAddressStyle: React.CSSProperties = { marginBottom: "3px", color: "#37d582", fontWeight: 500 };
export const infoStatusGlobeStyle: React.CSSProperties = { marginRight: "4px" };
export const infoStatusCoordinatesStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "2px", width: "100%", opacity: 0.9, padding: "2px 0", background: "transparent", border: "none", borderRadius: 3, color: "inherit", font: "inherit", textAlign: "left", cursor: "copy", userSelect: "text" };
export const infoStatusCoordinateRowStyle: React.CSSProperties = { display: "flex", alignItems: "center" };
export const infoStatusCoordinateLabelStyle: React.CSSProperties = { width: "25px", fontSize: "9px", color: "#aaa" };
export const infoStatusCreatorStyle: React.CSSProperties = {
    marginTop: "4px",
    padding: "1px 3px",
    background: "rgba(55, 213, 130, 0.2)",
    border: "1px solid rgba(55, 213, 130, 0.4)",
    borderRadius: "3px",
    fontSize: "9px",
    color: "#37d582",
    textAlign: "center",
};
