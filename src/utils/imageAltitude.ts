/** Keep camera height sources distinct. Missing metadata is never sea-level zero. */
export interface ImageAltitude {
  computedAltitude?: number;
  reportedAltitude?: number;
  /** Compatibility value for other features; profile curves use explicit sources. */
  alt?: number;
  heightDataVersion?: number;
}
export function finiteAltitude(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
export function imageAltitudeFields(value: { computed_altitude?: unknown; altitude?: unknown }): ImageAltitude {
  const computedAltitude = finiteAltitude(value.computed_altitude);
  const reportedAltitude = finiteAltitude(value.altitude);
  return { computedAltitude, reportedAltitude, alt: computedAltitude ?? reportedAltitude, heightDataVersion: 2 };
}
