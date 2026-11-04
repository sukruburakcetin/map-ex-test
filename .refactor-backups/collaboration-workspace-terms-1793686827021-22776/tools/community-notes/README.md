# Teacher-owned workspace setup

This is a bring-your-own-service kit, not a hosted Mapillary Explorer community service. The teacher, school or organization owns the Supabase project and its provider relationship. No Esri Enterprise account or Experience Builder settings access is needed by workspace users. Mapillary supplies imagery through the widget's existing integration; it does not receive or moderate this workspace's submitted notes through this kit.

## Who operates what

| Party | Responsibility in this design |
| --- | --- |
| Teacher/school as service operator | Provider account, billing, provisioning accounts, data retention/deletion, backups, access, moderation, participant support and any required notices/consent |
| Workspace owner (trusted teacher) | Project instructions, invitations, membership/roles, reviewing/removing shared notes and exports |
| Contributor | Explicitly choose a local draft and publish it; maintain own assessments |
| Reader | View shared notes and open their map/image targets |
| Widget developer / Mapillary team | No default workspace backend, global directory, account provisioning, project moderation or service-operation promise is created by this kit |

An ownership boundary is an engineering arrangement, not a promise of zero legal responsibility. Operators must follow applicable provider/imagery terms and their own organizational requirements. Do not describe peer opinions as official railway risk classifications, or describe Mapillary as sponsoring/moderating the project.

## 1. Create the operator's backend

1. The teacher/school creates a Supabase project in its own account. Choose the appropriate region and a suitable provider plan/quotas. Do not use the widget developer's account.
2. Open that project's SQL editor and run `schema.sql` once. It creates only the `mly_*` workspace tables/functions and authenticated policies. Do not disable row-level security. Re-running the initial schema is not an upgrade procedure; it will fail and roll back rather than replace data.
3. Keep public signups disabled for this invitation-only first version. Provision the teacher/student accounts under **Authentication → Users** using the operator's own process. Email/password accounts must be enabled and confirmed according to the provider's settings. Account recovery and participant help belong to the operator; the widget does not register users or send invitations by email.
4. In the SQL editor, grant a specific existing teacher account the trusted creation flag (replace the example email):

       update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"workspace_teacher":true}'::jsonb
       where email = 'teacher@example.org';

   Grant this only to teachers allowed to create workspaces. Do not put it in user-editable `user_metadata`. Students cannot set the trusted flag through this widget. Sign in again after changing account metadata so the UI sees the updated flag; the database checks current trusted metadata independently.
5. Copy the **project origin URL** and its **publishable key** (or legacy `anon` key). Never share a secret key, `service_role` key, database password or access/refresh token. The browser rejects privileged key types.

The kit does not create any cloud service or send messages when downloaded or installed. All provisioning above is an operator action. The included SQL is scoped to a new project/schema installation; review it before applying it to a project with other applications.

## 2. Teacher uses the running demo

1. Open **Notes → Workspace**. This tab is available without Builder settings and without enabling ArcGIS Enterprise notes.
2. Enter the operator's project URL/public key. Confirm that you recognize and choose that service, then Connect. Connection configuration alone sends no request; sign-in makes the first service request.
3. Sign in using the operator-provisioned teacher account. Credentials and auth tokens remain in the mounted panel's memory; they are not written to localStorage/sessionStorage, URLs, invitations or exports. No refresh token is retained. Switching tabs or closing the notes sheet keeps the in-memory connection so you can place local drafts. Use Disconnect before leaving a shared device. Disconnect or actual widget/page unmount forgets the session; reconnect/sign in after provider expiry. Hiding the panel is not signing out.
4. Open **Create or join a workspace**, provide a name and operator contact, and create the class project. Both database creation and owner-only operations are enforced on the service.
5. Open **Manage invitations and members**. Choose Reader or Contributor and a maximum number of joins, then create a seven-day invitation. The UI produces selectable JSON invitation details containing the public connection details and an expiring join code. Share it through your own classroom channel together with account instructions and operator contact. There is no automated email, global invitation directory, QR code or share-link service in this first version.
6. Refresh invitations/members to see their current state. Revoke unused invitations; remove members or make them read-only as needed. These actions take effect in server policies, not just button visibility. The first version displays up to 100 members/invitations; manage larger cohorts through the operator's backend until paged administration is added.

## 3. Students join and contribute

1. In **Notes → Workspace**, paste the invitation into **Have an invitation?** and use its connection details. Inspect the destination and explicitly confirm the operator; invitation text does not automatically connect or authenticate.
2. Sign in using the account supplied by the operator, then use the prefilled invitation code under **Create or join a workspace → Join workspace**.
3. Create observations with the existing Local notes workflow. In the workspace tab, choose **Publish a local note**, select one note and optionally a risk opinion, then Publish. Only the selected text/category/position/image ID/status/opinion is submitted. Images, attachments, unrelated local notes and Esri/Mapillary credentials are not uploaded. The local copy remains unchanged.
4. Risk opinion and workflow status are separate. `Completed` can coexist with `High risk`. `No obvious hazards observed` is an observation label, not a claim of no risk.
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
- No file attachments, full edit history, automatic backups, account registration/recovery, shared place registry, accident-statistics integration or guided two-sided railway slideshow is included yet. This is the private collaboration foundation.

Removing the widget feature does not delete the operator's database. Backend retirement and data deletion must be performed by the operator after an appropriate backup/retention review. No destructive database uninstaller is included.

## Validate before inviting a class

Use at least two accounts: a teacher and a student. Confirm an unrelated third account cannot read the workspace; a Reader cannot publish; a Contributor cannot edit another author's note; revoked invitations fail; and a removed member loses access. Check account recovery, rate limits, backups, host CORS/CSP and a real provider session. The supplied tests run SQL against an embedded PostgreSQL engine and browser requests against controlled service fixtures; they are not a certification of a deployed Supabase project.
