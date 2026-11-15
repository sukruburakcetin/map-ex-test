/** Calendar presentation. Date logic, handlers and measured portal placement remain component-owned. */
import type { React } from 'jimu-core';

export const ACCENT = "#37d582";

export const NAV_BTN: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 5px",
    lineHeight: 1,
    borderRadius: "3px",
};

export const dateWrapperStyle: React.CSSProperties = { position: "relative", display: "inline-block" };

export function getDateTriggerStyle(open: boolean, selected: Date | null, disabled: boolean): React.CSSProperties { return {
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 7px",
                        background: open ? "rgba(55,213,130,0.15)" : "rgba(255,255,255,0.08)",
                        border: `1px solid ${open ? ACCENT : "rgba(255,255,255,0.18)"}`,
                        borderRadius: "5px",
                        color: selected ? "#fff" : "rgba(255,255,255,0.5)",
                        fontSize: "9px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.5 : 1,
                        pointerEvents: disabled ? "none" as const : "auto" as const,
                        whiteSpace: "nowrap" as const,
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                        boxShadow: open ? `0 0 8px ${ACCENT}44` : "none",
                        transition: "all 0.15s",
                        userSelect: "none" as const,
                        WebkitUserSelect: "none" as const,
                    }; }

export const dateIconStyle: React.CSSProperties = { fontSize: "10px", lineHeight: 1 };

export const dateLabelStyle: React.CSSProperties = { fontSize: "8px", lineHeight: 1 };

export const dateClearStyle: React.CSSProperties = {
                                marginLeft: "1px",
                                color: "rgba(255,255,255,0.45)",
                                fontSize: "10px",
                                lineHeight: 1,
                                cursor: "pointer",
                            };

export const dateCalendarStyle: React.CSSProperties = {
                            position: "absolute",
                            bottom: "calc(100% + 6px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 10002,
                            width: "168px",
                            background: "rgba(10,10,10,0.97)",
                            backdropFilter: "blur(18px)",
                            WebkitBackdropFilter: "blur(18px)",
                            border: `1px solid ${ACCENT}55`,
                            borderRadius: "10px",
                            padding: "8px 8px 6px",
                            boxShadow: `0 -8px 32px rgba(0,0,0,0.7), 0 0 20px ${ACCENT}22`,
                            userSelect: "none" as const,
                            WebkitUserSelect: "none" as const,
                            
                        };

export const dateYearNavigationStyle: React.CSSProperties = {
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: "5px"
                        };

export const dateYearLabelStyle: React.CSSProperties = { color: "#fff", fontSize: "11px", fontWeight: 700 };

export const dateMonthNavigationStyle: React.CSSProperties = {
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: "8px"
                        };

export const dateMonthLabelStyle: React.CSSProperties = { color: ACCENT, fontSize: "10px", fontWeight: 600, letterSpacing: "0.4px" };

export const dateWeekHeaderGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "3px" };

export const dateWeekHeaderStyle: React.CSSProperties = {
                                    fontSize: "8px",
                                    color: "rgba(255,255,255,0.3)",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    padding: "1px 0",
                                };

export const dateDayGridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" };

export function getDateDayStyle(bg: string, isSelected: boolean, isToday: boolean): React.CSSProperties { return {
                                            textAlign: "center",
                                            padding: "4px 2px",
                                            fontSize: "9px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            background: bg,
                                            color: isSelected
                                                ? "#000"
                                                : isToday
                                                ? ACCENT
                                                : "rgba(255,255,255,0.88)",
                                            fontWeight: isSelected || isToday ? 700 : 400,
                                            border: isToday && !isSelected
                                                ? `1px solid ${ACCENT}55`
                                                : "1px solid transparent",
                                            transition: "background 0.08s",
                                            lineHeight: 1.2,
                                        }; }

export const dateTodaySectionStyle: React.CSSProperties = {
                            marginTop: "7px",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            paddingTop: "5px"
                        };

export const dateTodayButtonStyle: React.CSSProperties = {
                                    width: "100%",
                                    background: "rgba(55,213,130,0.12)",
                                    border: `1px solid ${ACCENT}44`,
                                    borderRadius: "5px",
                                    color: ACCENT,
                                    fontSize: "9px",
                                    cursor: "pointer",
                                    padding: "3px 0",
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                };
