import type { buildPreflightLegDiagnostics } from "./preflightDiagnostics";

type PreflightLeg = ReturnType<typeof buildPreflightLegDiagnostics>["preflightLegs"][number];

/** Main gate consumes rounded diagnostics; trial-probe checks intentionally use raw values. */
export function classifyPreflightQuality(preflightLegs: readonly PreflightLeg[], budgetFits: boolean) {
  const pathologicalInternalLegs = preflightLegs.filter(leg =>
    leg.fromOwner !== "START" && leg.fromOwner !== "END" && leg.fromOwner !== "UNKNOWN" &&
    leg.fromOwner === leg.toOwner && leg.directMeters <= 450 && leg.durationMinutes >= 4.5,
  );
  const networkQualityFits = pathologicalInternalLegs.length === 0;
  const qualityCleanupMode = budgetFits && !networkQualityFits;
  const pathologicalOwnerIds = new Set<string>();
  for (const leg of pathologicalInternalLegs) {
    pathologicalOwnerIds.add(leg.fromOwner);
    pathologicalOwnerIds.add(leg.toOwner);
  }
  return { pathologicalInternalLegs, networkQualityFits, qualityCleanupMode, pathologicalOwnerIds };
}

/** Classify rounded main-preflight snaps; UNKNOWN remains eligible for hard rejection. */
export function classifyPreflightSnaps(
  snapDiagnostics: readonly { stopIndex: number; owner: string; snapDistanceMeters: number }[],
  hardSnapRejectMeters: number,
) {
  const badSnapDiagnostics = snapDiagnostics.filter(item => item.snapDistanceMeters > 40);
  const hardBadSnapOwners = new Set(
    snapDiagnostics.filter(item => item.snapDistanceMeters > hardSnapRejectMeters)
      .map(item => item.owner).filter(owner => owner !== "START" && owner !== "END"),
  );
  return { badSnapDiagnostics, hardBadSnapOwners };
}
