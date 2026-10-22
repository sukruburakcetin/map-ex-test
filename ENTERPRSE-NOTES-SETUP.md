
| Name | Type | Length | Purpose |
| --- | --- | --- | --- |
| OBJECTID | Object ID | — | Service-generated identifier; another object ID field name is supported |
| GlobalID | Global ID | — | Generated using the platform's Add Global IDs operation; not an ordinary text field |
| category | Text | 80 | Configured note category |
| note_text | Text | 2000 | Note description |
| source | Text | 32 | manual or mapillary-detection |
| image_id | Text | 64 | Optional Mapillary image identifier; nullable |
| detection_id | Text | 64 | Optional detection identifier; nullable |
| created_at | Date | — | Original local note creation time (client timestamp) |

Add editor tracking using the Enterprise-supported workflow (creator, creation date, last editor and last edit date fields). Editor-tracking dates and identities are authoritative server values; they are different from the imported/local created_at value. Enable Query and Create. GlobalIDs must have their generated unique index, and the service metadata must advertise `supportsApplyEditsWithGlobalIds`; the JavaScript SDK exposes this as `capabilities.editing.supportsGlobalId`. Verify these capabilities for the installed Enterprise version and backing data source. If that capability is unavailable, the app refuses to submit instead of risking duplicate notes. A text field named GlobalID is insufficient.

### Portal settings checklist

Configure these settings on the Field Notes layer before connecting it to the widget. Labels and available controls can differ by Enterprise version.

#### Editing options

| Setting | Recommended value | Reason |
| --- | --- | --- |
| Enable editing | ON | Allows authorized contributors to add notes. |
| Keep track of changes to the data (add, update, delete features) | OFF initially; optional | Change tracking is separate from editor tracking and is not required by this integration. |
| Keep track of who edited the data (editor name, date and time) | ON | Provides server-managed author identity and creation/edit dates. |
| Enable sync | OFF | Offline synchronization is not required for the widget's periodic shared-note refresh. |

In the permitted editing operations, allow **Add**. The original sharing-only workflow does not require Update or Delete. Collaborative status editing requires Update attributes only; Delete remains unnecessary. Allow authorized users to see all shared notes, including their own submissions; reading their own records is required for safe retry lookup. Organization administrators may configure additional operations for their own management workflows.

The `image_id` field is **Text, length 64, nullable**. It stores the associated Mapillary image identifier. Manually placed notes can leave it empty. Store identifiers as text rather than numeric values.

#### Public data collection and sharing

Leave **Approve this layer to be shared with the public when editing is enabled** OFF. In the item's sharing controls, leave **Everyone (public)** unchecked and share with the intended Enterprise group. The approval switch does not replace the item's sharing controls.

**Create view layer** is optional. Use a read-only view when some users should read notes while contributors can add them to the editable layer. Restrict the view to its authorized organization/group, expose the required fields and records, and enter its layer endpoint in the widget's optional read-only URL setting. A public view is not required.

#### Indexes and service options

| Setting | Recommended value | Reason |
| --- | --- | --- |
| Field indexes | Verify the real GlobalID field has a unique index; no additional indexes initially | GlobalID-based edits and retry lookup need the proper GlobalID setup. Add other indexes later only for demonstrated query needs. |
| Spatial indexes | Keep the platform-managed default | A newly created point layer does not need a manual spatial-index rebuild. |
| Response caching | Leave OFF/unavailable initially | It is not required for saving or displaying shared notes. |
| Append | OFF | Bulk append is separate from the widget's individual note submissions through applyEdits. |
| Allow others to export to different formats | OFF unless organization policy permits it | Service export is optional and does not control the widget's local-note export. |

**No indexes found** in the portal's Field indexes panel does not conclusively prove system indexes are missing; some interfaces omit system-managed indexes. Inspect the individual layer's REST metadata for a field of type `esriFieldTypeGlobalID`, its unique index where exposed, and `supportsApplyEditsWithGlobalIds: true`. If index details are not exposed, ask the administrator to verify them through supported Enterprise tools. Creating an ordinary index or a text field called GlobalID does not replace the platform's **Add Global IDs** workflow.

The message **Response caching requires the ArcGIS Data Store Object Store** concerns an optional caching capability. It does not prevent the basic notes integration from working, and you do not need to provision an Object Store solely for this widget. The widget refreshes the shared display nominally every 15 seconds while the page is visible; this does not require Enable sync or response caching.

### Publish and configure step by step

1. In the organization's ArcGIS Pro/Enterprise tools, create the point feature class or hosted feature layer with the fields above. Add real GlobalIDs and enable editor tracking. Publish to the organization's supported Enterprise feature service. Exact publishing menus differ by Enterprise version.
2. Configure server-side editing and ownership rules. Give an authorized contributor group access to Query/Create; allow users to read existing notes and their own submissions so retry lookup works. Use editor-tracking ownership restrictions if updates are enabled. Do not grant anonymous editing. Administrators can manage notes using normal Enterprise tools; the widget adds notes and, with the collaborative status schema, explicitly updates attributes. It never deletes remote notes.
3. Share the layer with the appropriate organization/group, not Everyone. If readers should not have access to the editable item, publish an organization-scoped read-only view/layer exposing the same schema and records, with Query only. This read-only URL is optional. Users must have access to whichever read layer is configured. Use the same record geometry and schema in the view; editor tracking may remain protected.
4. Check the individual layer REST URL, e.g. `https://gis.example.org/server/rest/services/FieldNotes/FeatureServer/0`. Use a numeric layer endpoint, not the service root or portal item page. Inspect metadata for geometryType esriGeometryPoint, the fields, GlobalID support, and Query/Create capabilities. Do not embed tokens or credentials in URLs.
5. Configure Experience Builder to use the organization's portal/authentication, including its approved HTTPS certificates, federated server/SSO and origin access rules. Portal roles and service permissions remain the authority. This change does not store usernames/passwords, invent an OAuth app registration or bypass organization authentication policies.
6. In this widget's **Field Notes Settings**, enable **Enterprise notes layer**, enter the editable layer URL, and optionally the read-only layer/view URL. Save/publish the Experience using the existing deployment workflow. Leave the option off when no layer is available.
7. Open two authorized sessions. Add a local note first, then choose **Share**, or tick **Also share with your organization** when creating a new one. Observe Saving, then Shared. Confirm the second session sees its marker after the next visible-page refresh (nominally 15 seconds, plus server/render latency). Click the marker for its attributes popup.
8. Test denied permissions/offline operation, sign-in, refresh after an interrupted save, and retry. A failed save keeps the local note. A stable GlobalID is stored before submission; retry first queries for that GlobalID and uses GlobalID-based edits. This prevents lost-response retries from inserting duplicate records. If browser storage is unavailable, submission is blocked until the identifier can be durably saved.

The shared Feature Layer is rendered natively by Esri in 2D/3D. Remote notes are not downloaded into widget state or localStorage; the local panel lists this browser's notes, including copies linked to shared records. Other users' notes appear on the map/scene and use a native attributes popup. Refresh is near-real-time polling, not a push feed. Polling pauses when the document is hidden, and view switches/cleanup remove the reader layer and timer. Feature counts and query/render resource use depend on the Enterprise service and visible extent.

Removing a local copy or Clear local never deletes an Enterprise record. In-progress local copies cannot be removed during submission. Shared linkage is preserved through the widget's GeoJSON export/import. If the configured editable URL changes, pending linked notes refuse to submit to a different destination. Turning the option off removes the shared display and preserves all local notes. First-time publishing authentication uses the existing temporary viewpoint recovery; the writer FeatureLayer is separate from the map so resource recreation cannot destroy an in-flight writer.

Local storage quotas, Enterprise authentication, server permissions, service capability support and view filters must be validated in the actual organization. No service is provisioned by this installer. Filter styling is not modified by the installer; the complete-source bundle carries the user's supplied green/34px styling.

### Collaborative status updates (note-workflow update)

Existing deployments can keep their current fields and records. To enable shared-note editing, add these fields to the editable layer and expose them in any read-only view:

Create these as **Text (String)** fields, not numeric fields. Use the exact lowercase field names:

| Field name | Display name (alias) | Portal field type | REST field type | Maximum length | Allow null values | Default value |
| --- | --- | --- | --- | --- | --- | --- |
| `status` | Status | Text / String | `esriFieldTypeString` | **32 characters** | Yes, for compatibility with existing records | `open` |
| `resolution_note` | Resolution note | Text / String | `esriFieldTypeString` | **2000 characters** | Yes | Leave unset (null) |

Both fields must be editable. In the portal's Add field dialog, set **Length** to the values above. Field aliases are optional; the stored field names must match exactly. Add the same fields to the read-only view's exposed field list if you use one.

Configure this coded-value domain (List of values) on `status`:

| Stored value (code) | Display label |
| --- | --- |
| `open` | Open |
| `in_progress` | In progress |
| `completed` | Completed |
| `dismissed` | Dismissed |

The default must be the stored code **`open`**, not the label `Open`. Leave `resolution_note` as free text without a coded-value domain. The widget treats an empty or null resolution note as no explanation. Backfill existing status values with `open` using the organization's supported editing tools; the default applies to new records and does not update existing ones.

Give `status` a coded-value domain with these exact stored values: `open` (Open), `in_progress` (In progress), `completed` (Completed), and `dismissed` (Dismissed). Populate existing records with `open` using your organization's supported data-management tools; setting a field default alone does not backfill old records. Keep both fields editable for authorized contributors. The existing `category` and `note_text` fields must also be editable for the shared editor.

For this update, enable **Add and Update attributes only**. Geometry updates and Delete are not required. Keep editor tracking ON. Administrators decide whether contributors can edit everyone's notes or only their own; designated reviewers can receive broader permissions. The service enforces these rules even if an action appears in the app.

The read-only view must expose the real GlobalID, status, resolution_note and the existing popup fields. Its GlobalID values must match the editable layer. Updates are submitted to the editable URL, never to the read-only view. If the new fields are absent, the existing shared display and note creation continue; shared editing requires the schema upgrade.

In the local notes list, **Edit local / Save locally** changes only the browser's copy. **Update shared / Update shared note** reads the current Enterprise record and submits explicit attribute edits. Other users can click a shared marker and choose **Update note** in its Esri popup. The editor includes category, description, status and an optional resolution note. Shared status changes alter marker colors: Open cyan, In progress amber, Completed green and Dismissed gray. Linked local copies in this browser are refreshed after a confirmed shared update.

Before submission, the app rereads the record and compares its editable attributes and server edit date, when available, against the version opened in the editor. If they changed, it refuses to overwrite and asks the user to cancel and reopen the note. This is a best-effort conflict check, not an atomic server transaction: simultaneous writes after that check remain possible. Strict conflict protection requires an appropriate server workflow. If a network failure leaves the update outcome uncertain, reopen the note to verify its current values before retrying. Failed edits keep the form's entered values visible.

No geometry, author identity, creation timestamp or deletion is submitted by the editor. Server editor tracking records the updater and date. Remote notes remain in the native Feature Layer; the widget does not download the whole shared layer into localStorage. Other visible sessions see updates after the next nominal 15-second refresh plus server latency.

Validate with two authorized accounts: add a note, mark it In progress and Completed, check marker/popup refresh, check editor tracking, attempt an unauthorized update, and open the same note in both sessions to test stale-edit detection. Also test first-login camera recovery and a failed/uncertain update. Local editing, import/export and local removal must continue to work independently.

### Attachments (note-attachments update)

Attachments use the existing Enterprise Feature Layer's attachment storage. **No additional note fields or field lengths are needed.** Keep the GlobalID and note schema above.

1. On the editable Field Notes layer, enable **Attachments** using the layer's supported portal Data/layer controls or ArcGIS Pro **Enable Attachments** workflow. Exact menus depend on the Enterprise version. For registered database data, ask the administrator to enable attachments and expose them through the published feature service using the supported workflow.
2. Verify the individual layer REST metadata reports `hasAttachments: true` and that the SDK advertises `capabilities.data.supportsAttachment`. Confirm attachment queries and upload operations work for the intended contributors. Attachment permissions and ownership restrictions remain server-controlled; enabling attachments does not grant access.
3. If using a read-only view, ensure attachments are available to its authorized readers and that the view exposes the matching real GlobalID. The widget's attachment manager queries and uploads against the configured editable endpoint; an account restricted to the read-only view cannot use this manager unless it can also read the editable record. Native view/popup attachment access remains governed by that view's own permissions.
4. Test with ordinary contributor accounts, not just the layer owner. Verify uploads, download access, permitted file types and service limits. Keep public editing approval OFF and sharing restricted to the intended Enterprise groups. Attachments inherit the service's security and retention rules.

After sharing a note, select **Attachments** in its local list row or in the shared marker's popup. Choose a document/picture to upload it immediately, or select **Attach current image** to fetch the Mapillary photo currently selected when the button is clicked. The photo is stored at up to 2048 pixels with its image ID in the filename. It is the original photo, not a screenshot containing the current viewing angle, AI outlines or UI. Preserve the original Mapillary image provenance and applicable attribution when redistributing imagery.

The client limit is **20 MB per file**; the service may impose a smaller size limit or restrict file types. Uploads require access to the existing shared note. Local drafts show a reminder to share first: attachments are not stored in localStorage or included in local GeoJSON exports. Existing attachments can be downloaded through the organization's authenticated ArcGIS request flow. The widget does not delete attachments or automatically replace them.

If upload fails or its outcome is uncertain, close and reopen the attachment manager to check the list before uploading again. There is no automatic upload retry, because a connection error can occur after the server has committed the file. A failed upload does not delete or undo the field note.

### Field Notes visibility and placement marker

The map/scene layer list now contains a **Field Notes** group with **Local notes** and **Enterprise field notes** children when those layers are available. Toggle the parent group's eye to hide/show all saved field-note markers together. Child eyes control each source separately. Redrawing local notes does not force the group visible, and its hidden state is retained through a view rebuild during the running session. Map-layer visibility affects the map/scene; the Mapillary viewer's existing local annotations remain a separate display.

The temporary yellow placement marker uses a single screen-projected element and smooth frame animation instead of replacing an ArcGIS symbol every 50 ms. It follows the clicked location in 2D/3D, hides when the Field Notes group is hidden, and is removed on Save, Cancel, view switch or teardown. It introduces no extra feature layer.

Deployment checks: enable attachments, share a note, upload a picture/document, attach a selected sequence photo, verify its filename/image ID, and download using another authorized account. Test denied upload permission, oversized files, missing attachment capability and uncertain uploads. Toggle the Field Notes parent eye and each child eye; verify redraws and view changes do not unexpectedly reveal saved markers. Verify the placement marker remains stable in 2D and 3D while opening/canceling/saving a note.
