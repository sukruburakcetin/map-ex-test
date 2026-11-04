# Workspace display names

Display names are workspace-specific, self-managed, **unverified aliases**. Supabase user IDs remain the permanent author and authorization identity. Names never grant a role or affect which records a member may edit.

## Existing operator project

1. In your Supabase SQL Editor, run `tools/community-notes/migrations/004-workspace-display-names.sql` after migration 003. The migration is additive and safe to repeat. It does not rewrite any existing notes, membership roles, authors, invitations or note edit versions.
2. Apply `apply-workspace-display-names.cjs` from the widget root, outside `src`, after the invitation/member spacing update. Rebuild and reload the demo.
3. Existing owners and members open a workspace and use **Your workspace display name → Save display name**. No invitation or new account is needed for existing members.
4. New workspace creation asks the owner for a display name. New invitation joins ask the participant for a display name. Those actions save membership/creation and the alias atomically; an invalid name cannot consume an invitation.
5. Use two browser sessions to verify names on cards, native map popups and the owner-managed member list. Test identical aliases for different accounts, then rename one and refresh the other session. Verify that only the real owner/author can edit a contribution.

For a fresh operator project, use the updated full `schema.sql` once; it includes extensions 003 and 004. Do not run the fresh schema over an existing project. The CJS installer never executes SQL or connects to a service.

## Meaning and scope

- Names are 1–60 Unicode characters, with surrounding whitespace trimmed by the client. Control characters and bidi override/isolation characters are rejected. Names may be duplicated.
- A short ID tag accompanies every label to distinguish duplicate aliases. It is a visual cue; the full UUID remains the record key and is available in member technical details and GeoJSON exports.
- Owners, contributors and readers can update only their own alias in a workspace. Owners do not receive a client action to impersonate/rename another user.
- A person may choose a different alias in each workspace. Names are never inferred from email or editable auth profile metadata, and no email is added to cards/popups/exports.
- New and old contributions resolve the author's current workspace alias. A rename changes display joins, not `author_id`, note `updated_at`, category, risk, role, or ownership. Existing unnamed users retain short-ID labels until they opt in.
- Member-list access remains as before: owners see up to 100 member rows and participants can query their own row. Profiles themselves are display information readable by current workspace members, including historical author aliases; there is no anonymous/global name directory.
- Removing membership blocks future project reads/renames. The last alias is retained for historical contributions. Operator-admin deletion/redaction and account-retirement procedures should include `mly_workspace_profiles`, along with the existing note/member data and the operator's retention policy.
- The owner's profile does not require or insert a fake member row. The normal owner role still comes from `mly_workspaces.owner_id`.

Each authorized contribution page resolves its own author names server-side and returns the current user's alias. There is no name request per card, map hover or image. The roster also joins names on the service. Refresh notes obtains other members' latest aliases; no polling, central profile service, developer database or extra provider dependency is added.

## Contributor map

- `communityWorkspace.ts`: name validation/formatting, named join/create wrappers, profile setter, roster read and map metadata. Update bodies never accept a target user ID for alias changes.
- `WorkspaceDisplayNameEditor.tsx`: explicit self-profile form, save/cancel and unverified-name explanation.
- `CommunityWorkspacePanel.tsx`: owner/join prompts and shared display-name composition; existing role/author permission checks remain ID-based.
- `WorkspaceContributionCard.tsx` and `mapGraphic.ts`: human-readable alias/ID labels. Full author UUIDs remain in data/export attributes.
- `mly_workspace_profiles`: one row per workspace/user; no direct authenticated table write grants. The setter derives user identity from `auth.uid()` and checks current membership/ownership.
- Migration 004: atomic named join/create wrappers, RLS-scoped roster and contribution-name joins. Legacy RPCs remain available for rollback/backward compatibility.

## Validation and rollback

PostgreSQL/PGlite tests cover additive migration/repeat safety, duplicate names, independent project aliases, anonymous/nonmember denial, self-only writes, reader behavior, invalid invitation names, Unicode, trusted owner creation, unchanged note versions/authorship, and access revocation. React/Chromium fixtures cover name prompts, rename propagation, duplicate-name ID tags, role preservation and owner roster labels. Client and recording map tests cover narrow transport/data adaptation.

No real Supabase deployment or full Experience Builder SDK build is executed here. Verify the final deployment in the target provider/browser after running the operator migration.

`uninstall-workspace-display-names.cjs` restores exact pre-install source. It intentionally leaves profiles and the additive database migration in place. Legacy join/create/list behavior continues to work with the upgraded backend. Never delete aliases, identities or notes automatically as part of a UI rollback.
