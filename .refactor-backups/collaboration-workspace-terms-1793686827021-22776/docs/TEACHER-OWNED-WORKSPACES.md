# Teacher-owned workspace foundation

## Outcome

Notes now has an optional **Workspace** source available in the running widget, without Builder settings or an Esri Enterprise account. Its service is supplied and operated by the teacher/school, not by the widget developer or Mapillary. The existing Local/Enterprise note sources remain separate.

The first release supports an explicitly chosen Supabase project, operator-provisioned sign-in, trusted teacher workspace creation, expiring Reader/Contributor invitations, membership/role management, deliberate publication of one local note, paged shared records, independent risk/workflow assessments, owner moderation, map/image focus and loaded-record export. No shared service, operator account, credentials, directory or proxy is bundled.

## Boundary and data handling

- The component is lazy-mounted; merely using the notes panel makes no workspace-service request.
- A user must supply the project origin/public key, recognize that operator and explicitly connect/sign in. An invitation only prefills connection details; it does not authenticate or upload anything.
- Only publishable/anon browser keys are accepted. Auth sessions stay in component memory, with no cookies, localStorage/sessionStorage, refresh-token retention, automatic polling or write retries.
- Publish sends only the selected local note's fields plus the signed-in author/workspace and optional risk opinion. No imagery, attachments, other local notes or ArcGIS/Mapillary credentials are uploaded. The local draft is retained.
- Supabase RLS/column permissions and atomic RPCs enforce membership, authorship, teacher creation rights, invitation limits and moderation. UI visibility is not authorization. Teacher rights come from operator-managed auth app metadata, not an editable user profile.
- Shared notes are not merged into local persistence or drawn as a new global marker layer. Show on map uses the existing note-focus callback. The backend records update timestamps independently of browser input.
- Disconnect or actual widget/page unmount aborts current requests and forgets credentials. Tab changes and closing the notes sheet preserve the in-memory session for local-draft creation; they do not sign out. Access tokens may remain valid at the provider until expiry; membership checks still run on subsequent service operations. Removing access cannot erase data already downloaded.

This architecture avoids adding a developer/Mapillary-operated notes service; it is not a guarantee of zero legal responsibility. Operator obligations and applicable provider/imagery terms still apply. Risk labels are peer observations, not official safety certification.

## Install

From the widget root outside `src`:

    node apply-teacher-owned-workspaces.cjs --dry-run
    node apply-teacher-owned-workspaces.cjs

Rebuild/reload Experience Builder. The new tab does not deploy SQL, create cloud accounts, send emails or connect to a default service. The standalone widget uninstaller restores this feature's files only and leaves the teacher's backend/data untouched.

Give the teacher `teacher-owned-workspace-kit.zip`, containing `README.md` and `schema.sql`. Follow that guide in a project owned by the teacher/school. It covers provider setup, account provisioning, the trusted teacher flag, public keys, project invitation sharing, operational duties, limits and retirement. No privileged key is needed in the widget.

## Scope of the foundation

Workspace-specific copy uses English fallback through the existing presentation layer. Accounts/recovery are operator-managed. Invitations are shareable JSON details, not automated emails/QR codes. Member/invitation administration shows up to 100 records, workspace selection up to 50, and notes page by 50. Large deployments need paged administration. Export includes loaded notes only. Participant account IDs can be mapped through the operator's own authentication dashboard; a profile/roster UI is not included.

No public anonymous contribution, global directory, attachments, full edit history, backup service, accident-statistics import, shared crossing registry or guided two-sided slideshow is included. Those are follow-up features, not hidden dependencies of this delivery. See `tools/community-notes/README.md` for the complete operator boundary.

## Verification

- PostgreSQL/PGlite suite: 21 checks, including authenticated teacher creation, untrusted profile escalation, nonmember/reader/author isolation, cross-workspace writes, duplicate publication, invite limits/revocation and member removal.
- Client suite: 12 checks for explicit connections, public-key validation, selected-origin transport, no ambient cookies/redirects, session expiry/disposal, invitation contents and explicit narrow publication.
- Real React/Chromium fixture: 21 checks covering the actual notes-panel tabs and teacher/student flows, no requests before sign-in, no browser auth persistence, session retention across local-draft tab/sheet changes, explicit publication/local retention, assessment update, invitation joining, reader controls, keyboard navigation, compact width, interoperable GeoJSON export, Enterprise preservation and optional-chunk failure isolation.
- New source passes strict React/TypeScript checking against controlled host declarations. This is not a complete Experience Builder/SDK build.

Tests use an embedded PostgreSQL engine and controlled HTTP responses. No live Supabase project was deployed or certified. The operator must validate the actual provider configuration, real accounts, CORS/CSP, invitation and retention flows before classroom use. Existing unrelated legacy note-clear fixture failures remain documented in NOTES-SEARCH.md.
