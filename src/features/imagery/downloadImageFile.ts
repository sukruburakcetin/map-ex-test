/** Download the existing 2048px image file; UI state and feedback remain with the widget. */
export async function downloadImageFile(imageId: string, sequenceImages: readonly { id: unknown; captured_at?: number | string | null }[], token: string, graphBase: string): Promise<boolean> {
  const url = `${graphBase}/${imageId}?fields=thumb_2048_url&access_token=${token}`;
  const resp = await fetch(url);
  const data = await resp.json();
  const imageUrl = data.thumb_2048_url;
  if (!imageUrl) return false;

  const imageResp = await fetch(imageUrl);
  const blob = await imageResp.blob();
  const blobUrl = URL.createObjectURL(blob);

  let filename = `mapillary_${imageId}.jpg`;
  const currentImg = sequenceImages.find((img) => img.id === imageId);

  if (currentImg && currentImg.captured_at) {
    const dateStr = new Date(currentImg.captured_at).toISOString().split("T")[0];
    filename = `mapillary_${imageId}_${dateStr}.jpg`;
  }

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
  return true;
}
