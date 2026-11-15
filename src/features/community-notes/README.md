# Collaboration workspaces

This feature has no built-in service endpoint, telemetry, service account or shared developer database. `CommunityWorkspacePanel.tsx` is lazy-mounted from the notes panel. It owns transient UI/auth lifetime; disconnecting or actual widget/page unmount aborts requests and forgets session state; tab changes and hiding the sheet retain the memory-only session for local-draft creation. Local notes are read-only inputs until an explicit Publish action.

- `communityWorkspace.ts`: public-key/origin validation, session-only authenticated REST transport, invitation parsing and narrow API methods. No ambient cookies, Esri credentials, automatic writes, persisted sessions, refresh tokens or redirect following.
- `WorkspaceBoundary.tsx`: isolate optional chunk/render failures without crashing Local/Enterprise notes; no service or telemetry access.
- `CommunityWorkspacePanel.tsx`: owner/participant connection and workspace flows, explicit publication, independent risk/workflow fields, member/invite moderation and loaded-record export. Connection generation guards prevent obsolete task results from committing.
- `../../styles/communityWorkspace.ts`: compact scrollable UI, separate from runtime.
- `../../../tools/community-notes/schema.sql`: operator-installed tables, RLS, column privileges and atomic invitation RPCs. Authenticated app users cannot directly insert membership rows or change author/workspace identity. The service checks operator-managed `workspace_creator` app metadata for creation rights.
- `../../../tools/community-notes/README.md`: setup, ownership, operating limits and retirement boundary.

Authorization must stay server-enforced. UI button visibility alone is not a permission boundary. The helper filenames have distinct case-insensitive stems to avoid the earlier TS/TSX resolution collision. New workspace UI copy uses existing `owned` English fallback; full translations are not yet included.

Run `tests/communityWorkspaceClient.test.cjs` with TypeScript available, `tests/communityWorkspaceDatabase.test.cjs` with PGlite installed, and `tests/communityWorkspace.browser.cjs` with Playwright/Chromium/React UMD fixtures. Use `MAPILLARY_TYPESCRIPT`, `MAPILLARY_PGLITE`, `MAPILLARY_PLAYWRIGHT`, `CHROMIUM_PATH`, `REACT_UMD_PATH`, `REACT_DOM_UMD_PATH` for nonstandard dependency paths. No test contacts a real service. Deploying the SQL requires a separate operator action and real-provider validation.

Creation is a trusted capability distinct from project roles. Existing operators upgrade with `tools/community-notes/migrations/002-collaboration-creator.sql`; client fallback for the trusted legacy key is intentional and never reads user-editable metadata. The original educator-specific SQL is frozen only in a migration test fixture.

## General contribution discovery

Migration 003 adds owner-defined, colored categories and exact workspace queries/statistics. `useWorkspaceContributions.ts` owns independent, abortable read generations and 700 ms server-search debounce. `WorkspaceCategoryEditor.tsx` and `WorkspaceContributionTools.tsx` keep taxonomy and discovery UI separate from auth/member/write orchestration. The panel sends authorized loaded results through `onMapNotes` to the existing map owner; credentials never cross that callback. All loaded authors are drawn automatically. Map/list paging is explicit (50 records), with accurate full-workspace totals and matching counts. Existing risks are legacy read-only data in the UI; normal assignments use owner categories.

See `tools/community-notes/guides/contributions.md` for installation, semantics, limits and the complete contributor map. Refresh is explicit; this does not add polling or ambient service traffic. Category authorization/retirement and statistics membership remain server-enforced.

See `docs/user-guide/workspace-readability.md` for consistent screen-facing 3D icons, stable search results, category badges and task navigation.

## Local selection and full contribution text edits

`LocalNotePicker.tsx` renders local choices in batches of 30 and searches the complete normalized index in `localNoteChoices.ts` without service requests. `WorkspaceContributionEditor.tsx` owns an unsaved content draft and initial version. The parent/client save only description, follow-up, category and status through existing RLS, with an exact `updated_at` filter; conflicts keep the draft. Native coordinates/image identity and legacy risk are untouched. The panel retains the contribution card element tree during typing, and `styles/notesScroll.ts` styles only the notes scroll areas. See `tools/community-notes/guides/note-editing.md` for behavior, limits and rollout.

## Workspace display names

Migration 004 adds `mly_workspace_profiles`, self-only alias writes, atomic named join/create wrappers and alias joins in existing contribution pages. `WorkspaceDisplayNameEditor.tsx` provides explicit profile management for owners and members. Names are unverified, scoped to a workspace and paired with short ID tags; all roles, card keys, note ownership, filters and writes remain UUID-based. Existing note versions never change when an alias changes. The profile setter accepts no target user ID, authenticated direct profile writes are forbidden, and current membership controls reads/renames. No per-hover/card profile requests or email disclosure. See `tools/community-notes/guides/display-names.md` for upgrade/retention/rollback guidance and tests.

## Direct creation and titles

Migration 005 separates observation titles from workspace category assignments. `WorkspaceContributionDraft.tsx` owns an unsaved, per-workspace direct draft and stable retry identity. `WorkspaceLocationPicker.ts` owns one-shot map intent; the notes panel exposes the map temporarily and cancels cleanly, while runtime supplies only SDK coordinates/cursor/ripple adapters. Publication remains explicit, UUID-authorized and duplicate-safe. Local publication stays available as a secondary path with a workspace title/category. Legacy blank titles fall back to category headings. See `tools/community-notes/guides/direct-contributions.md` for operator rollout, limits, code map and rollback.
