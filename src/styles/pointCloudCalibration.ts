import type { React } from 'jimu-core';
/** Calibration presentation; the caller supplies the existing shared joystick button style. */
export function calibrationPanelStyle(showCalibrationPanel: boolean | undefined): React.CSSProperties {
    return {
        marginTop: "4px",
        background: showCalibrationPanel ? "rgba(25, 25, 25, 0.85)" : "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(10px)",
        borderRadius: "6px",
        padding: "5px",
        width: "96px",
        border: showCalibrationPanel ? "1px solid rgba(255, 193, 7, 0.5)" : "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        boxSizing: "border-box",
    };
}
export const calibrationToggleStyle: React.CSSProperties = { gap: "4px", minHeight: 16,
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    cursor: "pointer",
    color: "white",
};
export function calibrationHeadingStyle(showCalibrationPanel: boolean | undefined): React.CSSProperties { return { display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", fontSize: "7px", fontWeight: 600, color: showCalibrationPanel ? "#ffc107" : "rgba(255,255,255,0.7)" }; }
export const calibrationIconStyle: React.CSSProperties = { flexShrink: 0, marginRight: 0, verticalAlign: "middle" };
export const calibrationDisclosureStyle: React.CSSProperties = { fontSize: "8px", color: "rgba(255,255,255,0.5)" };
export const calibrationBodyStyle: React.CSSProperties = { marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" };
export const calibrationStepsStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: "7px", background: "rgba(0,0,0,0.3)", padding: "3px", borderRadius: "3px" };
export function calibrationFineStepStyle(nudgeStep: number | undefined): React.CSSProperties { return { cursor: "pointer", color: nudgeStep === 0.1 ? "#37d582" : "white" }; }
export const calibrationHiddenRadioStyle: React.CSSProperties = { display: "none" };
export function calibrationCoarseStepStyle(nudgeStep: number | undefined): React.CSSProperties { return { cursor: "pointer", color: nudgeStep === 1.0 ? "#37d582" : "white" }; }
export const calibrationPadStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", justifyItems: "center", marginTop: "2px" };
export function calibrationResetStyle(miniJoyStyle: React.CSSProperties): React.CSSProperties { return { ...miniJoyStyle, fontSize: "6px", background: "rgba(255,0,0,0.3)", borderColor: "rgba(255,0,0,0.5)", fontWeight: "bold" }; }
export const calibrationVerticalRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4px", marginTop: "2px" };
export function calibrationVerticalButtonStyle(miniJoyStyle: React.CSSProperties): React.CSSProperties { return { ...miniJoyStyle, width: "32px", fontSize: "7.5px" }; }
