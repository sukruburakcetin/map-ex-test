# Filter traffic signs and objects

1. Enable traffic signs or objects on the map and open that layer's filters.
2. Select its category button, initially **All signs** or **All points**.
3. Search by category name or raw Mapillary code. Search covers the entire bundled catalog, not only the current page. Direct category matches are ranked first: for example, `regulatory stop` brings Stop signs ahead of longer related categories such as bicycle-stop or no-parking-or-stopping. Hyphens, case and accents are normalized, and variants use natural order (G1, G2, … G10).
4. Check the categories you want. Use Previous/Next to browse; selections survive page and search changes. Where names repeat, the raw code appears below the name to distinguish variants.
5. Select **Apply** to update the map once. **Cancel**, Escape, or clicking outside discards unapplied changes.

**Select all** selects every category, including those outside the current search. **Clear** selects none; choose Apply to hide all categories while leaving the layer enabled. To restore all icons, use Select all → Apply.

Traffic signs and objects have independent selections. Each picker shows at most 40 options at once to keep its UI bounded; the count/paging refers to categories, not the number of features on the map. Size and opacity are available under the adjacent Display button and work independently of category selection.

Applied categories also control map picking and area exports. Export uses the selection captured when the export starts. Search, paging and checkbox changes do not fetch extra categories or recreate map layers; Apply may trigger the native layer's normal tile loading.

Image AI outlines and labels use the separate image-detection exploration controls. Map category filtering preserves that existing behavior because image and map classification codes can differ.

Selections are kept for the running widget session, including toggling a layer off and on. Reloading the experience restores the default All selection. No new Builder configuration or service is required.

On phones, category filters open as a bottom sheet. Search and action buttons stay visible while the category list scrolls. Tap Search to open the keyboard; the sheet resizes to the visible screen. Desktop filters remain anchored to the filter bar.

### Display and Reset

Open **Display** beside the category picker to change icon size or opacity. Opacity ranges from 20% to 100% so detections remain visible. These controls are independent for traffic signs and objects and apply immediately. Close the menu to return to exploration.

**Reset all** restores all categories, 100% icon size, 100% opacity, Selected only mode, and Show all icons for that detection type. Reset also turns category labels off. It does not change the other detection type. Appearance changes apply to the map icons; image overlays and exported records are unaffected. Settings last for the current widget session.

### Highlight matches

In **Display**, choose **Selected only** to hide categories outside your selection (the default), or **Highlight matches** to keep other categories dimmed at 20% of the chosen opacity. Both modes use the same applied category selection. Dimmed icons are context only: clicking and exports still use selected categories.

Select all displays every category normally. Clear → Apply hides every category in either mode. Traffic signs and objects keep separate display modes; Reset all restores Selected only for that type. These modes style map icons and do not change image AI overlays.

### Reduce overlapping icons

Open **Display → Icon overlap**. **Show all icons** keeps the existing appearance. **Reduce overlap** lets the map renderer hide colliding icons as you pan and zoom, making dense areas easier to read. Zoom closer to separate nearby icons. This does not merge detections into clusters or change their category selection or exports.

Traffic signs and objects have independent overlap settings. Icon size affects how many icons fit. The setting survives category changes and toggling the layer off and on in the current session. **Reset all** restores Show all icons for that detection type. It only affects map icons; image AI overlays are unchanged.

### Close-zoom category labels

Open **Display → Show labels at zoom 18+**. Labels are off by default. Once enabled, full category names appear from zoom 18 where they fit. Below zoom 18, the display menu shows a reminder to zoom in. A separate label style layer starts at zoom 18. Labels use a contrasting halo and avoid overlapping; labels do not add text to the icon style layer. Labels follow your selected categories, including in Highlight matches mode. They use the same full English names as detection tooltips, retaining the sign group and omitting sprite variant codes (for example, Information General-directions G1 becomes Information: General directions). Generic text-sign categories describe a text-bearing sign; they do not transcribe its inscription.

Signs and objects keep separate label settings. Reset all turns labels off for that type. Category selection, exports and image AI overlays do not change. Font glyphs load from the ArcGIS-hosted font service already used by the external Places style; the viewer's device must be able to reach that service. No label layer or label-specific font dependency is added until you enable labels. Turning labels off removes that layer; downloaded fonts may remain cached. No additional detection metadata request is needed. Actual map rendering cost depends on how many labels are visible.
