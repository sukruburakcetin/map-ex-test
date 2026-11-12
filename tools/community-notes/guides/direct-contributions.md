# Direct workspace contributions and observation titles

## Operator upgrade

1. Run `tools/community-notes/migrations/005-direct-contributions.sql` in the existing Supabase project after migration 004. It adds an optional title column/default and includes titles in the authorized contribution search RPC. Existing notes/versions/authors/categories/risks remain unchanged.
2. Build and deploy the current widget source, then reload the application. Database migrations are separate operator operations.
3. Owners and contributors use **Create contribution** in Workspace actions. Readers have no creation action. Test both 2D and 3D in the target Experience Builder deployment.

New projects can use the updated full `schema.sql` once. Do not run the fresh schema over an existing project. No CJS installer executes backend SQL or deploys the application.

## Main creation flow

Create contribution opens a workspace draft. Choose location on map temporarily hides the notes sheet while retaining the draft/session. A visible cancel banner and Escape return to the form without losing text. One valid map click returns the chosen WGS84 coordinates; it does not create a local note, select coverage, open imagery, update route points or publish anything. Coordinates get click-ripple feedback. Invalid/unprojectable clicks leave picking active. View replacement, widget cleanup, tab/notes closure, disconnect and draft unmount cancel pending intent.

Enter an observation title (up to 160 characters), select an active owner-defined workspace category and add a description (up to 8,000 characters). Explicit Publish contribution creates the shared record with the signed-in author ID and Open status. Builder categories and access to Builder settings are not required. No local copy is saved automatically.

If a Mapillary image is currently open, attaching it is optional and unchecked by default. The image is attached only by an explicit checkbox selection; its selected ID is retained visibly until cleared. It is never inferred from proximity or silently switched when the viewer changes images. Attach it only if it shows the selected location. Ground markers/category colors use the existing workspace rendering path.

A stable per-draft source ID prevents duplicate records across submission retries. If a response is lost after the server commits, retry checks the persisted row against the intended observation instead of overwriting it. A different persisted version produces an error and leaves the draft intact for review. Cancellation/success resets the draft; cancelling an unconfirmed submission does not delete a possibly published server record. Refresh before starting another draft if the first submission's outcome is uncertain.

On successful direct publication, search text is cleared and the results section is focused/refreshed so the new observation can be found. The mine-only preference is retained. There is no automatic background publication or polling.

## Title versus category, and retained local workflow

Category is a workspace-owner taxonomy/assigned color. Title is the contributor's observation heading. Cards, map popup headings, map result metadata, exports and server search include titles. Older records have a blank title and use their existing category as the fallback heading; there is no invented title migration. Update contribution can add/edit a title alongside description, status/category and follow-up using the existing version conflict filter. An existing title can be cleared to return to the category fallback.

Publish a local draft remains a secondary workspace action. It retains the searchable local picker, explicitly assigns a workspace category, and now asks for a title before publication. Changing that shared title/category does not modify the local source note. Existing Local and Enterprise annotation entry/editing workflows continue to use their existing Builder configuration.

## Contributor entry points

- `WorkspaceContributionDraft.tsx`: draft fields, location selection, explicit image attachment, stable submission identity, cancel/reset.
- `WorkspaceLocationPicker.ts`: tiny one-shot intent owner; no SDK/auth/service dependency.
- `FieldNotesPanel.tsx`: sheet hiding, visible pick banner, Escape/unmount cancellation and draft retention.
- `runtime/widget.tsx`: small SDK map adapters, click/hover gates only while explicit picking is active, and cleanup integration. Normal coverage/annotation/route dispatch remains unchanged while inactive.
- `communityWorkspace.ts`: title-aware publication/edit/validation and duplicate-confirmation reads.
- `WorkspaceContributionCard.tsx`, `WorkspaceContributionEditor.tsx`, `mapGraphic.ts`: headings/editing/popup mapping.
- Migration 005: title column/grants and membership/alias-aware search. Existing RLS and active-category validation remain authoritative; no author, role, identity or timestamp-write grants are added.

Workspace feature siblings have distinct keys so category/profile/draft controls retain stable identity. Legacy click regression fixtures were aligned with the note owner's existing highlight/pick interface and select the hover-cancellation prelude by statement content rather than a stale statement count.

## Validation and rollback

Actual PostgreSQL/PGlite tests cover additive migration/repeat safety, title search, writer/reader permissions, category/title constraints, duplicate source keys, author edits and legacy title-less insertion. React/Chromium fixtures create from an empty Local collection, test cancel/Escape, explicitly attach an image, retry a committed-but-failed response without duplication, and verify title edits/exports. The real map intent/request/click adapters are exercised with recording SDK objects; the existing hover/click suite checks inactive behavior. A live Experience Builder/provider deployment still needs operator verification.

Rolling back widget source does not reverse database migrations or delete shared records. Retain operator backups and a compatible client; do not automatically downgrade schemas or remove data.
