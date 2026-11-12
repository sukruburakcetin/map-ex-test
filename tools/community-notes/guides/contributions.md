# Workspace contributions: categories, discovery and map display

This update draws every **loaded matching contribution**, regardless of author, as soon as a member opens a workspace. It replaces the earlier navigation-only map integration. Native ArcGIS selection/popup behavior and the expandable notes sheet remain. Workspace data stays in memory; nothing is added to Local notes or published automatically.

## Existing operator project: installation

1. Keep the provider's normal backup before schema changes. In the Supabase SQL Editor, run `tools/community-notes/migrations/003-workspace-contributions.sql`. It is additive and safe to rerun. Apply migration 002 first if upgrading the original teacher-specific backend.
2. Build and deploy the current widget source, then reload the application. Database migrations are separate operator operations.
3. Sign in as workspace owner. Open **Manage workspace categories**, enter a category name/color and save. Existing categories are seeded from existing note assignments, with their original names; their initial color is orange. Define your own taxonomy for the project.
4. Contributors choose a **Contribution category** when publishing a selected local note. This does not change the local copy. Use **Update contribution** to change a shared category/status. The owner can moderate every contribution; contributors can update their own.
5. Test with a separate contributor account: open the same workspace, confirm other authors' loaded markers appear before Show on map, search, toggle Only my contributions, load more, inspect the native popup and map legend. Test 2D/3D and narrow widget-controller dimensions.

For a new operator project, use the updated full `schema.sql` once. It already includes extension 003. Never run the fresh schema over an existing project.

## Meaning of categories, results and statistics

Categories are owner-defined names with hex colors, not a predefined risk assessment. Colors match map diamonds, card borders, category statistics and the host ArcGIS legend. Names are stable assignments: saving an existing name changes its color; a different name creates another category. Retiring prevents new assignments while preserving historical records and colors. Restore explicitly when needed. Up to 50 new category names per workspace are supported; historical migration data is preserved even if it already exceeds that limit. The server enforces owner rights and valid active assignments.

Older risk labels remain in storage/export and appear as **Legacy risk assessment**. New publication does not set a risk label. Updating category/status retains any existing legacy label. Workflow status remains independent of category.

**Total contributions**, **My contributions**, **Contributors**, and category/status counts cover the entire authorized workspace. Contributors means distinct authors who have published, including the owner. These totals do not change meaning when filters are active. The matching count reflects the current search/mine filter.

Search is a literal case-insensitive substring across category, description, workflow status values and resolution. It runs on the service, including records outside the loaded page. Typing is debounced 700 ms with composition-aware input and Enter to search immediately; retired reads are aborted and late responses cannot replace current results. Only my contributions is also server-filtered.

Results load 50 at a time. The map and list show the same loaded matching records, not an invisible cap presented as the workspace total. **Load more notes** adds the remaining matching pages. Exact totals and a loaded/matching message explain the distinction. Export includes the loaded matching records. Refresh notes retrieves updates from other members; this release does not add real-time polling or background synchronization.

Native popups show category, status, description, resolution, workspace, contributor ID and last update, with legacy assessment only when present. Contributor IDs are provider UUIDs, not names or email addresses. The provider has no public profile/roster feature in this release.

Disconnect, workspace changes, result replacement and unmount clear obsolete map state. Hiding the notes sheet retains the explicit memory-only connection and map results. No service credentials enter map layers, popups, local storage, exports or legend properties. The Enterprise refresh banner is hidden for Workspaces because it describes a different source.

## Contributor map and validation

- `communityWorkspace.ts`: transport, validated contribution-page RPC, category mutation and map-target adaptation.
- `useWorkspaceContributions.ts`: debounced search, pagination, aborts and result ownership. Independent of serialized writes/member management.
- `WorkspaceCategoryEditor.tsx`: owner taxonomy editing; UI is not an authorization boundary.
- `WorkspaceContributionTools.tsx`: exact totals, filter controls and explicit loaded scope.
- `FieldNoteMap.ts`: transient workspace graphics, native selection and view/result revisions.
- `mapGraphic.ts`: category colors and structured popup field descriptors.
- `MapSymbolLegend.ts`: empty renderer-only legend keys; no duplicate contribution geometry.
- Migration 003: category RLS, owner RPC, active-assignment trigger and SECURITY INVOKER query/statistics RPC.

Targeted tests use actual PostgreSQL through PGlite, React/Chromium service fixtures, and recording ArcGIS objects. No real service deployment or full Experience Builder build is performed here. Live provider/SDK checks remain part of operator testing.

Rolling back widget source does not reverse database migrations or delete shared records. Retain operator backups and a compatible client; do not automatically downgrade schemas or remove data.

See `docs/user-guide/workspace-readability.md` for consistent screen-facing 3D icons, stable search results, category badges and task navigation.
