# Collaboration workspaces

The Workspace source in Notes lets a team use its own shared backend alongside Local and Enterprise notes. There is no default public workspace service. The [operator kit](../../tools/community-notes/README.md) explains hosting, accounts and database setup.

## Join and explore

Connect to the service supplied by your operator, sign in, and select or join a workspace using the invitation details you received. Choose a workspace display name: it is an unverified label, while the account ID remains the authorization identity.

Readers can inspect shared contributions. Contributors can deliberately publish and maintain their own contributions. Owners manage the project's members, invitations and category definitions. Permission to create a workspace is a separate capability granted by the service operator.

Use contribution search, category controls and paging to explore shared records. Show on map uses the existing note navigation. Export covers loaded records; it is not a database backup. Existing results remain visible during a same-workspace refresh, with pending/error feedback.

## Contribute deliberately

Choose an existing local note or use the direct map-pick contribution flow, review the draft, and explicitly save it. Creating a local draft does not publish it. Shared records are not automatically merged into Local storage. Supported image attachment operations require the configured backend schema; see [operator migrations](../../tools/community-notes/README.md).

Category colors and workflow statuses help organize observations. Optional assessments are contributor opinions, not official certification. Display names do not grant roles or edit rights. See [contribution guidance](../../tools/community-notes/guides/direct-contributions.md), [display names](../../tools/community-notes/guides/display-names.md) and [editing](../../tools/community-notes/guides/note-editing.md).

## Session and service ownership

Tab changes and closing the notes sheet preserve the in-memory session so you can prepare a local draft. Disconnecting or unmounting the widget clears that client session and cancels pending requests. Membership is checked by the service; removing access cannot erase records someone already downloaded.

The operator owns accounts, recovery, invitations, moderation, backups, retention and service support. A widget update does not execute SQL or delete a backend. Validate provider settings, real account roles, HTTPS/CORS and the published mobile/desktop app before use.

## Find contributions

Use **Read contributions** and the search/category controls. Typing briefly waits before searching the service; Enter searches immediately and Clear resets it. Existing results stay visible while the same workspace refreshes, with a waiting/loading message. Results are paged, so use the available paging controls to see more.

Category badges organize observations; the separate status badge shows progress. Color is accompanied by text. Your display name is an unverified label; account permissions still decide what you can edit.

## Publish or edit

**Publish a note** opens a draft for contributors. Select the location, review the details and explicitly publish. If you choose an existing Local note, the searchable picker shows more choices in batches and retains your selected preview while you change the search.

Use **Update contribution** for a published contribution. Authors with current contributor rights can edit their own records; owners can moderate. Save/Cancel remain reachable while the editor scrolls. A conflict keeps your draft so you can refresh and reopen the latest record; it does not silently overwrite another person's edit.

Shared edits do not change the original browser-local note. Location and linked image are read-only in the shared editor. To replace them, create a correctly located new observation and follow your workspace's moderation process for the old one.

## See the map beneath the sheet

Use the notes sheet handle to expand/collapse it. Workspace shortcuts move to the relevant section. Note markers use the same screen-facing style in 2D/3D; selecting a note highlights its location.

For server setup or upgrades, use the [operator guide](../../tools/community-notes/README.md). Viewers do not run SQL migrations.
