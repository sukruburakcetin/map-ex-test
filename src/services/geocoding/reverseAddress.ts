/** Reverse-address enrichment through the existing ArcGIS geocoding endpoint. */
import { GEOCODE_URL } from '../../utils/constants';

/**
 * Resolve the existing display-address fragment for WGS84 latitude/longitude.
 * Apply the second non-empty comma-separated label part, or the full label.
 * Preserve missing-address/error text, logging and single-fetch behavior.
 * @param applyAddress Runtime-owned UI update, invoked within the existing error boundary.
 */
export async function fetchReverseAddress(lat: number, lon: number, applyAddress: (address: string) => void, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return;
    try {
      const response = await fetch(`${GEOCODE_URL}?location=${lon},${lat}&distance=100&f=json`, { signal });
      if (signal?.aborted) return;
      const data = await response.json();
      if (signal?.aborted) return;
      const fullAddress = data.address?.LongLabel || "Address not found";
      const addressParts = fullAddress.split(", ").filter((part: string) => part.trim());
      const secondPart = addressParts[1] || fullAddress;
      applyAddress(secondPart);
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Reverse geocode error:", error);
      applyAddress("Failed to fetch address");
    }
  }
