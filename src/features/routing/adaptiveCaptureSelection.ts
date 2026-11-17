import { CAPTURE_ROUTE_CONFIG } from "../../utils/constants";
import { buildCaptureOpportunities, selectCaptureOpportunities } from "../../utils/routeOptimizer";
import type { CaptureOpportunity, RouteCoordinate, RouteTargetSegment } from "../../utils/routeOptimizer";
import { shouldExpandCaptureCorridor } from "./captureRouteScoring";

type CorridorConfig = Pick<typeof CAPTURE_ROUTE_CONFIG,
  "captureCorridorWidthsMeters" | "corridorWidthMeters" | "maxSelectedOpportunities" |
  "maxFinalStops" | "maxAnchorsPerOpportunity" | "corridorExpansionBudgetUseRatio">;

export interface AdaptiveCaptureSelectionInput {
  targets: RouteTargetSegment[];
  baselineCoordinates: RouteCoordinate[];
  baselineSpeedMetersPerMinute: number;
  spareMinutes: number;
  config: CorridorConfig;
  log: (...args: unknown[]) => void;
}

/** Synchronous local selection only; provider requests and run ownership stay with the widget. */
export function selectAdaptiveCaptureOpportunities({
  targets, baselineCoordinates, baselineSpeedMetersPerMinute, spareMinutes, config, log,
}: AdaptiveCaptureSelectionInput) {
  const corridorWidths = config.captureCorridorWidthsMeters;

  let opportunities: CaptureOpportunity[] = [];

  let selection: ReturnType<typeof selectCaptureOpportunities> | null = null;

  let selectedCorridorWidth: number = corridorWidths[0] ?? config.corridorWidthMeters;

  /*
   * TRY EACH CORRIDOR
   */

  for (let corridorIndex = 0; corridorIndex < corridorWidths.length; corridorIndex++) {
    const corridorWidth = corridorWidths[corridorIndex];

    log(`[CaptureRoute] Evaluating corridor: ` + `${corridorWidth} m`);

    /*
     * BUILD OPPORTUNITIES FOR THIS CORRIDOR
     */

    const currentOpportunities = buildCaptureOpportunities(targets, baselineCoordinates, baselineSpeedMetersPerMinute, corridorWidth);

    log("[CaptureRoute] Active limits:", {
      maxSelectedOpportunities: config.maxSelectedOpportunities,

      maxFinalStops: config.maxFinalStops,

      maxAnchorsPerOpportunity: config.maxAnchorsPerOpportunity,
    });
    /*
     * SELECT OPPORTUNITIES WITHIN USER'S TIME BUDGET
     */

    const currentSelection = selectCaptureOpportunities(currentOpportunities, spareMinutes);

    /*
     * Keep this pass as the current best/final candidate.
     *
     * If we decide to expand, the next iteration replaces these.
     */
    opportunities = currentOpportunities;

    selection = currentSelection;

    selectedCorridorWidth = corridorWidth;

    /*
     * CORRIDOR DIAGNOSTICS
     */

    log(
      `[CaptureRoute] Corridor ${corridorWidth}m: ` +
        `${currentOpportunities.length} opportunities, ` +
        `${currentSelection.opportunities.length} selected, ` +
        `${currentSelection.estimatedExtraMinutes.toFixed(1)} min, ` +
        `stop=${currentSelection.stopReason}`,
    );

    /*
     * SHOULD WE TRY A WIDER CORRIDOR?
     */

    const isLastCorridor = corridorIndex === corridorWidths.length - 1;

    /*
     * Expand ONLY when:
     *
     * - there is another corridor available
     * - selection ran out of useful opportunities
     * - we are still using less than the configured fraction
     *   of the user's spare-time budget
     *
     * Do NOT expand when:
     *
     * - budget already stopped selection
     * - anchor capacity stopped selection
     * - opportunity safety cap stopped selection
     */
    const shouldExpand = shouldExpandCaptureCorridor(isLastCorridor, currentSelection.stopReason,
      currentSelection.estimatedExtraMinutes, spareMinutes, config.corridorExpansionBudgetUseRatio);

    if (!shouldExpand) {
      break;
    }

    /*
     * Diagnostic explaining why another pass is happening.
     */
    const nextCorridorWidth = corridorWidths[corridorIndex + 1];

    log(
      `[CaptureRoute] Expanding capture corridor ` +
        `${corridorWidth}m → ` +
        `${nextCorridorWidth}m ` +
        `(` +
        `${currentSelection.estimatedExtraMinutes.toFixed(1)}/` +
        `${spareMinutes.toFixed(1)} min estimated` +
        `)`,
    );
  }

  /*
   * VALIDATE FINAL ADAPTIVE SELECTION
   */

  if (!selection) {
    throw new Error("Capture opportunity selection failed.");
  }
  return { opportunities, selection, selectedCorridorWidth };
}
