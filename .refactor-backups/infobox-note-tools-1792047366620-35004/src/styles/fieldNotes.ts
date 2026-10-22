/** Field-note editor presentation and shared note-action styling; editing/publishing remains parent-owned. */
import type { React } from 'jimu-core';

export const noteActionStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minHeight: 26, padding: "3px 8px", borderRadius: 5,
    border: "1px solid rgba(155,210,181,0.25)", background: "rgba(40,80,58,0.28)",
    color: "#b9e5cd", fontSize: 10, lineHeight: "16px", cursor: "pointer", whiteSpace: "nowrap"
};

export const noteEditorInputStyle: React.CSSProperties = { padding: 7, borderRadius: 6, border: "1px solid #555", background: "#1a1a1a", color: "white", fontSize: 12, width: "100%", boxSizing: "border-box" };

export const noteEditorDialogStyle: React.CSSProperties = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 999999996, background: "#151515", color: "white", padding: 14, borderRadius: 12, width: "min(320px, 85%)", maxHeight: "85%", overflowY: "auto", boxShadow: "0 8px 24px #0009" };

export const noteEditorTitleStyle: React.CSSProperties = { fontSize: 12 };

export const noteEditorScopeStyle: React.CSSProperties = { fontSize: 10, color: "#9ed9df", margin: "6px 0" };

export const noteEditorFieldsetStyle: React.CSSProperties = { border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 };

export const noteEditorLabelStyle: React.CSSProperties = { fontSize: 11 };

export const noteErrorStyle: React.CSSProperties = { color: "#ffb8a6", fontSize: 11 };

export const noteEditorActionsStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", gap: 8 };

export function getNoteEditorCancelStyle(saving: boolean | undefined): React.CSSProperties { return { ...noteActionStyle, minHeight: 32, padding: "5px 12px", color: "#d2dad5", background: "rgba(255,255,255,0.05)", opacity: saving ? 0.5 : 1 }; }

export function getNoteEditorSaveStyle(saving: boolean | undefined): React.CSSProperties { return { ...noteActionStyle, minHeight: 32, padding: "5px 12px", background: "#167348", borderColor: "#368b61", color: "white", fontWeight: 600, opacity: saving ? 0.5 : 1 }; }

/** Attachment dialog styles share the field-notes presentation family. */
export const noteAttachmentDialogStyle: React.CSSProperties = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 999999997, background: "#151515", color: "white", padding: 14, border: "1px solid rgba(155,210,181,0.25)", boxSizing: "border-box", borderRadius: 12, width: "min(360px, 90%)", maxHeight: "80%", overflowY: "auto", boxShadow: "0 8px 24px #0009", fontSize: 12 };

export const noteAttachmentHelpStyle: React.CSSProperties = { fontSize: 10, color: "#a8cfc0" };

export const noteAttachmentFieldsetStyle: React.CSSProperties = { border: 0, padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 };

export const noteAttachmentInputStyle: React.CSSProperties = { display: "none" };

export const noteAttachmentListStyle: React.CSSProperties = { margin: "10px 0", maxHeight: 160, overflowY: "auto" };

export const noteAttachmentRowStyle: React.CSSProperties = { margin: "4px 0", display: "flex", alignItems: "center", gap: 6, overflowWrap: "anywhere" };

export const noteAttachmentStatusStyle: React.CSSProperties = { color: "#a8e6b8" };

export const noteAttachmentFooterStyle: React.CSSProperties = { textAlign: "right", marginTop: 8 };

export const noteAttachmentButtonStyle: React.CSSProperties = { ...noteActionStyle, minHeight: 32, whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "left" };
export const noteAttachmentActionsStyle: React.CSSProperties = { display: "flex", gap: 6, flexWrap: "wrap" };

/** Local note-list toolbar, metadata and action styles; values preserve the existing presentation. */
export const noteMapMessageStyle: React.CSSProperties = { fontSize: 10, color: "#9ed9df" };
export const noteMapRefreshStyle: React.CSSProperties = { color: "inherit", background: "transparent", border: 0, cursor: "pointer" };
export const noteListToolbarStyle: React.CSSProperties = { 
                        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, 
                        fontSize: "9px", color: "rgba(255,255,255,0.45)", flexShrink: 0 
                    };
export const noteListToolbarActionsStyle: React.CSSProperties = { display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" };
export const noteListImportStyle: React.CSSProperties = { fontSize: "10px", padding: "3px 8px", borderRadius: "5px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer" };
export const noteListFileInputStyle: React.CSSProperties = { display: "none" };
export const noteListExportStyle: React.CSSProperties = { fontSize: "10px", padding: "3px 8px", borderRadius: "5px", border: "none", background: "#05a056", color: "#fff", cursor: "pointer" };
export const noteListCloseStyle: React.CSSProperties = { background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "11px", padding: "0 2px", lineHeight: 1 };
export const noteListEmptyStyle: React.CSSProperties = { fontSize: "10px", color: "rgba(255,255,255,0.4)", padding: "10px 0", textAlign: "center" };
export const noteListCategoryStyle: React.CSSProperties = { fontSize: "11px", fontWeight: 600, color: "#fff" };
export const noteListDeleteStyle: React.CSSProperties = { fontSize: "11px", color: "rgba(255,255,255,0.4)" };
export const noteListShareStyle: React.CSSProperties = { marginLeft: 6, background: "transparent", border: "1px solid #436052", borderRadius: 4, color: "#b5edcf", cursor: "pointer" };
/** Fixed status column shared by Local and Enterprise records; labels never shift action buttons. */
export const noteListStatusStyle: React.CSSProperties = { width: 76, minWidth: 76, minHeight: 26, boxSizing: "border-box",
  display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "3px 4px",
  fontSize: 10, lineHeight: "16px", borderRadius: 5, border: "1px solid", whiteSpace: "nowrap" };

// Match the Enterprise layer's workflow legend; cache styles so rows reuse the same objects.
const noteStatusColors = { open: "#35b7c4", in_progress: "#f5a623", completed: "#05a056", dismissed: "#888888" };
const noteStatusBadges = Object.fromEntries(Object.entries(noteStatusColors).map(([status, color]) =>
  [status, { ...noteListStatusStyle, color, borderColor: color, background: `${color}18` }])) as Record<string, React.CSSProperties>;

/** Return a non-interactive workflow badge; missing/unknown status uses the existing Open default. */
export function getNoteStatusBadgeStyle(status?: string): React.CSSProperties {
  return Object.prototype.hasOwnProperty.call(noteStatusBadges, status || "open") ? noteStatusBadges[status || "open"] : noteStatusBadges.open;
}
export const noteListActionStyle: React.CSSProperties = { ...noteActionStyle, width: 104, minWidth: 104, maxWidth: 104, boxSizing: "border-box", flex: "0 0 104px" };
export const noteListResolutionStyle: React.CSSProperties = { fontSize: 10, color: "#a7c8b8" };
export const noteListErrorStyle: React.CSSProperties = { fontSize: 10, color: "#ffb8a6", overflowWrap: "anywhere" };
export const noteListTextStyle: React.CSSProperties = { fontSize: "10px", color: "rgba(255,255,255,0.6)", marginTop: "2px" };

/** Controlled new-note draft form styles; values preserve the existing presentation. */
export const noteDraftDialogStyle: React.CSSProperties = {
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 999999995, background: "rgba(15,15,15,0.96)", color: "#fff",
                    padding: "14px", borderRadius: "12px", width: "min(280px, 80%)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: "8px"
                };
export const noteDraftTitleStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 600, opacity: 0.85 };
export const noteDraftSelectStyle: React.CSSProperties = { padding: "7px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "#1a1a1a", color: "#fff", fontSize: "12px" };
export const noteDraftTextStyle: React.CSSProperties = { padding: "7px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "#1a1a1a", color: "#fff", fontSize: "12px", resize: "none" };
export const noteDraftShareStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 11 };
export const noteDraftActionsStyle: React.CSSProperties = { display: "flex", gap: "8px", justifyContent: "flex-end" };
export const noteDraftCancelStyle: React.CSSProperties = { padding: "6px 12px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "11px", cursor: "pointer" };
export const noteDraftSaveStyle: React.CSSProperties = { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#05a056", color: "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer" };
