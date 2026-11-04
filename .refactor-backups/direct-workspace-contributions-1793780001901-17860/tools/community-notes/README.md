# Collaboration workspace setup

This is a bring-your-own-service kit, not a hosted Mapillary Explorer community service. The team, community or organization owns the Supabase project and its provider relationship. No Esri Enterprise account or Experience Builder settings access is needed by workspace users. Mapillary supplies imagery through the widget's existing integration; it does not receive or moderate this workspace's submitted notes through this kit.

## Who operates what

| Party | Responsibility in this design |
| --- | --- |
| Service operator | Provider account, billing, provisioning accounts, data retention/deletion, backups, access, moderation, participant support and any required notices/consent |
| Authorized workspace creator | May create projects when the operator grants the trusted `workspace_creator` capability; this does not grant backend administration |
| Workspace owner | Project instructions, invitations, membership/roles, reviewing/removing shared notes and exports |
| Contributor | Explicitly choose a local draft and publish it; maintain own assessments |
| Reader | View shared notes and open their map/image targets |
| Widget developer / Mapillary team | No default workspace backend, global directory, account provisioning, project moderation or service-operation promise is created by this kit |

An ownership boundary is an engineering arrangement, not a promise of zero legal responsibility. Operators must follow applicable provider/imagery terms and their own organizational requirements. Treat assessments as contributor observations rather than official certifications. Do not describe Mapillary as sponsoring or moderating a project.

## Upgrade an existing installation

1. Apply the compatible collaboration terminology widget update and rebuild/reload first.
2. In the existing operator project, run `migrations/002-collaboration-creator.sql` once as project administrator. It preserves workspace/note/member data, migrates the trusted legacy `workspace_teacher` capability only when no `workspace_creator` decision already exists, and removes the legacy key. An explicit `workspace_creator=false` remains false.
3. Reconnect/sign in to receive updated app metadata. The client accepts the old trusted capability while an operator schedules migration, but the new key takes precedence, including explicit denial. User-editable profile metadata never grants rights.
4. Do not rerun `schema.sql` over existing tables. That file is for fresh projects; the migration can be repeated safely.

A workspace creator is authorized to start projects; Owner, Contributor and Reader are roles within a particular project. Creating a project does not grant service-administrator access.

## 1. Create the operator's backend

1. The service operator creates a Supabase project in its own account. Choose the appropriate region and a suitable provider plan/quotas. Do not use the widget developer's account.
2. Open that project's SQL editor and run `schema.sql` once. It creates only the `mly_*` workspace tables/functions and authenticated policies. Do not disable row-level security. Re-running the initial schema is not an upgrade procedure; it will fail and roll back rather than replace data.
3. Keep public signups disabled for this invitation-only first version. Provision the workspace-creator and participant accounts under **Authentication → Users** using the operator's own process. Email/password accounts must be enabled and confirmed according to the provider's settings. Account recovery and participant help belong to the operator; the widget does not register users or send invitations by email.
4. In the SQL editor, grant a specific existing workspace-creator account the trusted creation flag (replace the example email):

       update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"workspace_creator":true}'::jsonb
       where email = 'creator@example.org';

   Grant this only to accounts allowed to create workspaces. Do not put it in user-editable `user_metadata`. Participants cannot set the trusted flag through this widget. Sign in again after changing account metadata so the UI sees the updated flag; the database checks current trusted metadata independently.
5. Copy the **project origin URL** and its **publishable key** (or legacy `anon` key). Never share a secret key, `service_role` key, database password or access/refresh token. The browser rejects privileged key types.

The kit does not create any cloud service or send messages when downloaded or installed. All provisioning above is an operator action. The included SQL is scoped to a new project/schema installation; review it before applying it to a project with other applications.

## 2. Workspace creators use the running widget

1. Open **Notes → Workspaces**. This tab is available without Builder settings and without enabling ArcGIS Enterprise notes.
2. Enter the operator's project URL/public key. Confirm that you recognize and choose that service, then Connect. Connection configuration alone sends no request; sign-in makes the first service request.
3. Sign in using the operator-provisioned workspace-creator account. Credentials and auth tokens remain in the mounted panel's memory; they are not written to localStorage/sessionStorage, URLs, invitations or exports. No refresh token is retained. Switching tabs or closing the notes sheet keeps the in-memory connection so you can place local drafts. Use Disconnect before leaving a shared device. Disconnect or actual widget/page unmount forgets the session; reconnect/sign in after provider expiry. Hiding the panel is not signing out.
4. Open **Create or join a workspace**, provide a name and operator contact, and create the collaboration project. Both database creation and owner-only operations are enforced on the service.
5. Open **Manage invitations and members**. Choose Reader or Contributor and a maximum number of joins, then create a seven-day invitation. The UI produces selectable JSON invitation details containing the public connection details and an expiring join code. Share it through your own team or community channel together with account instructions and operator contact. There is no automated email, global invitation directory, QR code or share-link service in this first version.
6. Refresh invitations/members to see their current state. Revoke unused invitations; remove members or make them read-only as needed. These actions take effect in server policies, not just button visibility. The first version displays up to 100 members/invitations; manage larger cohorts through the operator's backend until paged administration is added.

## 3. Participants join and contribute

1. In **Notes → Workspaces**, paste the invitation into **Have an invitation?** and use its connection details. Inspect the destination and explicitly confirm the operator; invitation text does not automatically connect or authenticate.
2. Sign in using the account supplied by the operator, then use the prefilled invitation code under **Create or join a workspace → Join workspace**.
3. Create observations with the existing Local notes workflow. In the workspace tab, choose **Publish a local note**, select one note and optionally a risk opinion, then Publish. Only the selected text/category/position/image ID/status/opinion is submitted. Images, attachments, unrelated local notes and Esri/Mapillary credentials are not uploaded. The local copy remains unchanged.
4. Risk assessment is optional: leave its disclosure closed for general collaboration notes. Unassessed records do not show an empty risk row. Risk opinion and workflow status are separate. `Completed` can coexist with `High risk`. `No obvious hazards observed` is an observation label, not a claim of no risk.
5. Contributors can update their own assessments and remove their own submissions. Owners can moderate/remove shared notes; readers can only view/focus/export records. A stable `(workspace, author, local-note ID)` key prevents a retried publication from creating a second copy or overwriting an existing assessment. Different contributors can retain separate opinions at the same location.

Refresh and Load more are explicit; no background polling or synchronization loop is installed. Shared records are not silently merged into Local/Enterprise collections. Show on map reuses the existing note-focus action. This version does not draw a new global workspace coverage layer or automatically load all shared markers.

## Operation and limits

- Removing membership does not delete an authentication account or its previously submitted records. The operator must decide retention and account-deletion/anonymization procedures; foreign-key constraints intentionally prevent accidental account deletion while records still reference it.
- The operator must maintain backups and test export/deletion procedures. **Export loaded notes** exports only currently loaded pages, not a complete database backup. GeoJSON keeps map/image/workflow fields compatible with Local import and includes workspace/author/risk metadata for external review; Local import does not restore workspace membership or the separate risk-assessment controls.
- All shared reads require membership/sign-in; there is no anonymous public contribution or public browsing in this version.
- Notes are paged in groups of 50. The first workspace list is limited to 50; member/invitation administration shows the first 100. Larger deployments should use the operator's backend administration or extend pagination before rollout.
- Invitations expire after seven days, have bounded use counts and store only a token hash on the service. Revoke them to block future joins. Removing a member blocks subsequent service reads/writes, but cannot erase copies they already downloaded or prevent access through a different still-valid invitation; revoke those invitations as well.
- The provider's JWT access tokens may remain valid until expiry even after a local disconnect. The widget forgets them and aborts its own requests; RLS membership checks still run on every operation. Account suspension, password recovery and incident response remain provider/operator tasks.
- No automatic retries are made for writes. If a response is lost, Refresh first. The UI checks returned rows before confirming an update/deletion, and publication is idempotent for a given local-note ID.
- The origin must be HTTPS, host the standard `/auth/v1` and `/rest/v1` routes, permit the viewer's CORS requests, and be allowed by the demo host's Content Security Policy. No developer-operated proxy is provided to bypass those policies.
- Workspace-specific new copy currently uses English fallback through the existing presentation layer. Local/Enterprise localization remains intact. Full workspace translations are a follow-up before a multilingual rollout.
- No file attachments, full edit history, automatic backups, account registration/recovery, shared place registry, domain-specific assessment templates or guided imagery-review workflows is included yet. This is the private collaboration foundation.

Removing the widget feature does not delete the operator's database. Backend retirement and data deletion must be performed by the operator after an appropriate backup/retention review. No destructive database uninstaller is included.

## Validate before inviting participants

Use at least two accounts: a workspace creator and a contributor. Confirm an unrelated third account cannot read the workspace; a Reader cannot publish; a Contributor cannot edit another author's note; revoked invitations fail; and a removed member loses access. Check account recovery, rate limits, backups, host CORS/CSP and a real provider session. The supplied tests run SQL against an embedded PostgreSQL engine and browser requests against controlled service fixtures; they are not a certification of a deployed Supabase project.

The widget uninstaller restores local files only; it does not reverse a backend migration. After migrating the capability key, keep a compatible widget version. A rollback to the older educator-specific client may no longer show workspace-creation controls after sign-in. Review provider backups and version compatibility before any manual backend rollback; no automatic downgrade or data deletion is included.

## Upgrade 003: general workspace contributions

Existing projects run `migrations/003-workspace-contributions.sql` manually after 002. It preserves existing notes, category names, risks, authors and invites; seeds colored definitions from existing categories; adds owner-only category management and membership-protected search/statistics. New projects use the updated full schema once. Apply the matching widget contribution update and rebuild. No backend migration is run by a widget installer.

See `docs/WORKSPACE-CONTRIBUTIONS.md` for testing and operator guidance. Loaded results/maps page by 50; full-workspace totals and search come from the service. New assignments use active owner-defined categories, not predefined risk options. UI rollback keeps the additive backend rules in place; it does not remove data or constraints.

## Upgrade 004: workspace display names

Run `migrations/004-workspace-display-names.sql` manually after 003, then install/rebuild the matching widget update. Existing members choose their alias in the workspace; new joins/creation collect one atomically. The updated fresh schema already includes 004. Alias rows are operator-managed display data; immutable author IDs and role authorization stay unchanged. Removing membership revokes access but keeps historical display labels; operator retention/account-deletion procedures should account for the profile table. See `docs/WORKSPACE-DISPLAY-NAMES.md` for complete rollout and rollback behavior.
