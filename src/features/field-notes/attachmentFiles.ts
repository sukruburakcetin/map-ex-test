/** Attachment file preparation only; Enterprise identity, permissions, uploads and UI lifetime remain runtime-owned. */
export type AttachmentThumbnailLoader = (imageId: string) => Promise<{ thumb_2048_url?: string }>;
export type AttachmentImageFetcher = (url: string) => Promise<{ ok: boolean; blob: () => Promise<Blob> }>;

/**
 * Fetch the captured image ID's 2048px thumbnail and create the existing named PNG/JPG attachment.
 * Use caller-supplied metadata/auth transport and image fetch; neither request is retried here.
 * Reject missing selection, unavailable metadata, failed download or non-image content in the existing order.
 * The caller applies size validation afterward; this helper never uploads or stores the file.
 */
export async function prepareCurrentImageAttachment(imageId: string | null | undefined, loadThumbnail: AttachmentThumbnailLoader, fetchImage: AttachmentImageFetcher): Promise<File> {
  if (!imageId) throw new Error("Select a sequence image first.");
  const metadata = await loadThumbnail(imageId);
  if (!metadata.thumb_2048_url) throw new Error("The current image is unavailable. Choose another image or upload a file.");
  const response = await fetchImage(metadata.thumb_2048_url);
  if (!response.ok) throw new Error("Could not download the current image.");
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("The downloaded file is not an image.");
  return new File([blob], `mapillary_${imageId}.${blob.type === "image/png" ? "png" : "jpg"}`, { type: blob.type });
}

/** Reject empty or oversized files; preserve the existing inclusive 20 MiB client limit and error text. */
export function validateNoteAttachmentFile(file: File | undefined): asserts file is File {
  if (!file || file.size === 0) throw new Error("Choose a non-empty file.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Choose a file smaller than 20 MB. The Enterprise service may enforce a lower limit.");
}
