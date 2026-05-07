import { createContentCatalog, formatCatalogLabel, getBuildingConsumes, getBuildingProduces } from './content.catalog';
import {
  cloneState,
  createBuildingInstance,
  distance,
  getOwnerVaults,
  isTileBuildableForPlayer,
  processAutoHireWorkers,
  syncPopulationLimitsFromVaults,
  updateWorkersPassiveState,
  updateWorldPulse,
} from './economy.simulation';
import { createRandom } from './random';
import { calculateGameScore } from './victory.rules';
import { getEconomyRecommendation } from '../economy/economy.planner';
import { findExtractionDepositTile, getExtractionCycleTime } from '../economy/extraction.logic';
import { addRecipeOutputs, canUpgradeBuilding, getRecipeCycleTime, subtractRecipeInputs } from '../economy/production.logic';
import { applyResourceDelta } from '../economy/stockpile.logic';
import {
  canTransportBetweenBuildings,
  findBestJobForCarrier,
  findTargetBuildingsForResource,
  getBuildingResourceNeed,
  getEffectiveBuildingResourceNeed,
  getPendingInboundAmount,
  getTileAtPosition,
  getTransportPriority,
  gridManhattanDistance,
  makeTransportSignature,
  pruneTerminalTransportJobs,
  recomputeTierFromFootfall,
  validateFootfallThresholds,
} from '../economy/transport.logic';
import { listBuildings } from '../entities/buildings/building.data';
import { calcFootprint } from '../entities/buildings/building.footprints';
import { canPlaceBuilding } from '../entities/buildings/building.placement';
import { deriveBuildingStatus, deriveProductionBuildingStatus } from '../entities/buildings/building.status';
import { getUpgradeCost } from '../entities/buildings/building.upgrades';
import { connectSegments, neighborKey } from '../entities/roads/road.connections';
import { addRoadSegment, removeRoadSegment } from '../entities/roads/road.logic';
import { roadShapeForSegment } from '../entities/roads/road.render-shape';
import { canPlaceRoad } from '../entities/roads/road.validation';
import { animationFrameForWorker } from '../entities/workers/worker.animation';
import { getWorkerDef, listWorkerTypes } from '../entities/workers/worker.data';
import { assignJob, clearJob } from '../entities/workers/worker.jobs';
import { planPath } from '../entities/workers/worker.pathing';
import { workerStatus } from '../entities/workers/worker.status';
import { createWorker } from '../entities/workers/worker.types';
import { computeIsoWorldBounds } from '../iso/iso.bounds';
import { getIsoDepth } from '../iso/iso.depth';
import { screenToTile } from '../iso/iso.inverse';
import { selectTileAtScreen, selectTileRangeBetween } from '../iso/iso.selection';
import { pickTileFromScreen, snapToNearestTile } from '../iso/iso.snap';

void [
  createContentCatalog,
  formatCatalogLabel,
  getBuildingConsumes,
  getBuildingProduces,
  cloneState,
  createBuildingInstance,
  distance,
  getOwnerVaults,
  isTileBuildableForPlayer,
  processAutoHireWorkers,
  syncPopulationLimitsFromVaults,
  updateWorkersPassiveState,
  updateWorldPulse,
  createRandom,
  calculateGameScore,
  getEconomyRecommendation,
  findExtractionDepositTile,
  getExtractionCycleTime,
  addRecipeOutputs,
  canUpgradeBuilding,
  getRecipeCycleTime,
  subtractRecipeInputs,
  applyResourceDelta,
  canTransportBetweenBuildings,
  findBestJobForCarrier,
  findTargetBuildingsForResource,
  getBuildingResourceNeed,
  getEffectiveBuildingResourceNeed,
  getPendingInboundAmount,
  getTileAtPosition,
  getTransportPriority,
  gridManhattanDistance,
  makeTransportSignature,
  pruneTerminalTransportJobs,
  recomputeTierFromFootfall,
  validateFootfallThresholds,
  listBuildings,
  calcFootprint,
  canPlaceBuilding,
  deriveBuildingStatus,
  deriveProductionBuildingStatus,
  getUpgradeCost,
  connectSegments,
  neighborKey,
  addRoadSegment,
  removeRoadSegment,
  roadShapeForSegment,
  canPlaceRoad,
  animationFrameForWorker,
  getWorkerDef,
  listWorkerTypes,
  assignJob,
  clearJob,
  planPath,
  workerStatus,
  createWorker,
  computeIsoWorldBounds,
  getIsoDepth,
  screenToTile,
  selectTileAtScreen,
  selectTileRangeBetween,
  pickTileFromScreen,
  snapToNearestTile,
];
