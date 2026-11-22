/** Ordered routing execution: provider awaits/checks, optimization, publication and finalization. */

import { prepareCaptureTrial } from "./captureTrialPlan";
import { evaluateFinalCaptureRoute } from "./captureRouteEvaluation";





import { chooseCaptureReplacementProbe, type CaptureReplacementProbe } from "./replacementProbeComparison";
import { classifyPreflightQuality, classifyPreflightSnaps } from "./preflightQuality";
import { reportCaptureRouteCoverage } from "./captureCoverageReport";
import { selectFinalCaptureRoute } from "./finalCaptureSelection";
import { buildCaptureRouteData } from "./captureRouteData";
import { CaptureSolveHistory } from "./CaptureSolveHistory";
import { planAdaptiveNetworkRemoval } from "./adaptiveNetworkRemoval";
import {
  chooseNetworkBudgetProbe, chooseProgressBudgetProbe, chooseFittingBudgetProbe,
  type NetworkBudgetProbe, type ProgressBudgetProbe, type FittingBudgetProbe,
} from "./budgetProbeComparison";
import { scoreCaptureNetworkPenalties } from "./captureNetworkPenalties";
import { rankCaptureReplacementPairs } from "./replacementPairRanking";
import { hasBrokenTrialOpportunity } from "./trialPreflightQuality";
import { buildPreflightSnapDiagnostics, buildPreflightLegDiagnostics } from "./preflightDiagnostics";
import { planPreflightBatchPruning } from "./preflightBatchPruning";
import { planFinalSolveBatchPruning } from "./finalSolveBatchPruning";
import { prepareCaptureRoute, type CaptureRoutePreparationHost } from "./captureRoutePreparation";
import { captureStopOwners } from './captureRouteScoring';

import { buildFinalRouteStops } from "../../utils/routeOptimizer";
import type { CaptureOpportunity } from "../../utils/routeOptimizer";
import type { RoutingResult, RoutingProvider } from "../../utils/routingTypes";

import type { CAPTURE_ROUTE_CONFIG } from '../../utils/constants';
import type { RouteRun } from './RouteGeneration';
import type { RoutingCoordinate } from '../../utils/routingTypes';

/** Per-run routing inputs; provider signals and generation ownership are unchanged. */
export interface CaptureRouteExecutionInput { startPt: RoutingCoordinate; endPt: RoutingCoordinate; spareMinutes: number; run: RouteRun; }

/** Routing-only integration boundary: no widget state, DOM or SDK objects are exposed. */
export interface CaptureRouteExecutionHost {
 createProvider(): Promise<RoutingProvider>;
 config(): typeof CAPTURE_ROUTE_CONFIG;
 preparation: CaptureRoutePreparationHost;
 coverageInput(): { coverageSegments: number; coverageTiers: { fresh: number; aging: number; stale: number; none: number } | null };
 progress(usedMinutes: number, budgetMinutes: number): void;
 log(...args: unknown[]): void;
 warn(...args: unknown[]): void;
 consoleWarn(...args: unknown[]): void;
 restoreCamera(current: () => boolean): Promise<unknown>;
 draw(paths: RoutingCoordinate[][], current: () => boolean): Promise<void>;
 publish(data: ReturnType<typeof buildCaptureRouteData>): void;
 ready(extraMinutes: number, usefulKilometers: number): void;
 error(error: unknown): void;
 retainLoginWindow(): void;
 finish(run: RouteRun): void;
}

/** Execute one owned run; retain ordered provider awaits/checks and always delegate finalization. */
export async function executeCaptureRoute({ startPt, endPt, spareMinutes, run }: CaptureRouteExecutionInput, host: CaptureRouteExecutionHost): Promise<void> {
try {
      /*
       * Resolve routing authentication ONCE.
       *
       * The provider may change from portal → API key
       * if AUTO fallback is required during baseline solve.
       */
      const routingProvider = await host.createProvider();
      run.check();

      /*
       * Helpers
       */

      host.progress(0, spareMinutes);

      host.log("[CaptureRoute] Solving baseline A → B...");

      host.log("[CaptureRoute] Test input:", {
        start: startPt,
        end: endPt,

        spareMinutes,

        ...host.coverageInput(),
      });

      const baselineRoute = await routingProvider.solve({
        signal: run.signal,
        stops: [startPt, endPt],

        preserveStopOrder: true,

        preserveEndpoints: true,
      });
      run.check();

      /*
       * The optimizer no longer needs to know how
       * ArcGIS represented these values internally.
       */
      await host.restoreCamera(run.current);
      run.check();

      const prepared = prepareCaptureRoute(baselineRoute, spareMinutes, host.preparation);
      if (!prepared) return;
      const { baselineMinutes, baselinePaths, opportunities, selection, selectedCorridorWidth } = prepared;

      let activeOpportunities = [...selection.opportunities];

      /*
       * Full candidate pool from the selected corridor.
       *
       * Some opportunities may be removed by OSRM preflight.
       * Once we have a valid route, we can cheaply test whether
       * replacing a retained low-value opportunity with one of
       * these excluded opportunities improves capture value.
       */
      const replacementCandidatePool = [...opportunities];

      /*
       * Never re-add opportunities proven intrinsically unsafe,
       * such as badly snapped anchors or broken same-opportunity
       * traversal.
       */
      const permanentlyRejectedOpportunityIds = new Set<string>();

      let osrmReplacementPassesUsed = 0;

      const maxOsrmReplacementPasses = 2;

      /*
       * Diagnostic helper.
       *
       * Mirrors buildFinalRouteStops() so every accepted
       * capture stop can be traced back to the opportunity
       * that created it.
       *
       * IMPORTANT:
       * Keep this in sync with buildFinalRouteStops().
       */
      const buildCaptureStopOwners = (opportunities: CaptureOpportunity[]): string[] =>
        captureStopOwners(opportunities, host.config().maxFinalStops);

      let finalRoute: RoutingResult | null = null;

      let finalRouteOpportunities: CaptureOpportunity[] = [];

      /*
       * BEST ACTUAL ROUTE SEEN
       *
       * A retry after pruning SHOULD normally be shorter.
       *
       * But road-network topology can occasionally make a later
       * waypoint set produce a worse route.
       *
       * Keep the best actual ArcGIS result as a safety fallback.
       */
      const captureSolveHistory = new CaptureSolveHistory<RoutingResult, CaptureOpportunity>();





      let finalAttemptCount = 0;

      for (let attempt = 0; attempt < host.config().maxFinalRouteSolves; attempt++) {
        finalAttemptCount++;
        /*
         * Build stops from the CURRENT set of opportunities.
         *
         * If the previous real ArcGIS solve exceeded the budget,
         * the opportunity set may have been batch-pruned before
         * reaching this attempt.
         */

        let captureStops = buildFinalRouteStops(activeOpportunities);

        let captureStopOwners = buildCaptureStopOwners(activeOpportunities);

        if (!captureStops.length) {
          finalRoute = null;
          break;
        }

        /*
         * --------------------------------------------------------
         * OSRM PREFLIGHT PRUNING
         * --------------------------------------------------------
         *
         * OSRM can reveal pathological ordered waypoint transitions
         * before we spend one of our authoritative route solves.
         *
         * Example:
         *   25 m direct
         *   3.6 km routed
         *
         * If the complete ordered preflight is already far above
         * the user's spare-time budget, remove low-value /
         * high-cost opportunities first and rebuild the stops.
         *
         * This does NOT consume a final route solve.
         */
        if (routingProvider.preflightOrderedStops) {
          const maxPreflightPrunePasses = Math.min(12, Math.max(1, activeOpportunities.length - 1));
          const hardSnapRejectMeters = 60;

          let lastPreflightExtraMinutes: number | null = null;

          for (let preflightPass = 0; preflightPass < maxPreflightPrunePasses; preflightPass++) {
            const preflightStops: [number, number][] = [startPt, ...captureStops, endPt];

            const preflight = await routingProvider.preflightOrderedStops(preflightStops, run.signal);
            run.check();
            const snapDiagnostics = buildPreflightSnapDiagnostics(
              preflight.waypointSnapDistancesMeters, preflightStops.length, captureStopOwners,
            );

            const { badSnapDiagnostics, hardBadSnapOwners } = classifyPreflightSnaps(snapDiagnostics, hardSnapRejectMeters);

            if (badSnapDiagnostics.length) {
              host.log("[CaptureRoute] OSRM capture anchors snapping >40m:\n" + JSON.stringify(badSnapDiagnostics, null, 2));
            }

            if (hardBadSnapOwners.size) {
              for (const owner of hardBadSnapOwners) {
                permanentlyRejectedOpportunityIds.add(owner);
              }
              host.log("[CaptureRoute] OSRM removing badly snapped opportunities: " + Array.from(hardBadSnapOwners).join(", "));

              activeOpportunities = activeOpportunities.filter((opportunity) => !hardBadSnapOwners.has(opportunity.id));

              captureStops = buildFinalRouteStops(activeOpportunities);

              captureStopOwners = buildCaptureStopOwners(activeOpportunities);

              if (!captureStops.length) {
                break;
              }

              /*
               * Re-run preflight with the cleaned
               * stop set before doing network
               * penalty analysis.
               */
              continue;
            }

            const projectedExtraMinutes = preflight.durationMinutes - baselineMinutes;

            lastPreflightExtraMinutes = projectedExtraMinutes;

            const { preflightLegs, worstPreflightLegs } = buildPreflightLegDiagnostics(
              preflight.legDurationMinutes, preflightStops, captureStopOwners,
            );

            host.log(
              `[CaptureRoute] OSRM preflight ${preflightPass + 1}: ` + `${preflight.durationMinutes.toFixed(1)} min total / ` + `${projectedExtraMinutes.toFixed(1)} min extra`,
            );

            host.log("[CaptureRoute] OSRM preflight worst legs:\n" + JSON.stringify(worstPreflightLegs, null, 2));

            const preflightTolerance = host.config().finalBudgetToleranceMinutes ?? 0.25;

            const budgetFits = projectedExtraMinutes <= spareMinutes + preflightTolerance;

            const { pathologicalInternalLegs, networkQualityFits, qualityCleanupMode, pathologicalOwnerIds } = classifyPreflightQuality(
              preflightLegs, budgetFits,
            );
            host.log("[CaptureRoute] SAME-OWNER quality guard active");

            if (pathologicalInternalLegs.length) {
              host.log("[CaptureRoute] OSRM pathological internal legs:\n" + JSON.stringify(pathologicalInternalLegs, null, 2));
            }

            if (budgetFits && networkQualityFits) {
              /*
               * --------------------------------------------------------
               * NETWORK-AWARE REPLACEMENT
               * --------------------------------------------------------
               *
               * We already have a valid route.
               *
               * Before accepting it, try a few one-for-one replacements:
               *
               *   remove retained opportunity A
               *   add excluded opportunity B
               *   restore baselinePosition order
               *   ask OSRM Table
               *
               * We never scramble the A -> B ordering.
               */
              if (osrmReplacementPassesUsed < maxOsrmReplacementPasses) {
                const allowedExtraMinutes = spareMinutes + preflightTolerance;

                const probePairs = rankCaptureReplacementPairs({
                  activeOpportunities, replacementCandidatePool, permanentlyRejectedOpportunityIds,
                  maxFinalStops: host.config().maxFinalStops,
                });

                let bestReplacement: CaptureReplacementProbe | null = null;

                for (const pair of probePairs) {
                  /*
                   * Replace exactly one opportunity and restore
                   * monotonic A -> B baseline ordering.
                   */
                  const { trialOpportunities, trialCaptureOwners, trialStops } = prepareCaptureTrial({
                    activeOpportunities, removeId: pair.remove.id, add: pair.add,
                    startPt, endPt, maxFinalStops: host.config().maxFinalStops,
                  });

                  const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops, run.signal);
                  run.check();

                  const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                  /*
                   * Reject newly introduced >60 m snapping.
                   */
                  const trialHasBadSnap = (trialPreflight.waypointSnapDistancesMeters ?? []).some(
                    (snapMeters, index) => index > 0 && index < trialStops.length - 1 && snapMeters > hardSnapRejectMeters,
                  );

                  /*
                   * Reject broken full-road traversal.
                   *
                   * Same rule as the normal quality gate:
                   * the failure must occur INSIDE one opportunity.
                   */
                  const trialHasBrokenOpportunity = hasBrokenTrialOpportunity(
                    trialPreflight.legDurationMinutes, trialStops, trialCaptureOwners,
                  );

                  const trialFits = trialExtraMinutes <= allowedExtraMinutes;

                  host.log(
                    `[CaptureRoute] OSRM replacement probe: ` +
                    `remove ${pair.remove.id} / ` +
                    `add ${pair.add.id} → ` +
                    `${trialExtraMinutes.toFixed(1)} min extra · ` +
                    `weighted value +${pair.valueGain.toFixed(0)} · ` +
                    `snap=${trialHasBadSnap ? "bad" : "ok"} · ` +
                    `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                  );

                  /*
                   * If the added opportunity itself introduces an
                   * intrinsic hard failure, stop considering it later.
                   *
                   * The existing active route was already clean, so a
                   * newly appearing hard snap / same-owner failure is
                   * strong evidence against the added opportunity.
                   */
                  if (trialHasBadSnap || trialHasBrokenOpportunity) {
                    permanentlyRejectedOpportunityIds.add(pair.add.id);

                    continue;
                  }

                  if (!trialFits) {
                    continue;
                  }

                  bestReplacement = chooseCaptureReplacementProbe(
                    bestReplacement, pair, trialOpportunities, trialExtraMinutes,
                  );
                }

                if (bestReplacement) {
                  host.log(
                    `[CaptureRoute] OSRM chosen replacement: ` +
                    `remove ${bestReplacement.removeId} / ` +
                    `add ${bestReplacement.addId} → ` +
                    `${bestReplacement.extraMinutes.toFixed(1)} min extra · ` +
                    `value +${bestReplacement.valueGain.toFixed(0)}`,
                  );

                  activeOpportunities = bestReplacement.opportunities;

                  captureStops = buildFinalRouteStops(activeOpportunities);

                  captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                  osrmReplacementPassesUsed++;

                  /*
                   * The replacement trial itself was already validated,
                   * but rerun the normal preflight loop so all diagnostics
                   * and subsequent replacement decisions use the new set.
                   */
                  lastPreflightExtraMinutes = bestReplacement.extraMinutes;

                  continue;
                }
              }

              /*
               * Fits budget, full-road quality is good,
               * and no better replacement was found.
               */
              break;
            }

            /*
             * Nothing useful left to prune.
             */
            if (activeOpportunities.length <= 1) {
              break;
            }

            /*
             * --------------------------------------------------------
             * OSRM NETWORK-AWARE PRUNING
             * --------------------------------------------------------
             *
             * Prefer removing opportunities that participate in
             * unusually expensive OSRM legs.
             *
             * This runs BEFORE the generic value/time pruning below.
             */

            const { networkPruneCandidates } = scoreCaptureNetworkPenalties({
              preflightLegs, activeOpportunities, spareMinutes, qualityCleanupMode, pathologicalOwnerIds,
            });

            /*
             * Do not batch-delete a dozen opportunities.
             *
             * Remove at most two network offenders, then ask OSRM
             * again because topology changes non-linearly.
             */
            if (networkPruneCandidates.length) {
              const allowedExtraMinutes = spareMinutes + preflightTolerance;

              const overrunRatio = projectedExtraMinutes / Math.max(1, allowedExtraMinutes);
              /*
               * --------------------------------------------------------
               * NEAR-BUDGET SURGICAL PRUNING
               * --------------------------------------------------------
               *
               * When we're only slightly over budget, deleting the single
               * highest-penalty opportunity can cause a huge non-linear
               * topology collapse.
               *
               * Instead, cheaply probe several one-opportunity removals
               * with OSRM Table and choose the candidate that lands closest
               * to the budget without introducing a broken same-opportunity
               * traversal.
               */
              const budgetOverrunMinutes = projectedExtraMinutes - allowedExtraMinutes;

              if (budgetOverrunMinutes > 0 && budgetOverrunMinutes <= 5 && networkPruneCandidates.length > 1) {
                const probeCandidates = networkPruneCandidates.slice(0, Math.min(5, networkPruneCandidates.length));

                let bestProbe: NetworkBudgetProbe | null = null;

                for (const probeCandidate of probeCandidates) {
                  if (activeOpportunities.length <= 1) {
                    break;
                  }

                  const { trialOpportunities, trialCaptureOwners, trialStops } = prepareCaptureTrial({
                    activeOpportunities, removeId: probeCandidate.opportunity.id,
                    startPt, endPt, maxFinalStops: host.config().maxFinalStops,
                  });

                  const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops, run.signal);
                  run.check();

                  const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                  /*
                   * Reject a trial if one selected opportunity
                   * still contains an absurd internal traversal.
                   */
                  const trialHasBrokenOpportunity = hasBrokenTrialOpportunity(
                    trialPreflight.legDurationMinutes, trialStops, trialCaptureOwners,
                  );

                  const trialFits = trialExtraMinutes <= allowedExtraMinutes;

                  host.log(
                    `[CaptureRoute] OSRM near-budget probe: ` +
                    `remove ${probeCandidate.opportunity.id} → ` +
                    `${trialExtraMinutes.toFixed(1)} min extra · ` +
                    `weighted value lost=${probeCandidate.opportunity.valueMeters.toFixed(0)}m · ` +
                    `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                  );

                  if (!trialFits || trialHasBrokenOpportunity) {
                    continue;
                  }

                  bestProbe = chooseNetworkBudgetProbe(
                    bestProbe, probeCandidate.opportunity.id, trialExtraMinutes,
                    probeCandidate.opportunity.valueMeters, projectedExtraMinutes,
                  );
                }

                if (bestProbe) {
                  host.log(
                    `[CaptureRoute] OSRM near-budget chosen removal: ` +
                    `${bestProbe.opportunityId} → ` +
                    `${bestProbe.extraMinutes.toFixed(1)} min extra · ` +
                    `lost=${bestProbe.valueLostMeters.toFixed(0)}m · ` +
                    `relief=${bestProbe.reliefMinutes.toFixed(1)} min · ` +
                    `cost=${bestProbe.valueLossPerReliefMinute.toFixed(1)}m/min`,
                  );

                  activeOpportunities = activeOpportunities
                    .filter((opportunity) => opportunity.id !== bestProbe!.opportunityId)
                    .sort((a, b) => a.baselinePosition - b.baselinePosition);

                  captureStops = buildFinalRouteStops(activeOpportunities);

                  captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                  continue;
                }
              }
              /*
               * Adaptive OSRM network pruning.
               *
               * When the ordered route is catastrophically over budget,
               * removing only 1–2 opportunities per preflight pass wastes
               * requests and may hit the preflight-pass ceiling before
               * converging.
               *
               * As we approach the budget, pruning becomes conservative
               * again because road-network topology is non-linear.
               */
              const { targetedRemovalLimit, networkRemoveIds, removals } = planAdaptiveNetworkRemoval(
                networkPruneCandidates, activeOpportunities.length, overrunRatio,
              );

              host.log(
                `[CaptureRoute] OSRM adaptive prune: ` +
                `${projectedExtraMinutes.toFixed(1)}/${allowedExtraMinutes.toFixed(1)} min ` +
                `(${overrunRatio.toFixed(2)}x) → ` +
                `remove up to ${targetedRemovalLimit}`,
              );

              for (const candidate of removals) {
                host.log(
                  `[CaptureRoute] OSRM network removing: ` +
                  `${candidate.opportunity.id} · ` +
                  `penalty=${candidate.networkPenaltyMinutes.toFixed(1)} min · ` +
                  `${candidate.penaltyPer100Meters.toFixed(2)} min/100m`,
                );
              }

              if (networkRemoveIds.size) {
                /*
                 * If the route already fits the time budget and we are
                 * pruning only because a SAME-OPPORTUNITY traversal is
                 * pathological, do not allow that opportunity back later.
                 */
                if (qualityCleanupMode) {
                  for (const id of networkRemoveIds) {
                    permanentlyRejectedOpportunityIds.add(id);
                  }
                }
                activeOpportunities = activeOpportunities.filter((opportunity) => !networkRemoveIds.has(opportunity.id)).sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                host.log(`[CaptureRoute] OSRM network pruned ` + `${networkRemoveIds.size} opportunity(s).`);

                if (!captureStops.length) {
                  break;
                }

                /*
                 * Re-run OSRM immediately with the altered topology.
                 *
                 * Do NOT run the generic batch-pruner during this pass.
                 */
                continue;
              }
            }

            /*
             * --------------------------------------------------------
             * NEAR-BUDGET GENERIC SINGLE-REMOVAL GUARD
             * --------------------------------------------------------
             *
             * The network-specific candidate list can become empty
             * even though OSRM is only a few minutes over budget.
             *
             * In that case NEVER fall through to the generic
             * multi-opportunity batch pruner.
             *
             * Probe ordinary active opportunities one at a time
             * with OSRM Table and remove at most ONE per pass.
             */
            const nearBudgetAllowedExtraMinutes = spareMinutes + preflightTolerance;

            const nearBudgetOverrunMinutes = projectedExtraMinutes - nearBudgetAllowedExtraMinutes;

            if (nearBudgetOverrunMinutes > 0 && nearBudgetOverrunMinutes <= 5 && activeOpportunities.length > 1) {
              /*
               * Start with the least efficient opportunities,
               * but Table determines the real network result.
               */
              const genericProbeCandidates = [...activeOpportunities]
                .map((opportunity) => ({
                  opportunity,

                  efficiency: opportunity.valueMeters / Math.max(0.25, opportunity.estimatedDetourMinutes),
                }))
                .sort((a, b) => a.efficiency - b.efficiency)
                .slice(0, 5);

              let bestFittingProbe: FittingBudgetProbe | null = null;

              /*
               * If none of the five removals gets completely
               * under budget, still remember the best SINGLE
               * removal so we make progress without batch pruning.
               */
              let bestProgressProbe: ProgressBudgetProbe | null = null;

              for (const candidate of genericProbeCandidates) {
                const { trialOpportunities, trialCaptureOwners, trialStops } = prepareCaptureTrial({
                  activeOpportunities, removeId: candidate.opportunity.id,
                  startPt, endPt, maxFinalStops: host.config().maxFinalStops,
                });

                const trialPreflight = await routingProvider.preflightOrderedStops!(trialStops, run.signal);
                run.check();

                const trialExtraMinutes = trialPreflight.durationMinutes - baselineMinutes;

                /*
                 * Preserve the same full-road quality rule.
                 */
                const trialHasBrokenOpportunity = hasBrokenTrialOpportunity(
                  trialPreflight.legDurationMinutes, trialStops, trialCaptureOwners,
                );

                host.log(
                  `[CaptureRoute] OSRM generic near-budget probe: ` +
                  `remove ${candidate.opportunity.id} → ` +
                  `${trialExtraMinutes.toFixed(1)} min extra · ` +
                  `weighted value lost=${candidate.opportunity.valueMeters.toFixed(0)} · ` +
                  `quality=${trialHasBrokenOpportunity ? "bad" : "ok"}`,
                );

                if (trialHasBrokenOpportunity) {
                  continue;
                }

                /*
                 * Track the best one-removal improvement even
                 * when it does not completely fit yet.
                 */
                bestProgressProbe = chooseProgressBudgetProbe(
                  bestProgressProbe, candidate.opportunity.id, trialExtraMinutes,
                  candidate.opportunity.valueMeters, projectedExtraMinutes,
                );

                if (trialExtraMinutes > nearBudgetAllowedExtraMinutes) {
                  continue;
                }

                bestFittingProbe = chooseFittingBudgetProbe(
                  bestFittingProbe, candidate.opportunity.id, trialExtraMinutes,
                  candidate.opportunity.valueMeters, projectedExtraMinutes,
                );
              }

              /*
               * Prefer a removal that actually fits.
               * Otherwise take the best SINGLE step toward
               * the budget and preflight again.
               */
              const chosenNearBudgetProbe = bestFittingProbe ?? bestProgressProbe;

              if (chosenNearBudgetProbe) {
                host.log(
                  `[CaptureRoute] OSRM generic near-budget chosen removal: ` +
                  `${chosenNearBudgetProbe.opportunityId} → ` +
                  `${chosenNearBudgetProbe.extraMinutes.toFixed(1)} min extra`,
                );

                activeOpportunities = activeOpportunities
                  .filter((opportunity) => opportunity.id !== chosenNearBudgetProbe.opportunityId)
                  .sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                /*
                 * Critical:
                 * never reach the generic batch pruner
                 * from near-budget mode.
                 */
                continue;
              }

              /*
               * Extremely defensive fallback:
               *
               * none of the Table probes improved the route.
               * Still remove AT MOST ONE opportunity instead
               * of allowing a 5-10 opportunity batch deletion.
               */
              const fallbackCandidate = genericProbeCandidates[0]?.opportunity;

              if (fallbackCandidate) {
                host.log(`[CaptureRoute] OSRM generic near-budget one-at-a-time fallback: ` + `${fallbackCandidate.id}`);

                activeOpportunities = activeOpportunities.filter((opportunity) => opportunity.id !== fallbackCandidate.id).sort((a, b) => a.baselinePosition - b.baselinePosition);

                captureStops = buildFinalRouteStops(activeOpportunities);

                captureStopOwners = buildCaptureStopOwners(activeOpportunities);

                continue;
              }

              break;
            }
            const preflightPruning = planPreflightBatchPruning({
              opportunities: activeOpportunities, projectedExtraMinutes, spareMinutes, preflightTolerance,
            });

            host.log(
              `[CaptureRoute] OSRM preflight prune: ` +
              `actual/local=${preflightPruning.correctionFactor.toFixed(2)}, ` +
              `active=${preflightPruning.activeEstimatedMinutes.toFixed(1)} min, ` +
              `target=${preflightPruning.targetEstimatedMinutes.toFixed(1)} min, ` +
              `remove≈${preflightPruning.estimatedMinutesToRemove.toFixed(1)} min`,
            );

            for (const opportunity of preflightPruning.removals) {
              host.log(`[CaptureRoute] OSRM preflight removing: ` + `${opportunity.id} ` + `(${opportunity.estimatedDetourMinutes.toFixed(1)} min est)`);
            }

            /*
             * Safety: if nothing was removable, stop preflight pruning.
             */
            if (!preflightPruning.removeIds.size) {
              break;
            }

            activeOpportunities = preflightPruning.opportunities;

            /*
             * Rebuild the actual anchor list from the surviving
             * opportunities before running another preflight.
             */
            captureStops = buildFinalRouteStops(activeOpportunities);
            captureStopOwners = buildCaptureStopOwners(activeOpportunities);

            host.log(`[CaptureRoute] OSRM preflight pruned ` + `${preflightPruning.removeIds.size} opportunities / ` + `${preflightPruning.removedEstimatedMinutes.toFixed(1)} estimated minutes.`);

            host.log(`[CaptureRoute] OSRM preflight pruned ` + `${preflightPruning.removeIds.size} opportunities / ` + `${preflightPruning.removedEstimatedMinutes.toFixed(1)} estimated minutes.`);

            if (!captureStops.length) {
              break;
            }
          }

          if (lastPreflightExtraMinutes !== null) {
            host.log(`[CaptureRoute] OSRM preflight finished: ` + `${lastPreflightExtraMinutes.toFixed(1)} min extra`);
          }
        }

        /*
         * Preflight may have changed activeOpportunities,
         * so captureStops now represents the final set that
         * will actually be sent to the authoritative solve.
         */
        if (!captureStops.length) {
          finalRoute = null;
          break;
        }

        const solvedOpportunities = [...activeOpportunities];

        host.log(`[CaptureRoute] Final stops: ` + `${captureStops.length}`);

        const finalStops: [number, number][] = [startPt, ...captureStops, endPt];
        const result = await routingProvider.solve({
          signal: run.signal,
          stops: finalStops,

          preserveStopOrder: true,

          preserveEndpoints: true,
        });
        run.check();

        finalRoute = result;

        finalRouteOpportunities = solvedOpportunities;

        const finalMinutes = finalRoute.durationMinutes;

        const actualExtraMinutes = finalMinutes - baselineMinutes;

        /*
         * REMEMBER BEST ACTUAL SOLVE
         */
        captureSolveHistory.record(finalRoute, solvedOpportunities, actualExtraMinutes);

        host.log(`[CaptureRoute] Final: ` + `${finalMinutes.toFixed(1)} min`);

        host.log(`[CaptureRoute] Actual extra: ` + `${actualExtraMinutes.toFixed(1)} min`);

        /*
         * REAL BUDGET CHECK
         *
         * The local estimate is only an estimate.
         *
         * ArcGIS's actual route time is authoritative here.
         */
        const budgetTolerance = host.config().finalBudgetToleranceMinutes ?? 0.25;

        if (actualExtraMinutes <= spareMinutes + budgetTolerance) {
          host.log("[CaptureRoute] Route fits budget.");

          break;
        }

        /*
         * If the route exceeds the budget but there is
         * only one opportunity left, we cannot prune further.
         */
        if (activeOpportunities.length <= 1) {
          host.warn("[CaptureRoute] " + "Route still exceeds budget after pruning limit.");

          break;
        }

        /*
         * BATCH PRUNE FOR NEXT FINAL SOLVE
         *
         * We only have a small number of authoritative ArcGIS solves.
         *
         * Therefore, after seeing the REAL overrun, don't remove just
         * one tiny opportunity. Estimate how much local detour cost
         * must be removed and prune the least efficient opportunities
         * until we reach that amount.
         */

        const hasAnotherSolve = attempt + 1 < host.config().maxFinalRouteSolves;

        if (!hasAnotherSolve) {
          host.consoleWarn(`[CaptureRoute] Final solve still exceeds budget; ` + `no retry remains.`);

          break;
        }

        /*
         * Local estimated cost of the opportunities represented by
         * this ArcGIS solve.
         */
        const pruning = planFinalSolveBatchPruning({
          opportunities: activeOpportunities, actualExtraMinutes, spareMinutes, budgetTolerance,
        });

        host.log(
          `[CaptureRoute] Batch prune calibration: ` +
          `actual/local=${pruning.correctionFactor.toFixed(2)}, ` +
          `active estimate=${pruning.activeEstimatedMinutes.toFixed(1)} min, ` +
          `target estimate=${pruning.targetEstimatedMinutes.toFixed(1)} min, ` +
          `remove≈${pruning.estimatedMinutesToRemove.toFixed(1)} min`,
        );

        for (const opportunity of pruning.removals) {
          host.log(`[CaptureRoute] Batch removing: ` + `${opportunity.id} ` + `(${opportunity.estimatedDetourMinutes.toFixed(1)} min est)`);
        }

        activeOpportunities = pruning.opportunities;

        host.log(`[CaptureRoute] Batch pruned ` + `${pruning.removeIds.size} opportunities / ` + `${pruning.removedEstimatedMinutes.toFixed(1)} estimated minutes.`);
      }

      /*
       * FINAL VALIDATION
       */

      if (!finalRoute) {
        throw new Error("Final capture route could not be generated.");
      }

      const { route: bestRoute, opportunities: bestRouteOpportunities, extraMinutes: bestActualExtraMinutes } = captureSolveHistory.best;
      const finalBudgetTolerance = host.config().finalBudgetToleranceMinutes ?? 0.25;

      const finalSelection = selectFinalCaptureRoute({
        finalRoute, finalRouteOpportunities, bestRoute, bestRouteOpportunities,
        bestActualExtraMinutes, baselineMinutes, spareMinutes, finalBudgetTolerance,
      });
      const { lastRouteExtraMinutes } = finalSelection;

      if (finalSelection.recovered) {
        host.consoleWarn(
          `[CaptureRoute] Final retry was worse. ` +
          `Restoring best solve: ` +
          `${bestActualExtraMinutes.toFixed(1)} min extra ` +
          `instead of ` +
          `${lastRouteExtraMinutes.toFixed(1)} min.`,
        );
      }
      finalRoute = finalSelection.route;
      finalRouteOpportunities = finalSelection.opportunities;

      /*
       * From here onward, these opportunities correspond
       * exactly to the route stored in finalRoute.
       */
      activeOpportunities = [...finalRouteOpportunities];

      const finalMinutes = finalRoute.durationMinutes;

      const finalDistanceMeters = finalRoute.distanceMeters;

      const finalKilometers = finalDistanceMeters / 1000;

      const actualExtraMinutes = finalMinutes - baselineMinutes;

      host.log(`[CaptureRoute] Completed with ` + `${finalAttemptCount} final solve(s).`);

      host.log(`[CaptureRoute] Final distance: ` + `${finalKilometers.toFixed(2)} km`);

      host.log(`[CaptureRoute] Final duration: ` + `${finalMinutes.toFixed(1)} min`);

      host.log(`[CaptureRoute] Final extra: ` + `${actualExtraMinutes.toFixed(1)} min`);

      host.log(`[CaptureRoute] Opportunity novel metres: ` + opportunities.map((opportunity) => opportunity.novelMeters.toFixed(0)).join(", "));

      /*
       * 6. DRAW FINAL ROUTE
       */

      const { finalPaths, activeRouteCoverageTargets, routeCoverage, incrementalCoverage, combinedCoordinates } = evaluateFinalCaptureRoute({
        paths: finalRoute.paths, baselinePaths, activeOpportunities,
        routeCoverageToleranceMeters: host.config().routeCoverageToleranceMeters,
        coverageSampleSpacingMeters: host.config().coverageSampleSpacingMeters,
      });

      await host.draw(finalPaths, run.current);
      run.check();

      /*
       * 7. CAPTURE SUMMARY
       *
       * IMPORTANT:
       *
       * Use activeOpportunities, not the original selection,
       * because some opportunities may have been removed during
       * the budget-pruning loop.
       */

      const { finalSelectedNovelMeters, finalSelectedBaselineOverlapMeters, finalSelectedAnchorCount } = reportCaptureRouteCoverage({
        activeOpportunities, routeCoverage, incrementalCoverage,
        log: message => host.log(message),
      });

      /*
       * 9. STORE FINAL ROUTE RESULT
       *
       * IMPORTANT:
       *
       * Everything stored here describes the FINAL ArcGIS route
       * after budget correction / pruning.
       *
       * Do not use the original selection.opportunities here.
       */

      host.publish(buildCaptureRouteData({
          finalDistanceMeters, finalMinutes, combinedCoordinates, baselineMinutes, actualExtraMinutes,
          spareMinutes, activeRouteCoverageTargets, routeCoverage, incrementalCoverage,
          finalSelectedNovelMeters, finalSelectedBaselineOverlapMeters,
          selectedOpportunityCount: activeOpportunities.length,
          finalSelectedAnchorCount, selectedCorridorWidth, selectionStopReason: selection.stopReason,
        }));

      /*
       * 10. USER FEEDBACK
       */

      host.ready(actualExtraMinutes, incrementalCoverage.incrementalCoveredMeters / 1000);
    } catch (err) { if (!run.current() || (err as any)?.name === 'AbortError') return; host.error(err); } finally {
      try {
        if (run.current()) await host.restoreCamera(run.current);
        if (run.current()) { host.retainLoginWindow(); }
      } finally { host.finish(run); }
    }
}
