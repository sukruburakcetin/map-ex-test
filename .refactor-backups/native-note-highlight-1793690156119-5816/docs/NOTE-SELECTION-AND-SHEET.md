# Note selection and expandable sheet

`FieldNoteMap.focusNote` owns one transient selection graphic. Show on map selects it and keeps the existing camera/image navigation. SDK hits on Local/selected workspace markers select it without moving the camera; Enterprise hits keep their existing popup actions and highlight their point. The larger diamond uses a cyan outline. Selecting another note replaces the highlight; cleanup invalidates pending SDK work. This never publishes or saves a local copy.

`mapGraphic.ts` owns selected/normal symbol descriptors. `FieldNotesPanel.tsx` owns the in-memory expanded state. Its native button grip supports touch, mouse, Enter and Space and exposes aria-expanded. Expanded height is 92% of the widget's available height; the default stays capped at 300px/65%. Lists continue to scroll inside the sheet. This is a click/tap toggle, not a draggable resize control.

The coverage click fast path requests an SDK hit test when note markers are available so note clicks retain priority over imagery. Without note targets, existing coverage picking remains unchanged.

Apply after the collaboration workspace, preload and workspace marker updates. Rebuild and reload the widget. Test a shared workspace with an empty Local list, select notes through Show on map and marker clicks, and expand/collapse at mobile/controller widths. Check 2D and 3D ground placement in Experience Builder; recording SDK tests do not replace this live check.
