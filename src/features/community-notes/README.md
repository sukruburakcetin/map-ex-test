# Teacher-owned community notes

This feature has no built-in service endpoint, telemetry, service account or shared developer database. `CommunityWorkspacePanel.tsx` is lazy-mounted from the notes panel. It owns transient UI/auth lifetime; disconnecting or actual widget/page unmount aborts requests and forgets session state; tab changes and hiding the sheet retain the memory-only session for local-draft creation. Local notes are read-only inputs until an explicit Publish action.

- `communityWorkspace.ts`: public-key/origin validation, session-only authenticated REST transport, invitation parsing and narrow API methods. No ambient cookies, Esri credentials, automatic writes, persisted sessions, refresh tokens or redirect following.
- `WorkspaceBoundary.tsx`: isolate optional chunk/render failures without crashing Local/Enterprise notes; no service or telemetry access.
- `CommunityWorkspacePanel.tsx`: teacher/student connection and workspace flows, explicit publication, independent risk/workflow fields, member/invite moderation and loaded-record export. Connection generation guards prevent obsolete task results from committing.
- `../../styles/communityWorkspace.ts`: compact scrollable UI, separate from runtime.
- `../../../tools/community-notes/schema.sql`: operator-installed tables, RLS, column privileges and atomic invitation RPCs. Authenticated app users cannot directly insert membership rows or change author/workspace identity. The service checks operator-managed teacher app metadata for creation rights.
- `../../../tools/community-notes/README.md`: setup, ownership, operating limits and retirement boundary.

Authorization must stay server-enforced. UI button visibility alone is not a permission boundary. The helper filenames have distinct case-insensitive stems to avoid the earlier TS/TSX resolution collision. New workspace UI copy uses existing `owned` English fallback; full translations are not yet included.

Run `tests/communityWorkspaceClient.test.cjs` with TypeScript available, `tests/communityWorkspaceDatabase.test.cjs` with PGlite installed, and `tests/communityWorkspace.browser.cjs` with Playwright/Chromium/React UMD fixtures. Use `MAPILLARY_TYPESCRIPT`, `MAPILLARY_PGLITE`, `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`, `REACT_UMD_PATH`, `REACT_DOM_UMD_PATH` for nonstandard dependency paths. No test contacts a real service. Deploying the SQL requires a separate operator action and real-provider validation.
