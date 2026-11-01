# Arabic v6.118

Requires v6.117. Adds Modern Standard Arabic (ar) to runtime and builder language choices. Names follow the current UI language, including Arabic and العربية. An explicit builder choice still overrides saved viewer preferences. App-language matching supports ar, ar-EG, ar-SA, ar-AE and other valid Arabic regional tags; explicit non-Arab scripts and malformed tags safely fall back to US English.

## Translation coverage and review status

The Arabic files explicitly cover all 1,070 runtime and 150 builder entries with matching placeholders and nonempty strings. The eager splash/heading subsets match those catalogs. The community table now has 1,233 rows (1,070 runtime, 150 settings, 13 language names) and an ar column.

Preparation used the public Google Translate endpoint as an offline scaffold for public English UI catalog text, with protected placeholders and brands. No user content, credentials or imagery was sent. The committed results were refined with terminology substitutions and contextual edits to core controls, startup copy, builder labels, routing, note counters, elevation profiles and point clouds. This is an assisted draft, not a native editorial certification. A native Arabic review of the full technical catalog and actual workflows remains needed; equal key counts do not prove fluent wording in every context.

Reviewed terminology includes الصورة (image), لقطة (capture), التغطية (coverage), سحابة النقاط (point cloud), منحنى الارتفاع (elevation profile), الملاحظات الميدانية (field notes) and معرّف المؤسسة (organization ID). Image-fit mode uses إظهار الصورة كاملة rather than the literal postbox translation of letterbox. Technical field/path names such as status, resolution_note, X, Y and tools/overture_places are preserved. Counters use label-first phrasing such as عدد الملاحظات المستوردة: {count}, avoiding an incorrect single generic numbered-noun form across Arabic's zero/one/two/few/many cases. This does not introduce a general six-form Arabic plural engine. Chinese and other existing catalog values are unchanged.

## Direction, dates and interactions

Runtime and fullscreen roots, builder settings, the language control, splash and portalled comparison/calendar UI receive explicit direction. Widget-owned place popups, note tables and imagery hover cards bind their direction to the owning presentation scope, including when the host map is outside the widget. Custom note text uses automatic direction, retaining its exact value. Numeric/URL inputs use LTR isolation where appropriate. Direction changes are local to the widget; no production document-wide dir change is made.

The Mapillary SDK viewport remains LTR. Comparison image clipping and its slider retain LTR physical coordinates and keyboard semantics. The filter strip retains LTR scrolling/scrollbar coordinates, with RTL text inside its Arabic groups. Existing left/right scrollbar geometry, map picking, hover identity, bearing calculations, cones and animation logic are not rewritten.

Testing revealed an existing bug where physical KeyboardEvent.key End was compared to translated end-label text. All three filter-strip key comparisons now use the literal End. A missing space between the owned Captured label and date was also corrected. The old Overture test loader was updated to resolve relative presentation imports so those regressions can run; these are display/test changes, not imagery-request changes.

Arabic formatting preserves a matching host region and explicitly uses Gregorian dates (for example ar-SA-u-ca-gregory). Without a matching host region, explicit Arabic uses ar-u-ca-gregory. This keeps the existing Gregorian date picker from mixing Saudi default Islamic calendar headings with Gregorian date values. Arabic regional numbers and week starts follow Intl; localized day/year digits and navigation glyphs agree with RTL calendar layout. Date values, ISO fields, stored identifiers, units and request data remain unchanged. Older browsers without Intl week metadata use a small region fallback, including Egyptian Saturday and Saudi Sunday starts.

## Downloads and validation

Full runtime and settings catalogs remain separate lazy chunks. Isolated optimized text estimates are 171,339 bytes / 25,068 gzip for runtime, and 31,642 bytes / 5,831 gzip for builder. Scoped bidi CSS is 827 bytes / 274 gzip. These are text estimates, not production app transfer measurements. No new runtime libraries, font files or font downloads are introduced. The translation service is not called by the widget or contributor import tool.

Validation includes catalog key/placeholder/source integrity; startup parity; Arabic script/region matching; thirteen explicit builder languages against saved preferences; Gregorian Saudi/Egyptian regional dates; regional week starts; Arabic-Indic parameter matching; literal user content; community-table parity/import protection; direction/hover and map/place interaction regressions. Focused localization/hover tests and the map/place regression suites pass, as do the Experience Builder development build and Chromium component fixtures.

Browser fixtures cover held Arabic download and immediate translated splash; RTL language controls, settings and owned popup direction; a portalled RTL comparison with an LTR slider whose End key still reveals 100%; thirteen-language comparison switches retaining the slider and avoiding extra fixture imagery loads; unchanged custom category and image ID text; LTR URL and ID isolation; Arabic Gregorian calendar headers; positive physical filter scrolling via End; switching back to LTR; compact place buttons and splash at 320 px; and no font-file requests. Arabic startup, narrow splash, narrow editor/places and builder screenshots were visually inspected using system fonts.

The fixtures use real components with mocked Experience Builder wrappers, not a full deployed RTL application. Calendar clicks are dispatched directly because fixture panels overlap; they do not certify production pointer layout. Host SDK controls, third-party content, every system font and every advanced panel still require deployed/native review. External host controls, arbitrary user notes and proper names are outside the catalog.

Install from widget root: node apply-arabic-language-v6-118.cjs. Undo: node apply-arabic-language-v6-118.cjs --uninstall. Guarded dry-run/install/reinstall, byte-exact rollback and conflict-before-writes are checked. Preserve later community edits before attempting rollback.
