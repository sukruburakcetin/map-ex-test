# Workspace scrolling, local-note selection and content edits

Use the current widget build. Existing backend migration prerequisites still apply; the widget does not run operator SQL automatically.

## Reaching the bottom and editing comfortably

The notes sheet keeps its handle/source tabs fixed and delegates scrolling to its active content instead of maintaining a second outer scroll area. The Workspace viewport has explicit flex/min-height sizing, nonshrinking content, bottom safe-area padding and a stable scrollbar gutter. Save and Cancel share a sticky action row inside the contribution editor, so a long draft does not push them out of reach. Opening an editor moves keyboard focus to its heading.

`styles/notesScroll.ts` scopes thin scrollbars to the notes sheet/picker: transparent track, translucent thumb, stronger hover state and native forced-color behavior. Scrollbars remain usable; they are not hidden. Map/viewer scrollbars outside notes are unchanged.

## Choosing a local note to publish

`LocalNotePicker.tsx` replaces the native dropdown with a searchable radio list and an explicit selection preview. It searches all browser-local notes by category, description, follow-up, status, note ID or image ID. Text is normalized once when the collection/locale changes; literal AND matching is accent-insensitive. There are no service calls while searching this local index.

Only 30 matching choices render initially. Show more local notes adds 30 at a time. Native radios support keyboard selection. Search changes do not silently select another note or clear an existing choice: if the selected note falls outside the search results, its preview stays visible and explains that fact. Clear selection disables publishing until another note is selected. Show local note on map previews the intended target; publication remains a separate explicit action and sends the complete selected note, not its truncated list preview.

This picker concerns browser-local notes only. Community contribution search remains server-side, with the prior 700 ms typing debounce and explicit 50-result paging. Large loaded contribution card trees are retained while typing so search input does not rerender every card for each character.

## Editing a published contribution

Use **Update contribution** to edit description, category, workflow status and **Outcome / follow-up (optional)**. Authors with current contributor rights can edit their own contributions; owners can moderate all contributions. Readers cannot edit. Existing server RLS is authoritative.

The editor holds an independent draft and the initial exact `updated_at` value, including provider submillisecond precision. Save sends a narrowly whitelisted PATCH with that version in the filter. A zero-row response indicates a change or lost access, never a successful save. Failed/conflicting saves keep the draft visible and explain how to cancel, refresh and reopen the latest record. No automatic retry overwrites someone else's edit.

Edits affect the shared contribution only, not its browser-local source copy. Legacy risk, authorship, workspace/source IDs, timestamps, location and image identity are never written by this action. The existing server trigger updates revision time. A successful save refreshes map/list/popup data through the existing authorized-result path.

Location and linked image are read-only in this release. The editor shows their values and explains the replacement workflow: create a new local note at the correct location/image and publish it. This avoids silently moving a published observation or changing its evidence link.

The old `resolution_note` storage/export field is retained for compatibility. Its UI label is now Outcome / follow-up; empty popup rows are omitted. No existing outcomes or risk labels are deleted.

## Contributor map

- `styles/notesScroll.ts`: scoped scrollbar CSS; `FieldNotesPanel.tsx` installs it.
- `LocalNotePicker.tsx`, `localNoteChoices.ts`: bounded local selector and reusable normalized index.
- `WorkspaceContributionEditor.tsx`: draft/version lifecycle and reachable actions.
- `CommunityWorkspacePanel.tsx`: composition, permissions, errors and save intent; retains card elements while typing.
- `communityWorkspace.ts`: typed edit values, validation, exact version filter and narrow PATCH.
- `mapGraphic.ts`: structured popup fields, omitting empty outcomes.

Tests use real React/Chromium fixtures (including 2,001 local records and short controller heights), PostgreSQL/PGlite authorization/version checks, and transport/index tests. They do not deploy a real backend or build Experience Builder. Verify the final scrollbar/keyboard layout in the target browser and controller.

Rolling back widget source does not reverse database migrations or delete shared records. Retain operator backups and a compatible client; do not automatically downgrade schemas or remove data.
