# Appearance and navigation controls

In Builder, open **Appearance Settings**. Options are grouped as **Image details**, **Map navigation**, and **Exploration and export**. Existing switches still mean **Hide**: on hides that control; off permits it to appear when available.

- **Show all** clears the Appearance hide switches.
- **Hide all** sets the Appearance hide switches, including the map-follow button.
- These actions preserve service URLs, language settings, enabled capabilities, map synchronization, and current viewer state. They do not enable features or stop running tools.

The **Hide Keep image in view / Lock to image button** setting controls the existing viewer navigation button. That button is available when **Source → Lock Map To View → Enable Sync** is enabled. Hiding it does not change the current following mode or turn off synchronization.

The Image tools header and its empty Tools & details disclosure disappear when no content is available. Genuine remaining controls, active coverage results, point-cloud information, and route-point cleanup remain reachable. Hide all applies to Appearance options; it does not turn off separately enabled solar/elevation/detection tools or the separate language switcher policy.

Existing experiences keep the map-follow button visible unless its new hide switch is enabled. No configuration migration is required.

## Builder section order

The panel follows setup tasks: **Map connection → Language → Appearance → Coverage defaults → Places → Field Notes → Detections → Routing → Advanced**. The Places and Detections headings retain their existing translated names. General Settings is now named Coverage defaults.

Under **Coverage defaults**, use **Default travel mode** to open coverage with all travel modes, on-foot captures, or other classified travel. Visitors can change the selection in the coverage filter panel.

Map connection is open initially. Other sections start collapsed. Click a heading, or focus its button and press Enter/Space, to open or close it. Collapsing preserves the mounted controls and unsaved field state; it does not write configuration. Open-section state is kept only for the current Builder component session.

Places has its enable switch in the section header. Enabling it opens its service controls; disabling hides those controls without clearing URLs. Turning it off also cancels its pending connection test and clears a temporary area highlight. Collapsing Places clears that highlight too, while preserving the saved area profile.

Field Notes has an **Enterprise notes layer** switch in its header. It controls Enterprise service fields only. Local categories remain configurable when Enterprise is disabled. Detections retains its separate traffic-sign and object switches, rather than adding a combined master switch. Routing and Advanced retain their individual configuration options.

After configuring, preview both 2D and 3D, compact/mobile and fullscreen. Try Show all and Hide all, then individual switches. Verify existing image selection, playback and map-follow modes still work; visibility switches should not change those modes.

## Road source for Analyze Coverage

Under **Coverage defaults → Road data source → Coverage road service URL**, enter an HTTPS ArcGIS polyline layer URL ending in `/FeatureServer/0` (use the actual layer number), or an Overpass interpreter URL. A blank value uses public Overpass.

The ArcGIS layer must allow anonymous queries from the published experience and contain the streets you want to classify. The widget queries features intersecting the analysis extent. It reads OSM-style `highway` and `oneway` fields when available. When `highway` is absent, the classifier uses its residential threshold. Test the layer with a known covered street and an uncaptured street before publishing.
