import { validateNoteAttachmentFile } from "./attachmentFiles";

type AttachmentWriter = Pick<__esri.FeatureLayer,
  "load" | "capabilities" | "fields" | "objectIdField" |
  "queryFeatures" | "addAttachment" | "queryAttachments">;

interface AttachmentTarget {
  globalId: string;
  objectId: number;
}

/** Execute one user-authorized upload against the note captured by the attachment panel. */
export async function uploadEnterpriseNoteAttachment(
  layer: AttachmentWriter,
  target: AttachmentTarget,
  prepareFile: () => File | undefined | Promise<File | undefined>,
) {
  await layer.load();
  if (!layer.capabilities?.data?.supportsAttachment) {
    throw new Error("Attachments are not enabled on this layer.");
  }

  const file = await prepareFile();
  validateNoteAttachmentFile(file);
  const field = layer.fields.find(item => item.type === "global-id")?.name;
  if (!field) throw new Error("The layer is missing its GlobalID field.");

  const found = await layer.queryFeatures({
    where: `${field} = '${target.globalId}'`,
    outFields: [layer.objectIdField],
    returnGeometry: false,
    num: 1,
  });
  const feature = found.features[0];
  if (!feature || feature.attributes[layer.objectIdField] !== target.objectId) {
    throw new Error("The note changed or is no longer accessible. Reopen attachments.");
  }

  const form = new FormData();
  form.append("attachment", file, file.name);
  // A lost response may follow a committed upload. The caller must never retry automatically.
  const result = await layer.addAttachment(feature, form);
  if (!result || result.error) {
    throw new Error(result?.error?.message || "The layer did not confirm the attachment.");
  }

  const attachments = await layer.queryAttachments({ objectIds: [target.objectId] });
  return attachments[target.objectId] || [];
}
