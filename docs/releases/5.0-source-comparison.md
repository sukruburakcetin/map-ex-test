# Version 5.0 source comparison

Unreleased working-tree comparison; refresh before final release.

Reviewed: 2026-11-10

## Comparison anchors

- Baseline: `sukruburakcetin/mapillary-explorer`, tag `v4.6.0`, commit `b143e7db9f67dc393c2b9eb85e131f6141aeca9f`.
- Development: `sukruburakcetin/map-ex-test`, commit `62425b7`, plus local cleanup and persistent Places service changes.

Scope: src TS/TSX, config.json, manifest.json and selected Places service implementation/configuration files; changes are not semantic feature claims.

## Added configuration keys

- `allowUserLanguageChoice`
- `enableElevationProfile`
- `enablePlaces`
- `enableSolar`
- `osrmServerMode`
- `osrmServerUrl`
- `placesApiUrl`
- `routingApiKey`
- `routingAuthMode`
- `routingEngine`
- `routingServiceUrl`
- `sharedFieldNotesEnabled`
- `sharedFieldNotesReadUrl`
- `sharedFieldNotesUrl`
- `widgetLanguage`

Removed configuration keys: None.

## File comparison

Hashes are SHA-256 content fingerprints. A new source file does not necessarily represent a new user feature; use the change inventory for semantic release claims.

| File | Change | 4.6 SHA-256 | Development SHA-256 |
|---|---|---|---|
| `config.json` | modified | `2ee7803de4a813d1f3662418cdd4825f7a26ed557a559ed74fe8caf3736b0463` | `e2ae96406a7ff8c5337a2081c6a8065fb2d4eaa87af9c2f31ab851a7bb54a5e7` |
| `manifest.json` | modified | `58b9e541708a7e492942f42195ac965dba8daf9edfde60cda2834234d2bd2400` | `41cb35d490991ce728c0934310d58f8952759f0b007b8a4764872fe5b03e1b71` |
| `src/components/ControlBar.tsx` | modified | `843dd634025cdbcfc9240df9687660cf8a29af18186ad5079a7024d4a9d7eff4` | `78d7ca0c68c9e1465667f9612082a94dc6c102adccfa3c24f66ee15182cbd6d5` |
| `src/components/FieldNotesPanel.tsx` | modified | `033cee4ba680bef05968820d434e9c022649eb7d7203a630b9fde7d49c187c38` | `cc1316570effa035f97f5908b888d2498faeada07448d537ab527726002f47d5` |
| `src/components/FilterBar.tsx` | modified | `23267dd085ea2b8a26ae82d941126f5077ca5e49d9215a60ebe585337f695f1e` | `515e58cec43b1ff3de8ea4d0da96ad8d414d3345ea110ce8890445fe540a3d9d` |
| `src/components/FilterScrollRegion.tsx` | added | — | `c0944cd5a5e201afb8a7ecc469d2804a3e3eecf686872e34275af3c93e6c7d04` |
| `src/components/FullscreenControls.tsx` | added | — | `a0e65349cdebed96a414c3e966e152b3fa4b395e218f99f0b1b9b85cfd6e2336` |
| `src/components/GlassDatePicker.tsx` | modified | `fe7aeea5beba060dff49e0d8568b291f684856d8c6f2433ffe2389cd55ea6f47` | `b0a0173772d201774c66ba2f1c9a096a9d942b9a16c0fac303dd15f0ee9105df` |
| `src/components/GlassSelect.tsx` | modified | `56cac0226d93e819b5e5f9b2561329ccb5a7e68ab15714d055833255dd1403b2` | `777ee7ffc0677a9942f9fc28c9fc6b6199fb434e6172451e70b19929712c940d` |
| `src/components/ImageUtilityGroup.tsx` | modified | `f08c47d4b3818346ecc9298c8ef04b5ae605ef0a7dd1a4c74040376df6787a06` | `ca3cf848271d9c0d3115591fb4eb58c072f4c37b5f55296e51e2565f4548efe7` |
| `src/components/ImageryLoading.tsx` | added | — | `458aaa942335e48856fd5f3f5fc4726fad7a679865829abdbd4fca3d8ee1ed59` |
| `src/components/InfoBox.tsx` | modified | `c7ca39e7ebe186edce9690e2843e8632876065758c34cd00f5263cc66bb5ff90` | `778f9487ab1fe52f0846b21f0c58f6aebf0013d40a3a0618d8c546f72f3f8d0f` |
| `src/components/Legend.tsx` | modified | `521a74763397bf53bff4696cdb5978a63be43296554219698f2af7827103e2b2` | `d0f8e6bf4c7a5a22e62f258501f9610a3d3da16cbf9e27a83d5978be340ca665` |
| `src/components/LoadedPlacesList.tsx` | added | — | `fed4bf5169602d8ff820c1138fa2364931700d4bb00dd88bd2c57bd9621e151e` |
| `src/components/NearbyCarousel.tsx` | modified | `74fc872ea865f62b16ff86548af411564db300b48ea24c0c8dc5fdefac019fca` | `9415d982baeb2b41634bf189cba19ad7fca12aa09d7ae163bd005177a5981765` |
| `src/components/PlaceQualityControls.tsx` | added | — | `95586b328b939eb789e51b1f997450f2eeb058c5c8b6899ebfb4873a306dfcea` |
| `src/components/PlacesPanel.tsx` | added | — | `1d963f2077a6a456252f354e1710a0d2e0d17bbbf436fa9dbbcb8a956d463575` |
| `src/components/SelectedPlaceCard.tsx` | added | — | `2958215e710bf57281a69cd7d060b94be5eaff660326fefcc588b156503b7965` |
| `src/components/SequencePicker.tsx` | modified | `a0d1f48c70731b6db151360c954f262f10ca86338bb57b3d57fe6879b378da39` | `fe2942d48ab6ee82bddd5c9774efb4833990a948747135cdab41fc23ce8ea011` |
| `src/components/SplashScreen.tsx` | modified | `e044dc888a178a09d3f91331fbdfd756c0dbaf7825515d70492117a528947165` | `9011038932f8959e869bf00e734efc01d4bbd01a1a4f60ee07c5ad2b17458704` |
| `src/components/TileCategoryPicker.tsx` | added | — | `96f4746a7273897778dabb69ae3e842ac4c099951be3bb0d450bea97548d4594` |
| `src/components/TimeTravelPreview.tsx` | added | — | `55990a11fe0f8ed55641fd21e806b2cbe7c9a7fc559d3e0dd0e2ee08d903f0ed` |
| `src/components/info-box/ScrollDiscoveryFooter.tsx` | added | — | `ddbd058520d1abb55569cde20bf76a53c1206e353d43f3592d8652bf698d0081` |
| `src/components/info-box/StatusSummary.tsx` | added | — | `b4990893de17489a45c8931ba751931b9dff0a38b70fae25f5e60310c38382f0` |
| `src/components/types.ts` | modified | `851f20d31fca6d4eb367dbf6663efdbdc3d2a88652e05145219a307ef291481b` | `3e242a275919cfa27d5241a434c2b9d2b78399f94d4504b34a5a83271bb98de0` |
| `src/config.ts` | modified | `850acf128bf43c3161fae5215b9152da2a8d94467886e766442ffd9f341b903b` | `c82f4f6a7043b747ac296af6cac6c61beb26eca894361a40587222b3907a2759` |
| `src/features/community-notes/CommunityWorkspacePanel.tsx` | added | — | `95dbcab3b9f35459f2d4ee1d26dd39b04a03ec3d899e4990328513b2209b9eb8` |
| `src/features/community-notes/LocalNotePicker.tsx` | added | — | `bfc523b141ad47f270c1cc61b3124c7986b9f9932785bd1d0b22bdd205b4e5b0` |
| `src/features/community-notes/WorkspaceBoundary.tsx` | added | — | `228ec0124bedca23e1eb3fdd2d5a4995763fe190cfd9ce3692318ea8919653b5` |
| `src/features/community-notes/WorkspaceCategoryBadge.tsx` | added | — | `d3627fcafa745074a676cc79b6cf40910d4b2719d8bcdfe462414ae54c3032bb` |
| `src/features/community-notes/WorkspaceCategoryEditor.tsx` | added | — | `d1918bf0f3a081f42e3caf24be73a1ec5d01ee5c014977dbeb7bb6f02e4b1aa9` |
| `src/features/community-notes/WorkspaceContributionCard.tsx` | added | — | `3b87a92765dd68e2a84d6c97606a23fbc63262f31a5128014c7197f43a2f99c5` |
| `src/features/community-notes/WorkspaceContributionDraft.tsx` | added | — | `97a6a775320476afc882158b258bbbb293b5a874842588012a6f1f23b1e2e9c8` |
| `src/features/community-notes/WorkspaceContributionEditor.tsx` | added | — | `f9c16ce34bf749d102cdb46f842cb80af2a8405374a83e2a2850541aea238325` |
| `src/features/community-notes/WorkspaceContributionTools.tsx` | added | — | `c18b34a8ad05cf0c5c06fd96b2f172815c732180f8b1ea35b8ea45fb2d1fb577` |
| `src/features/community-notes/WorkspaceDisplayNameEditor.tsx` | added | — | `a38941c56f5502c31fad87ae769be33a72c01c27f56ccdb7f2df07336c4ccd8a` |
| `src/features/community-notes/WorkspaceLocationPicker.ts` | added | — | `5eaff3c21b26eda6469bfc20418d9f21491728a9748619a486280e8cfe75e8bc` |
| `src/features/community-notes/communityWorkspace.ts` | added | — | `3724d55ce1759ed38537986e974855a414136b0412bd0eb6ef8ceb8d14d2e969` |
| `src/features/community-notes/localNoteChoices.ts` | added | — | `09505719d8ba1dca0f18485858850e22ebeee30c05948e234de6520511368402` |
| `src/features/community-notes/useWorkspaceContributions.ts` | added | — | `a5285dcf07b7ae352b1e5ef8c72249625022d1b0fd30e00041cb82e2fff08eec` |
| `src/features/coverage/CoverageAnalysisResults.tsx` | added | — | `ec1d44eacb4463d5deee6167213781a6740acbe86c0639971ac4f534e8a2251b` |
| `src/features/coverage/CoverageAnalysisTrigger.tsx` | added | — | `3e3ee95e9066ac15639343cfdda004f43ce2fe7fc2fffbd5db34a2c16980ebe3` |
| `src/features/coverage/CoverageFrameLookup.ts` | added | — | `7147a0f327293e8baee5651dd32c46e8bfde01cd86a8cda2b5e52e346ed6c725` |
| `src/features/coverage/CoverageHoverResume.ts` | added | — | `58c6e3af1b05e5c4877ee913f5d3919e84d00be712aebec57c6d2fd101edc53d` |
| `src/features/coverage/CoverageSelectionTargets.ts` | added | — | `270f766dbdb65be2b3f9397324889673db5742a717c5f7f097404dabbec39334` |
| `src/features/coverage/CoverageTouchHover.ts` | added | — | `4d8a94b48f03555c9996d076d1320a0597d71553328cabc25ecc6c08dbe9e7c4` |
| `src/features/coverage/CoverageYearLegend.tsx` | added | — | `84869e05904fe0395b7f91e915363341ada02f10bc7e63c66f0dbb51439c02f3` |
| `src/features/coverage/NativeCoverageAlignmentDiagnostic.ts` | added | — | `5dab40af3425e42cb13e4f5408bd20e61f4c2aa1f18ad0c89ddfe3a4e0526ca7` |
| `src/features/coverage/NativeSequenceSelection.ts` | added | — | `b4e2085914601031b439a8fcca348bacecf5fd55a0f87c567c378574be25a8cf` |
| `src/features/coverage/NativeTileHighlightCache.ts` | added | — | `8dbea4a5e47775baffe205f87faecea2aecd2a3a54c8525691e5b57fa0f2bd31` |
| `src/features/coverage/PreparedVectorTileLayer.ts` | added | — | `946713e26e610b30e5bd7f8e2c4a79959ad8ec655eb799039dd0aadd47395d84` |
| `src/features/coverage/QualityToolsSection.tsx` | added | — | `d7850356a3c94947d2be1d187d40922c15afc187ad1c08487bd6cafe656ee1d5` |
| `src/features/coverage/RepresentativePickCache.ts` | added | — | `ab06f959c13ba0b7f6a10ce4f54de295c5b4bf65f4551b9f257cb77c89bd962f` |
| `src/features/coverage/SequenceHoverHighlight.ts` | added | — | `cd70f46362e822e82e95a190055a62a1977ee0233578f66cc41e33d5d10bde6f` |
| `src/features/coverage/SequenceTileIndex.ts` | added | — | `cd29a44d95865070ac53c0c6fe2fb1503b59935f5ea7eb0adb34e834527542d2` |
| `src/features/coverage/SharedTileRequests.ts` | added | — | `3e7fa3586e66d9f8307ecc49716712556d742fcbe029d30191614daa95b51386` |
| `src/features/coverage/TileSequenceHighlights.ts` | added | — | `0dced3a9d4dad2c19e2fbc7dae761b8bbd38b40d06d7818c69ce48d207f14fa4` |
| `src/features/coverage/coverageClickDispatch.ts` | added | — | `58d8ee66ddb54d157663fe4c9a39a9a28cb1583fd2ea8181824a3dce93a965fa` |
| `src/features/coverage/creatorLookup.ts` | added | — | `458e0b29f79ec192f555da1fde090d9c718b30b458b3a3865999d36faee50938` |
| `src/features/coverage/fetchCoverageRoads.ts` | added | — | `08019ac1654d26fb9673ac50f4fb4765f93f1c03a28808ba530ccdc89de2d141` |
| `src/features/coverage/nativeCircleMeasurement.ts` | added | — | `8a6f42b1526aaa7f585a78b2a7d3beb7890f4877aa69a42910e2d08a71c7126e` |
| `src/features/coverage/nativeCoverageAlignment.ts` | added | — | `10d4c939d05c1f4624249905ff37eccd9ca4bd6d08a173de3063db8ca76cd004` |
| `src/features/coverage/nativeImageAnchor.ts` | added | — | `5314014edaf376c6c80400dc5d463e0027f3d889c369a18b9873990f35475b9d` |
| `src/features/coverage/nearbySequenceFrame.ts` | added | — | `65091ba2eb952bbb237419f64c7c7563c7b05207ea5924ead8a56c123b2acd9d` |
| `src/features/coverage/nearestLoadedFrame.ts` | added | — | `ca1faafc2fcf0adccaa6b34b77d8f8969d5474e3549b065c44f26e654ca343fe` |
| `src/features/coverage/organizationNameLookup.ts` | added | — | `e88fd0cf0051eabb49a4aeefe1d4e57a9e75fa0cd2af6bc11f6b8d56b248c0e0` |
| `src/features/detections/DetectionExplorerControls.tsx` | added | — | `657903ebff965df6e3ec565219b5dbb458787338e49306e8ebbe54bca47c29cc` |
| `src/features/detections/DetectionNoteAction.tsx` | added | — | `749be0298273a4c56c89f85bbf29d01dbf81b296072e224663006578e4557d7a` |
| `src/features/detections/DetectionToolsSection.tsx` | added | — | `46a9ddb3b27d35b96e1385a76fc3b7a5816103f7a2263b3c39d6bd9a363da2b8` |
| `src/features/detections/LinkedDetectionPreview.tsx` | added | — | `0482014e74d131942d41825fc9c21d809fd882ffcb95103b2728f23584bfb6af` |
| `src/features/detections/MapSpriteLoading.ts` | added | — | `90ac1a9c79fa8caf1e247ca4d7595b95e9f9c798472830ec4d7d45bcd5b32717` |
| `src/features/detections/NoteObjectChoice.ts` | added | — | `196b3d81f5addef988f4d91b3e04fee4d2b1b84e57473af9afc936ec21fadf80` |
| `src/features/detections/PanoramaDetectionLabels.ts` | added | — | `5be4569bad670e90924a019b00d8a11dd2f9e77bbafae55432b1517b7a400491` |
| `src/features/detections/detectionExploration.ts` | added | — | `1c091fc23ead7e6d67e9465f81fca7507767cbdbaec2590c1d0a145e8d36d4be` |
| `src/features/detections/detectionImageAttachment.ts` | added | — | `f98a645c3257981bd4f5411fa641590d92596c4c4de41a1c3e6eed6baa39876e` |
| `src/features/detections/detectionNote.ts` | added | — | `f873bd974131b8f488b4a030759ce1a5cba9c22a726958f40e0a054c4625d63e` |
| `src/features/detections/detectionPreview.ts` | added | — | `ac6c6125cc7e8c00344da5045accfa0c681177005cc93714d40eabe329dbee21` |
| `src/features/detections/metadata.ts` | added | — | `3eb31895734d49b6b024a49c1720b58dfb05f7aa60e230ed44625aaa6acc54e4` |
| `src/features/elevation/ElevationProfileController.ts` | added | — | `e04fc55db51283a1d3214e01237bb1725eebe9d8e9416c3ff1097f3773b54187` |
| `src/features/elevation/ElevationToolsSection.tsx` | added | — | `28261a8c55c79b5084f8597a5dca04045350c298b9407417bebfb7fc0aea5986` |
| `src/features/elevation/ProfileFlowDock.ts` | added | — | `192c00bd298158b675b01207245e886d590a3a4ae64ff9dcedff7c84d5c48a80` |
| `src/features/elevation/SceneTerrainController.ts` | added | — | `4675fea9bd19c96401fbdb1a7339884b9ef73eca9e2c6ff7473cce0accd2e703` |
| `src/features/elevation/profileIndicator.ts` | added | — | `b24eb8a2a8483536c2adbb70633b94e9176fd91b618ddf23f0c0ff268de55c09` |
| `src/features/elevation/profileTracking.ts` | added | — | `d7fcf1037ecbe46721fbf08dd1f648fe695dc80802fcd31fff770f2d35df1ff8` |
| `src/features/field-notes/EnterpriseNotesList.tsx` | added | — | `2f1ff85ccdcfa44bb5a9f4472e3d86574c5cd42f5acbf81d93ac6d29b8bbf3dd` |
| `src/features/field-notes/FieldNoteDraft.ts` | added | — | `e4d7a1613e4e7fa039969ce1304f6b9dd0330581c88e89a2af7eaa2ff8e0edc9` |
| `src/features/field-notes/FieldNoteDraftFeedback.tsx` | added | — | `0d5bf4d8f5291c55355c916ba043fa351a486eb6500c2363bd2668ae8e99bb80` |
| `src/features/field-notes/FieldNoteFileFeedback.tsx` | added | — | `49e02f08d240ea4c88e08852583082e03e74b753209f2013b8da1c90cce2f816` |
| `src/features/field-notes/FieldNoteFiles.ts` | added | — | `fd646251ca266137e2b9f6d1130f42bb936c526e99c94e7b07fdd08abb3fc653` |
| `src/features/field-notes/FieldNoteMap.ts` | added | — | `5910f0a670ac0b3db2a6de38f8ad0705796774ed90ef09f2308e0cb95db35aaa` |
| `src/features/field-notes/LocalNoteCollection.ts` | added | — | `6e2a1c8523a5cbbd15a66ab47a0c26f4c65a629cdadb26c239b74b23af9af057` |
| `src/features/field-notes/LocalNoteCollectionFeedback.tsx` | added | — | `a3b28a995a2d89f996b51f3cb8dc109fe7a5888905f20e046663e675c2da4b7d` |
| `src/features/field-notes/LocalNotesList.tsx` | added | — | `9f60d4c075d82c569a4a9b486a45723ff6427fa362d64c95529051345d544470` |
| `src/features/field-notes/NoteAttachments.tsx` | added | — | `905513c7cf94cb1d40fe39ce80e9ebd92c6db7c1c9ac0f70f20b4cebef9572b5` |
| `src/features/field-notes/NoteDraftForm.tsx` | added | — | `626908dd47ae5532b64e40dd6e678cb8a4f9bc7e9df671c307a13767db4d7e89` |
| `src/features/field-notes/NoteEditor.tsx` | added | — | `f03cdb41baa17081572ce4870b11720deb9d18d21aecc0b70f13eca869e2394d` |
| `src/features/field-notes/NoteToolsSection.tsx` | added | — | `a2962febf71c997e548781ab0603ea8e1a11f9fae93497c12db2e872bc56d0dd` |
| `src/features/field-notes/NotesSearchControls.tsx` | added | — | `60756ddc15d15526608977e20b58a346f61bd930f9a2b0db2da06678777e8d04` |
| `src/features/field-notes/PendingNoteMarker.ts` | added | — | `18369197539e2954a6097667b15c19fc22afc054aec1917ca7e75a78da28ce12` |
| `src/features/field-notes/PointCloudAnnotationPicker.ts` | added | — | `e71d17d131c39627fd806e7bc3f3c7a11a2a0b9df8f2f315f7d584ea66484f7c` |
| `src/features/field-notes/attachmentFiles.ts` | added | — | `424d54c93bd4d77f84222a6b16f6101f59538e22281f1e3fb42e173edf2e3936` |
| `src/features/field-notes/enterpriseAttributes.ts` | added | — | `d274802d288dac091834f6baa38a80df69122e3d8737225e4e1a8a9309ed496b` |
| `src/features/field-notes/enterpriseEdit.ts` | added | — | `90e0381089e757bb1901b6b15265629e6e69be4e234973ad244a0b1a3f0585a4` |
| `src/features/field-notes/enterpriseEndpoint.ts` | added | — | `eb69a45bd6b7c6ff42a884b35374cad948c6f7e7e0cbf3b15e6b6586b7d3e269` |
| `src/features/field-notes/enterpriseList.ts` | added | — | `825f00139a94f6b05611f108db1a028ef87d9a804d7cee2c8d7e231c99b45aba` |
| `src/features/field-notes/geoJson.ts` | added | — | `39516cf4b40278e12930ef9b4e561dd377977b9313dfe072d2dfaa73bd6734ab` |
| `src/features/field-notes/localPersistence.ts` | added | — | `647b1d194138f0d34e002bf90360611b1bf034247c3e4552761856786d0e9f8c` |
| `src/features/field-notes/mapGraphic.ts` | added | — | `c0a886a28eed3a8229f2d565753603587a3713a7aa0c62596e6902f89bfc580f` |
| `src/features/field-notes/nativeNoteHighlight.ts` | added | — | `474256fe2998a3d13b83299bcb348dfbd5bd4a3da31a67d6e7dc6186498c751b` |
| `src/features/field-notes/noteSearch.ts` | added | — | `86000097b8df7822c135e85d5bc4e7e3d62ea9df5944549e358c640b60db8bc5` |
| `src/features/field-notes/viewerBuffers.ts` | added | — | `eecc436694e6d20f8d83db96ae6ed74d74ad3064658efe55159e66b099440a27` |
| `src/features/field-notes/viewerRenderer.ts` | added | — | `4adac7f969f52524d5e84b2a0615c7348c4325a1ce8b1a33cb5c47d2879d1a40` |
| `src/features/field-notes/viewerSelection.ts` | added | — | `3bf9cbaa8a4bbd91a59bea6b5a3aa73ec6e532f524efd6aa8d377d0a157fd2d5` |
| `src/features/imagery/ActiveSequenceOverlay.ts` | added | — | `a767215be3fc531377fb210be7655e39692c9e07e4e827d33ef6524cf89f6c55` |
| `src/features/imagery/BackgroundRequestQueue.ts` | added | — | `a7685c3a4fdf478c830598956abf22494231deaa2ba86cb9ac77d8f71a9499c7` |
| `src/features/imagery/CachedSequencePreview.ts` | added | — | `65a2a942a2f0b4304a2ba4432ffe5d97f456271e604d40c0bfcee33c8e71d0d3` |
| `src/features/imagery/DirectionHoverBindings.ts` | added | — | `8a79713df5f6e6a561d01bde049830b7754c2af23111e3890f90bbc963e317d2` |
| `src/features/imagery/DirectionHoverDiscovery.ts` | added | — | `1e1cd56e7206043e8b9191380a4245f9101ef375de532d7c4f68b9f84b9641a4` |
| `src/features/imagery/LiveSequenceFrames.ts` | added | — | `7da79dfb0e9a831a6ed8ff30cab700df977b69e4fdc68e92bbb3aa8b90ca2aaf` |
| `src/features/imagery/NearbyToolsSection.tsx` | added | — | `8797af8294621a0e26ca2d09c7a0fd9017584e33298dbf4e02b8617c0e629216` |
| `src/features/imagery/PlaybackBindings.ts` | added | — | `30bcff472e099b1ec3d4160036dc19d69251478bf71803380ed0368014edc834` |
| `src/features/imagery/SequenceDemandData.ts` | added | — | `ac3226e1eb25fcd80444696c064fe3baa7cb9f2d61b4e8d577958f7f98021789` |
| `src/features/imagery/SequencePerformance.ts` | added | — | `652207a53b5651aad1b679877549c445990e04d630fda25585830ad40aab443a` |
| `src/features/imagery/hoverBearingMetadata.ts` | added | — | `ac136c058f841043dd45b143b447a9dfd9b02b9371baad16a1d6e47d6fc3521f` |
| `src/features/imagery/hoverBearingTarget.ts` | added | — | `2b5c99f78d2a93c40232f9e712a609f3ece684fc7e5a462571c5994870c210ed` |
| `src/features/imagery/hoverCard.ts` | added | — | `83d7cd74c88068f64425f6cb307c9b905742ec33d40e4f6b041ef06883459e4a` |
| `src/features/imagery/imageFollowPolicy.ts` | added | — | `87681b278118917ef0be7c464834d727ddfe2d2387acbf07aace78a165a96e4c` |
| `src/features/imagery/nearbyDiscovery.ts` | added | — | `2bbe21b5db56620068b4454565bbfaad47e383f69f8c47c9d030d5fe6c23f85d` |
| `src/features/imagery/nearbyHighlight.ts` | added | — | `3413d41d176beb5c2d6ade413e722ead0ed27413df2331a7520a90cfc96b241e` |
| `src/features/imagery/playbackRecovery.ts` | added | — | `826176acc8bb44f599d8da19855ce16352a2cca38bf1126d155cd475977bfc48` |
| `src/features/imagery/sceneFollowCamera.ts` | added | — | `fc067bd065474c2ac4f7103f193a995a763d2a9d5700945b7e9ea88bc68388ba` |
| `src/features/imagery/sequenceCacheStore.ts` | added | — | `93e44686fe65d2bee20321bb16d2d616a365ac499183ad993b26b5988b3b8521` |
| `src/features/imagery/sequenceCandidates.ts` | added | — | `5be6cc3db68908feede45b2ad15a18f92b2b9d06e42d25bf2c431e189b128d9b` |
| `src/features/imagery/sequenceCoordinates.ts` | added | — | `9580a6e514f43845e1acc4da435f94d0c0b491da3f234a3a595884e1fbc10e43` |
| `src/features/imagery/sequenceMemoryBudget.ts` | added | — | `7a6d3b6f370967a4712e1b8984bd8c240b9dae0da8924c8ae1f4cf755e65333e` |
| `src/features/imagery/sharedSequenceRequests.ts` | added | — | `2fc8a1ff7bc6a807bbdda04f3f23bb70cc3b0667229f28dc8f88d37a48ffeb3b` |
| `src/features/imagery/timeTravel.ts` | added | — | `85c8ba3784439b0e8e7c32cd24874bed71f5b23f641af9f7b4630f0fa4aa6499` |
| `src/features/imagery/timeTravelPreview.ts` | added | — | `83b0f35619aac21e1ce0787b27ff0516ec09cf676d07b22e52d2a00c0e139ea4` |
| `src/features/map-graphics/CameraConeGraphics.ts` | added | — | `089a7f631ce102a9f22e68af2cafa09a8f94107e20af48be560a4a47f2cf639d` |
| `src/features/map-graphics/ClickRippleAnimations.ts` | added | — | `c91ca616c23d669d5e2f69174536969a250eb0be573b497a4df733ae07ffe3af` |
| `src/features/map-graphics/CurrentImagePresentationOwner.ts` | added | — | `0fd7c2abf89c68eeb9757f5e682cc3f187976369c5403c3430af06321293ddb8` |
| `src/features/map-graphics/DirectionHoverMarker.ts` | added | — | `d53a7a74ba970ba2874688bbb2e85f0997353843a9db9e756db75363d644e52d` |
| `src/features/map-graphics/HoverBearingSector.ts` | added | — | `64d8a683da6f0f772ac0a42cd2c89287c72b7d8e9f58b0244a66d42fbd09f6ec` |
| `src/features/map-graphics/MapSymbolLegend.ts` | added | — | `e420ca63abf7905bf15a26093433f6d244a105c25cd3dd9df52b86402665171c` |
| `src/features/map-graphics/NativeCurrentImageMarker.ts` | added | — | `94adf227502f5c3eba16d497ca83e4fe2367fc6051b49b84ff2614d927c32d95` |
| `src/features/map-graphics/ScreenDirectionCone.ts` | added | — | `e2fdc4e4cc3620076d79bcbe82104e7831e70bd390de17ebd77592bebc32e5c4` |
| `src/features/map-graphics/SelectionPulse.ts` | added | — | `580c6970f280bea5711707c2e0e05008d98ada6aa79e3087954fd6b9adc7dd0d` |
| `src/features/map-graphics/capConeFootprint.ts` | added | — | `123748b43c246cc5d242011932b26aec6c9e4bb7f76d603853db22b7d8203bb7` |
| `src/features/map-graphics/coneDisplayRadius.ts` | added | — | `bcb8deaab5457af0c296ebb510ac43a0a951eb5885e899af3ae171a13357e211` |
| `src/features/map-graphics/coneMeshGeometry.ts` | added | — | `5e1fdb6434667489b39352547106042f3d998f1399c36ec86f4058ca4d3985ed` |
| `src/features/map-graphics/nativeCurrentImageMesh.ts` | added | — | `1cfac39cf9ae00b57399152c80c4903f0cec8161675e4832b598b1d14eb4d658` |
| `src/features/map-graphics/projectedConeRadius.ts` | added | — | `165bb2d73632bc19d8fa9d9d24257aa8ce3dc8810d6dc520f08608690cc79466` |
| `src/features/navigation/browserUrlState.ts` | added | — | `70d7dc30fdf8f47f2d18cd3b5a01f1a77246756c12c7351004f501e13d62bfbc` |
| `src/features/navigation/sharedLinkRestoration.ts` | added | — | `025e526e0a6e6bf9ab9f7366bd5347273b8078ef7ac9f6a17f93061c395a528a` |
| `src/features/places/BoundedPlaceHover.ts` | added | — | `5ad81f83b4f3784a4687183b53397c626039140a8e22a4adc87de1c629c4d4ce` |
| `src/features/places/PlaceHover.ts` | added | — | `eac85bb163ef616f3939f387fdf60d6c7a207c1deb10386c272ffcbf45e735eb` |
| `src/features/places/PlaceImageryCache.ts` | added | — | `d84fcd999b93e96298cfbbcc9ae1601d79bd18346e268084937162cfb62bd5db` |
| `src/features/places/PlaceNoteActions.tsx` | added | — | `dbdb899b2d48e04200eae23451b413fbbdff15542b005278a42b9700bb617e8c` |
| `src/features/places/PlaceNoteReview.ts` | added | — | `8d5d3e698cbc36eec9777406672d5045bf01168e9365c081c231accec1f42601` |
| `src/features/places/PlacePopupFocus.ts` | added | — | `a321d8b647e31820f8a8a1cc8c33ad77dff1eef03fcdb615b5514e45439d3084` |
| `src/features/places/PlacesController.ts` | added | — | `fa4eb49c1b75cb34036319c7f3eb201163435dd2a30c51eb988a434e8342c899` |
| `src/features/places/PlacesCoordinator.ts` | added | — | `4d57aaf18fec71bc1d587d9a9723a018e0a591b110e82c4f8dd896e6efd27653` |
| `src/features/places/PlacesVectorLayer.ts` | added | — | `fa267f8a2109afc7e287ba65ab6414474696d6cb8b45d40510bbb85666b4754a` |
| `src/features/places/SelectedPlace.ts` | added | — | `7c6a746442226d566f85e531b8aff8265b8693f1eec6d427be7cdc409bae8118` |
| `src/features/places/TilesPlacePopup.ts` | added | — | `1efa2bacf1ae0eabab03ea7406b5b1a5092b57a7e48bdee8c6b1a6c31a23a9c6` |
| `src/features/places/cameraLinkDistance.ts` | added | — | `156c55d2584f4f399788e12a9f85233663766e784535772071571cd0f72f470b` |
| `src/features/places/nearbyPlaceImagery.ts` | added | — | `a0deb26154a9a581453ec114e7e586897dcc3c35d16641c0b43db142ba97ac2b` |
| `src/features/places/panoramaPlaceCenter.ts` | added | — | `a5afaa70b2745c4343472c975bf7449a90b53406b7dbcb68abcf94db71fd608a` |
| `src/features/places/placeIcons.ts` | added | — | `807aff5f7121ad0d01054105a36d61ad4861321d4a051fffd21d3690e38d9557` |
| `src/features/places/placeListUtils.ts` | added | — | `3862e84055b9b1f98af74bbecf7ed5918cc66698ea7f7fe0fc0c045d9ab2e26d` |
| `src/features/places/placeNote.ts` | added | — | `cc9433d86797cbc185a9ee4dd6c0d225036fa7ec9e4ac61ebd59135f3bb3c2ce` |
| `src/features/places/placePopupStyles.ts` | added | — | `22af0fa6af4d397a3dcdca4233e902104ba000a9791c12abc85b08bf01825a30` |
| `src/features/places/placePreferences.ts` | added | — | `a7beff4405a1ae5578dfc5d24003b83d9bc0a27ea39f19e7b42a2aee86320f49` |
| `src/features/places/placeSearchMovement.ts` | added | — | `a36f41258d419045123ddf41819826ae490df9cac938accb7069e510d3a4fdc5` |
| `src/features/places/placesApi.ts` | added | — | `5446ae2b184e8555c337b3ff76a5ca3b479560f3d649fb5d1937c511da3a8e16` |
| `src/features/places/placesModel.ts` | added | — | `bdcee608ff45654af17b3b1a30a72ce3b59518f8e91c57ec9e85f4314c5f9711` |
| `src/features/places/publishedPlacesExtent.ts` | added | — | `42e4178fce4594902d062a031fb49ab3057d47f18596f911937d69e7a28e271b` |
| `src/features/places/tileCategories.ts` | added | — | `42f8ca658302222e9ab22fb9c36233a5d0d7dd341c4312af1ddee6917db1a562` |
| `src/features/places/tilePlace.ts` | added | — | `c57aa70c03fbea2e4746aeb05c9efd1606c3c9b851503dcb1aad0becff4a4672` |
| `src/features/point-cloud/MeasurementViewerRenderer.ts` | added | — | `4c63756a6b3105c9d9c275533e7142d668ffe5f69a19b2a7ea615b76de772c96` |
| `src/features/point-cloud/PointCloudAcquisition.ts` | added | — | `3fc404befcf8b11ed88b7d22c0257afa430c521cbf4bbb7a7bfec39a441b3c61` |
| `src/features/point-cloud/PointCloudAdaptiveDisplay.ts` | added | — | `ecff0e72a459fa3a6a486e2c2fa1cfc266d0cd992d70ffa8de9440595fbd9222` |
| `src/features/point-cloud/PointCloudCalibration.ts` | added | — | `bd3e408e9e21e7eef0687a3a161e260e5a92c89d92b6ea51dbe470cdf7612533` |
| `src/features/point-cloud/PointCloudCalibrationControls.tsx` | added | — | `c07ad3786e43265340ccb8ae41bc427948917ca0f87633adfc419d7859b77ba9` |
| `src/features/point-cloud/PointCloudCorridorControls.tsx` | added | — | `c0fc52ebddbdb5cd244fb5bacef0773981f70293d7b837ee3ceeab548e45d41f` |
| `src/features/point-cloud/PointCloudCrop.ts` | added | — | `945eeaefbea53f5420b0894885aaa9d7a9fc35671b41d1a85708ea2727938f14` |
| `src/features/point-cloud/PointCloudElevationLegend.tsx` | added | — | `51b595c1a0d2cef393ebca242207487b45e0ca5537bad75010578889eb99b306` |
| `src/features/point-cloud/PointCloudExport.ts` | added | — | `c560fa5aacce46b263713ec6d570904491170c58c904f676a795cd3a6a8a0587` |
| `src/features/point-cloud/PointCloudExportControls.tsx` | added | — | `0d80257198655ebabe80c54b92d7ee849c02011de62a0fdbcce16bc670d37ed6` |
| `src/features/point-cloud/PointCloudExportFeedback.tsx` | added | — | `ed49b729a5048a5384496882be4c59b2327bce992e4c32245cc9a5a5485aa7e0` |
| `src/features/point-cloud/PointCloudHitRouting.ts` | added | — | `63cf383e7a531029aabfd9fd831d3468621c60ad1d6d9b7126c11161b72e4065` |
| `src/features/point-cloud/PointCloudLasso.ts` | added | — | `efd5cff478e2c43c57d3a0632f7b8bb11d228572a76c47ede8d0caf2817475b6` |
| `src/features/point-cloud/PointCloudLifecycle.ts` | added | — | `87d78efa2d700ea931770673f45250b181dc2fdfe05e5047c8d07397e43d1374` |
| `src/features/point-cloud/PointCloudMapLayer.ts` | added | — | `4fe7d31f5bb6d004d7ee4cf084a0aaea2a983665d1c7ba33b48a432825703618` |
| `src/features/point-cloud/PointCloudMeasurement.ts` | added | — | `f977a23c0aa2d04ad8f862ab6ff9fbae55c37c677c33d2d5cdec9b70df949a4d` |
| `src/features/point-cloud/PointCloudResultApplication.ts` | added | — | `c0955ca9c4225aae4c99948c2bd306fa536d3b28dbc9480b7ffe34be88214eff` |
| `src/features/point-cloud/PointCloudResultFeedback.tsx` | added | — | `5702678ce3fa9583e0d8d0d6b8313ccadedb7c81bc65427dfe61f989ffff7d9b` |
| `src/features/point-cloud/PointCloudRings.ts` | added | — | `5236430fb40ac7d7273567310162208d38e35170bf89e0171ba4f8e7f341796d` |
| `src/features/point-cloud/PointCloudSight.ts` | added | — | `de77d90a0429a46e9e30541c588abd0493b6b05ddc62ae945b1b651d38e4fed9` |
| `src/features/point-cloud/PointCloudStatusSection.tsx` | added | — | `70be43ac20bd0149b11e33cd135f9509c7077ead150af9b572e77b8a82471f15` |
| `src/features/point-cloud/PointCloudToolFeedback.tsx` | added | — | `f31a6be73a90ac52a7618a6a2ea6e1d5557fbfbd08cb1a0eb8d80821028504a8` |
| `src/features/point-cloud/PointCloudToolSections.tsx` | added | — | `23d1ecdca3921ac29bb9e7b521dd9705fe473822c6af48d57e805fe6676804a3` |
| `src/features/point-cloud/PointCloudTools.ts` | added | — | `4c2bcf383ea53f20c0b72aab9d1844008fb3779e06797b8de30d9a3f9a244788` |
| `src/features/point-cloud/PointCloudViewerRenderer.ts` | added | — | `2dcd3deb82358703cbb780bf6014d92a3d1af7909d4751aea32d57aa6373dbf7` |
| `src/features/point-cloud/PointCloudViewshed.ts` | added | — | `a8db65884b4a4bc367558de14a8eab659f23ca9557f95af89df40ef5fe2b535c` |
| `src/features/point-cloud/csvExport.ts` | added | — | `678e7f96306cf986b99ae3491a555df67bb2cbfeba5c30a6e37346943f634ba8` |
| `src/features/point-cloud/lassoProjection.ts` | added | — | `a6c762f7225c8829b55f5e61e4bf96c5c7d3db4d1bef070f1c14923e8a7bc7b2` |
| `src/features/point-cloud/pointCloudGeometry.ts` | added | — | `883b7a0d59454e44bef4e72cf1a26256feb307dd481f51963f7dae785614a364` |
| `src/features/point-cloud/pointCloudMapPolicy.ts` | added | — | `45fa280dc40d661baa6751d53bfead60448fb7ad718125627852807ed7a05967` |
| `src/features/routing/RouteControls.tsx` | added | — | `5511db68994623a1724f19cf37031622ee1b7b5df79da775d82789b2dfd5160a` |
| `src/features/routing/RoutePreviewControls.tsx` | added | — | `55431e0ad39cc120205e67f17cc4c6a1c85439ca51363c4c96a3d6132c4790a3` |
| `src/features/routing/RoutePreviewSimulation.ts` | added | — | `e43dce976f58f7af72df17c314cb81d59eca56fc654cc6ebe06c27a0110156dd` |
| `src/features/routing/gpxExport.ts` | added | — | `4bc287f649ca3bf4d565b1cfcd0e01eb9d0b007af015989548f91d3031142511` |
| `src/features/solar/SolarMapOverlay.ts` | added | — | `b1b94efe7849609ec982a439019fdd5cd30f0fd90b1b4d2368090e0bfb7ec06b` |
| `src/features/solar/SolarSceneLighting.ts` | added | — | `d8bbc6fbb53348abaeb9f81cafb15cd26cebb292957d3a8c57850fa8631a9df0` |
| `src/features/solar/SolarToolsSection.tsx` | added | — | `31ee09cde6ec331234751737fa0f21b68591cb016430e27d67185f9885f582ae` |
| `src/features/solar/SolarViewerRenderer.ts` | added | — | `345ada486021d5b0fe171cf7bcaef4ab4a68a8a65ba81cbaaaaee8ac3e1fd0e5` |
| `src/i18n/PresentationText.ts` | added | — | `2d8e80df63dd2c3b66712ce9d751fb25510d79fc1ffad8c85af82c1e08df71e5` |
| `src/i18n/SettingsLocale.tsx` | added | — | `fa30956b757c1b1503dc5d3de8c3dd3bebfdeb8fd017738a823a5e87359fb2f9` |
| `src/i18n/WidgetLocale.tsx` | added | — | `bf09f2121f48ca48f5ac270e97b2c27936f86ecdb1c540589bb7d069e1c5148c` |
| `src/i18n/arabicUiCss.ts` | added | — | `00fde08094ffc6f91a4982d2d39c02d868d27b1c655fca325d2c5eeda7afdd70` |
| `src/i18n/completionMessages.ts` | added | — | `20db899ac969626f59c49a182ad3faa6adc8e8e7462c28468df675bd77c0329b` |
| `src/i18n/core.ts` | added | — | `0d532da3058caf5882e7acf457c17ee5c2cc252ecf5b855fe872cbbd2ba22a44` |
| `src/i18n/enterprisePopup.ts` | added | — | `bef4eeb95ca2d86bc837495fff12c27cd4d6984385f9d3f572f5b37128c6cd61` |
| `src/i18n/legacyEnglish.ts` | added | — | `d2fedc87356f96921b126293ae067a2e51048c8cc2d4aaedd2fed0b4cd239b56` |
| `src/i18n/locales/ar.ts` | added | — | `a0cdc721e9ef80d21fab22764ae87fe87c9a76883070d12dfdef698e514bcc73` |
| `src/i18n/locales/de.ts` | added | — | `8d65a00ee33d516b8a8a0270be3816671cd44a18d1bc355b293aa919ffdda056` |
| `src/i18n/locales/en-gb.ts` | added | — | `19f9b8ee01cb771212d0effdf0ae8608a7a149b486ed46cf6c21fce2ef6bc0af` |
| `src/i18n/locales/es.ts` | added | — | `008d6d9278d64a72daabe21d9670bcadc940eaeb780dcd0b68d727b36579973c` |
| `src/i18n/locales/fr.ts` | added | — | `9e3156ead19383656b7fe41054c366b1cc25385b1376e003ea0733c55437da7a` |
| `src/i18n/locales/it.ts` | added | — | `3ce7b9d2a87d9e4b05af096bdac60ba34b3986c968af06cacd206d853c38b3fe` |
| `src/i18n/locales/ja.ts` | added | — | `0d057125c13a0f3faee2af3187ea9280b0d37570f46ceb543ade180e587947c6` |
| `src/i18n/locales/ko.ts` | added | — | `965dcaaf256c977df9617b9b57d7af17f26b46c54a5271288a6cda90414652e2` |
| `src/i18n/locales/pt-br.ts` | added | — | `b5daca434104ae8316acedf7ea87697b428c33b0c4009fae3afe7811a1b8d465` |
| `src/i18n/locales/settings-ar.ts` | added | — | `b2ec1374426f61aa99439a31a9ec95e6c7bdf88ef732511dd50092e2b6adf914` |
| `src/i18n/locales/settings-de.ts` | added | — | `7677790ff6dad0e80528572cad0d5384378ab784b4a0f422fa66605b4c02b1c7` |
| `src/i18n/locales/settings-en-gb.ts` | added | — | `01d2cc0642cb4de4fe560d2f2b56da8ba5f96372e274c462411b385afaef5e14` |
| `src/i18n/locales/settings-es.ts` | added | — | `c1f2a0dc4fe2cacb25b5b7f88facc91129c024928edcdafd22cdfbf6209033dc` |
| `src/i18n/locales/settings-fr.ts` | added | — | `55528e2c86b54f5f9e256cd5374330d161aa54e097f69fca2fb6f7fc6dd49461` |
| `src/i18n/locales/settings-it.ts` | added | — | `971c5dbb33b50154613aa031e52b2448ebdcf6effbffedd9fe52fccd4bbca7a9` |
| `src/i18n/locales/settings-ja.ts` | added | — | `76a21a9bfe8b6c9c99fc9060f32b9c44a0c4f18d824b7575387575514c3c2ea0` |
| `src/i18n/locales/settings-ko.ts` | added | — | `4817e015602650ffcfa3a070b4dc2e947170bacf1d46ad2cfe684d366ac1c431` |
| `src/i18n/locales/settings-pt-br.ts` | added | — | `29668e18194901331ecba67b480a026d41e3500b2b1925897e1614c27ad48f55` |
| `src/i18n/locales/settings-tr.ts` | added | — | `60f0f9bb4cf1cc8b14cdc79d50d1e054f329918b1d373f203712600469bcbb9a` |
| `src/i18n/locales/settings-zh-cn.ts` | added | — | `dab5cc9abedbc857de5e0418f2b189830feed8241a748eadfb0503216b9a4b81` |
| `src/i18n/locales/settings-zh-tw.ts` | added | — | `b8633bab2272e71d4575918584d63a478c6299e6f4d7323a876f8a727589af9a` |
| `src/i18n/locales/tr.ts` | added | — | `ddd2f8e8a5b368de0b0ec2f4b0ddad15138424f0565d3b0162bac864dee2f44c` |
| `src/i18n/locales/zh-cn.ts` | added | — | `5e4729099125f0f8659664737398c31995ec538985142d6cdb5c5df9d346ba8b` |
| `src/i18n/locales/zh-tw.ts` | added | — | `71367564e64ba638ac37c86eb5fe59826bcd49e4ba5556cf12793f0acc1244cd` |
| `src/i18n/messages.ts` | added | — | `6b6b0c6e31f0a42a6a674fe9f341d509e7c881ea136b9fae75bc435ac1636e95` |
| `src/i18n/runtimeMessages.ts` | added | — | `086b9ea78d5c5e3d7ffa1011350a7ad767693370edb6fd67a2b5c4c208712f4e` |
| `src/i18n/settingsMessages.ts` | added | — | `6ce3c061f2b9ee85da526b0ab98d58a2d84b045fcaff7f5135fb2669215b79b0` |
| `src/i18n/startupMessages.ts` | added | — | `27ea0737a37677a6a2f54d6e703cdce1873a70ae6b29ef82b1b7187f62f70820` |
| `src/runtime/widget.tsx` | modified | `cd61f15c2b2145cd4830ccedb6ee0623db43e90b02294946e5bac0c7e971aa8a` | `5c231fab4effe26a18641e6c0dc8cb94f286f98148923c23301720c7de3d095a` |
| `src/services/browser/coordinateClipboard.ts` | added | — | `25b95651c34efab449486e727a0456b261409ea6f4f1a672f971215ebfaeadbe` |
| `src/services/geocoding/reverseAddress.ts` | added | — | `57e41e797bad37d74c341e30baf9ff4e5a3bc2a0bc1a2eacbe189adde581a651` |
| `src/services/mapillary/graphJson.ts` | added | — | `804d466e391f9546ddd3c89696d9d7c3859cfd12f34e23b471bc77c7f30585a7` |
| `src/setting/setting.tsx` | modified | `ad0e22ec99c3f79384fb31b9d593b70eae30318fdef15d05fd88cb6c646fff31` | `4f6284a747fa19602e47f3ea9ff6038ad0d071025ecd201586eae044ecc5cfaa` |
| `src/styles/communityWorkspace.ts` | added | — | `87358f5c5f739693b3f5d54502d006a1c274c7abe8f5dafee5fb303b24beaa21` |
| `src/styles/controlPanels.ts` | added | — | `8180b13c957306bbf2be3d3485ca293172eb285570a8876d9f6abdda2b44be2c` |
| `src/styles/coverageAnalysis.ts` | added | — | `78eb99f98b8f0fdb6a01703cb2e5381bc0e2698fad0195450d30bcb6e16c83fd` |
| `src/styles/coverageYearLegend.ts` | added | — | `f031f2f5a008fb7051c449d344329378abaf50f858156ad74b8dfd1de8054f6e` |
| `src/styles/detectionControls.ts` | added | — | `cc8c8a26e4fe4d4861b9507ae2ea0b4cdc3dc2238b603c616e8a49f06ed86d2d` |
| `src/styles/elevationControls.ts` | added | — | `4b81f0012faf3962c57d48ad41b0802b76b21472a48cc5e7b1279a44ba581c3f` |
| `src/styles/elevationIndicator.ts` | added | — | `2ea22faa2e2669d80e42f1ca216acc144aa0f293c5889be09f40578da1c7b04d` |
| `src/styles/enterpriseNotes.ts` | added | — | `48c5e632bbbddacb618818e82c8cc8f3539b1f9cf79fa1fe3d8e465833e8d6a0` |
| `src/styles/fieldNotes.ts` | added | — | `e52532d47b01481b75bb8835179d53d60a07c14a4c9ee4fe3bc0819163529f37` |
| `src/styles/glassDatePicker.ts` | added | — | `572e039ec2f6ee998d1b27b9829ae2eff64d147bbe3592fa65fb91dd5caa9508` |
| `src/styles/glassSelect.ts` | added | — | `3eb8b434be5bcfff8ee94bf202c43c943960a2276a25d7694a0a3ecc7c2e75ce` |
| `src/styles/imageryHoverCard.ts` | added | — | `99184d120569736da6510af892f8046352d72171502a62efab4b41f4d337f2c9` |
| `src/styles/imageryLoading.ts` | added | — | `6e2d04019e13d26d12238c648797a6fb6776192389f7e50a0827c28e19cfce3e` |
| `src/styles/infoBox.ts` | added | — | `d3002e5956edfe447a40db5185f21bce1fa18ac76b3cf10bbfca00f8bd65b0e6` |
| `src/styles/mapGraphics.ts` | added | — | `4354925b0e1fc764e4f237baffe8bdcb76ef1f3306276f9ad7d410cd99368ff1` |
| `src/styles/nearbyTools.ts` | added | — | `15b8501f0eabd9a551ff0cd905ecf2664d4b03870be0286962fbeb11cc061302` |
| `src/styles/noteSearch.ts` | added | — | `621f7547469fa6b5cff0df83edd3aefd8644515edb321de4907dc4c0a75fc59a` |
| `src/styles/notesScroll.ts` | added | — | `d76a80ebd3f85d4e53fe470d860044ee4f2be7bd9748b0f38cec4f93bd09163e` |
| `src/styles/pointCloudCalibration.ts` | added | — | `d8a5af610ce40ff920bfecc9951cd2082061e98bb8a8eaf8db1ec130a07abc57` |
| `src/styles/pointCloudControls.ts` | added | — | `71c98731772288b7272282c836ad727ab34a02efea859777f4f13f698c8f47fd` |
| `src/styles/pointCloudElevationLegend.ts` | added | — | `6589e45da525df2d11b654f0ebcd4e12b5b58ea4d810200d91bfb3fa79fca5c1` |
| `src/styles/pointCloudTools.ts` | added | — | `dddd9699bc7328a419fad39acce332bd19e1c308018818632b47db8d06a82627` |
| `src/styles/qualityTools.ts` | added | — | `d6541f9724630f1bee183486d7080570ed9b6f8d4332bcff12c25a465b80d90d` |
| `src/styles/routing.ts` | added | — | `de1378e471140b110f51830a80dec659eacfff2bfe0405459eb5f7c2d4d6e7e2` |
| `src/styles/solarControls.ts` | added | — | `b98352ab1995a7d1946b72e011eb862ec15ec3b5c1e53ed0106d29c95d441b7f` |
| `src/styles/splashScreen.ts` | added | — | `0c20a2d4e9600ecc971e3a51e1b1d3b1f75f81a80c083cdc36310d1efedfd0dd` |
| `src/utils/arcgisRoutingProvider.ts` | added | — | `df0e1b1868ab66806c0026a46f4b94e84126db3466f175ae1cadf8aa08d727c4` |
| `src/utils/constants.ts` | modified | `783680a3022b8da24d07fc540b94ef3db00cbd5f4d079904af41719411b837e5` | `6c115f9b3be405d3c5059e5aa7c253dc87b9c133ee669f22e23ad1da638d4da1` |
| `src/utils/filterBuilder.ts` | modified | `2b21eb0f10fb788cca04d87e3b0d777ed1604033d8008250d63451f5b7daddd6` | `075715fd86e230f0d71377ab4aac052603bddcb8f2716fc2343008c1969e0ea5` |
| `src/utils/geoUtils.ts` | modified | `b604fbd8c9e6f36885d6889d593d09fc9a9013215d76c2e9d70e5cfb9e6f5f92` | `da307701e3497c15a4fb32c3165ab9bb1fbdf189622427d2cbc76301fb78d267` |
| `src/utils/imageAltitude.ts` | added | — | `a5280f5add7dd331531138610beaca6e3b96bd7d27a703ba9d450136d56f4897` |
| `src/utils/organizationFilter.ts` | added | — | `5253bc2ffd3f5be983c9a19b5c5956ec72b7384e1069eecd309767527190e79c` |
| `src/utils/osrmRoutingProvider.ts` | added | — | `f7f053c1e20bee99aa9a5e39c1e5007297b6a421f74e313c7894b9d31ff61a73` |
| `src/utils/pointCloudUtils.ts` | modified | `9d26269ca5f4388f54313bfe536f71fa26931792bae93b2dbc0baf2c0b697a2a` | `2c22924cb4d0c16c24c79737e911ac7905ab1f391c4830d160fb29bf408bd425` |
| `src/utils/routeOptimizer.ts` | added | — | `1701bc39801e5ae61027f52ab2bf28a7cf2184925833f14a9404ca4ee740ec43` |
| `src/utils/routingTypes.ts` | added | — | `f899c6ffb8b5d81af283533c54b208bd42b5eaeff07362f3061b41c67add7d31` |
| `src/utils/styles.ts` | modified | `94256ef15547c95b2060e4739b079dae2f3988290296ac08b3dfb16d74c18023` | `a74bc35cbc15bca2ecd1a3b4bd25ec0b5ed7d0157e1f95edcc0f849593e1ceb1` |
| `src/utils/turboCoverageUtils.ts` | added | — | `07b3bd2daccca78a428c2573318ba29205cd9665997e3338ec36fe59f7165335` |
| `tools/overture_places/places_service.py` | added | — | `842cb37fe9e1032d0ba466bdb394ad9dbcaa5dc1fd8ae478afdd5421aff95dcb` |
| `tools/overture_places/places_store.py` | added | — | `00657c15d3407dc4facbffed17c5346edfe76ea65d4eda5898f7671a2ef2736a` |
| `tools/overture_places/serve_places_local.py` | added | — | `a5f151b52b560ab8fc2972475c108102712a520250569edc6d2234b4c9b3906e` |
| `tools/overture_places/service.example.json` | added | — | `30dfd8a2d4d4dc77b832ddfbb0e8b102f92cde6bb7761d792629f2bce684415a` |
