import { useMemo, useState } from 'react';
import { useUIStore } from '../../store/ui.store';
import { useGameStore, player1Id } from '../../store/game.store';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordBuilding } from '../../game/economy/production.logic';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { BuildingType, ResourceInventory, ResourceType } from '../../game/core/economy.types';
import { getCampaignObjectives } from '../../game/core/victory.rules';

type BuildCategory = 'campaign' | 'foundations' | 'food' | 'industry' | 'advanced';

const CATEGORY_LABELS: Record<BuildCategory, string> = {
  campaign: 'Campaign',
  foundations: 'Foundations',
  food: 'Food',
  industry: 'Industry',
  advanced: 'Advanced',
};

const CATEGORY_BUILDINGS: Record<BuildCategory, BuildingType[]> = {
  campaign: [
    'sepulcherQuarry',
    'wombWell',
    'shoreOfHooks',
    'refectoryOfSalt',
    'fieldOfMouths',
    'dustCathedralMill',
    'ovenOfLastBread',
    'coalWound',
    'ironVeinPit',
    'bloodSmeltery',
    'instrumentCrucible',
  ],
  foundations: ['organHarvester', 'millOfGnashing', 'sepulcherQuarry', 'vaultOfDigestiveStone', 'seedOfTheHowlingRoot'],
  food: ['wombWell', 'shoreOfHooks', 'fieldOfMouths', 'dustCathedralMill', 'ovenOfLastBread', 'styOfConsumption', 'houseOfFlensing'],
  industry: ['coalWound', 'ironVeinPit', 'goldCatacomb', 'bloodSmeltery', 'haloLiquefier', 'instrumentCrucible', 'bladeVestry'],
  advanced: ['skinStitchery', 'pitOfWarBirth', 'spireOfJurisdiction', 'refectoryOfSalt', 'fatRenderer', 'ashPress'],
};

const terrainLabel: Record<string, string> = {
  scarredEarth: 'Scarred earth',
  weepingForest: 'Forest',
  ribMountain: 'Mountain',
  placentaLake: 'Lake',
  scarPath: 'Road',
  occupiedScar: 'Occupied',
  ashBog: 'Ash bog',
  cathedralRock: 'Cathedral rock',
};

export function BuildingMenu() {
  const {
    activePanel,
    togglePanel,
    selectedBuildingToPlace,
    selectBuildingToPlace,
    roadPlacementMode,
    roadRemovalMode,
    toggleRoadPlacementMode,
    toggleRoadRemovalMode,
  } = useUIStore();
  const gameState = useGameStore(state => state.gameState);
  const [category, setCategory] = useState<BuildCategory>('campaign');

  const player = gameState.players[player1Id];

  if (!player) return null;

  // Aggregate vault outputBuffers directly — avoids relying on player.stock which can lag
  // behind vault deductions until the next simulateTick syncs it.
  const availableInventory: ResourceInventory = {} as ResourceInventory;
  let hasVault = false;
  for (const buildingId of player.buildings) {
    const b = gameState.buildings[buildingId];
    if (b?.type === 'vaultOfDigestiveStone') {
      hasVault = true;
      for (const [res, amt] of Object.entries(b.outputBuffer)) {
        (availableInventory as Record<string, number>)[res] = ((availableInventory as Record<string, number>)[res] ?? 0) + (amt ?? 0);
      }
    }
  }
  const inventory = hasVault ? availableInventory : player.stock;

  const isOpen = activePanel === 'buildingMenu';

  const objectives = useMemo(() => getCampaignObjectives(gameState, player1Id), [gameState]);
  const nextObjective = objectives.find((objective) => !objective.complete);
  const toolHint = getToolHint({
    isOpen,
    roadPlacementMode,
    roadRemovalMode,
    selectedBuildingToPlace,
  });
  const categoryBuildingTypes = CATEGORY_BUILDINGS[category];
  const buildingsToRender = categoryBuildingTypes
    .map((type) => BUILDING_DEFINITIONS[type])
    .filter(Boolean);

  return (
    <div className="build-dock">
      <button
        onClick={() => togglePanel('buildingMenu')}
        className={`macabre-panel build-dock__toggle ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-controls="building-menu-panel"
      >
        Build
      </button>
      <button
        onClick={toggleRoadPlacementMode}
        className={`macabre-panel build-dock__toggle ${roadPlacementMode ? 'active' : ''}`}
        aria-pressed={roadPlacementMode}
        title="Place scar paths on owned buildable tiles"
      >
        Road
      </button>
      <button
        onClick={toggleRoadRemovalMode}
        className={`macabre-panel build-dock__toggle ${roadRemovalMode ? 'active' : ''}`}
        aria-pressed={roadRemovalMode}
        title="Remove scar paths from owned road tiles"
      >
        Clear road
      </button>

      <div className={`tool-mode-hint ${toolHint.tone ? `tool-mode-hint--${toolHint.tone}` : ''}`} role="status">
        <strong>{toolHint.label}</strong>
        <span>{toolHint.detail}</span>
      </div>

      {isOpen && (
        <div
          id="building-menu-panel"
          className="macabre-panel build-menu-panel animate-bleed-in"
        >
          <h2 className="macabre-text-glow build-menu-panel__title">
            Architecture of Duty
          </h2>

          <div className="build-menu-panel__campaign-note">
            <span>Next objective</span>
            <strong>{nextObjective ? nextObjective.label : 'All campaign objectives complete'}</strong>
          </div>

          <div className="build-menu-tabs" aria-label="Build categories">
            {(Object.keys(CATEGORY_LABELS) as BuildCategory[]).map((key) => (
              <button
                key={key}
                className={`build-menu-tab ${category === key ? 'active' : ''}`}
                onClick={() => setCategory(key)}
                aria-pressed={category === key}
              >
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>

          <div className="building-list">
            {buildingsToRender.map(def => {
              const canAfford = canAffordBuilding(inventory, def.type);
              const isSelected = selectedBuildingToPlace === def.type;
              const missingCosts = Object.entries(def.buildCost.resources)
                .filter(([res, amt]) => (inventory[res as ResourceType] ?? 0) < (amt ?? 0))
                .map(([res, amt]) => `${res}: ${inventory[res as ResourceType] ?? 0}/${amt}`);
              const placementLabel = def.allowedTerrain
                .map((terrain) => terrainLabel[terrain] ?? terrain)
                .join(', ');
              const optionTitle = canAfford
                ? `${def.name}. Build on ${placementLabel}.`
                : `${def.name}. Missing ${missingCosts.join(', ')}.`;

              return (
                <button
                  key={def.type}
                  onClick={() => canAfford ? selectBuildingToPlace(isSelected ? null : def.type) : null}
                  className={`building-option ${isSelected ? 'selected' : ''}`}
                  disabled={!canAfford}
                  title={optionTitle}
                >
                  <span className="building-option__header">
                    <img
                      src={imageMap[`buildings/stage4/${def.type}.png`]}
                      alt=""
                      aria-hidden="true"
                      className="building-option__icon"
                    />
                    <span className="building-option__name">{def.name}</span>
                  </span>
                  <span className="building-option__description">{def.description}</span>
                  <span className="building-option__terrain">Build on {placementLabel}</span>
                  <span className="building-option__costs">
                    {Object.entries(def.buildCost.resources).map(([res, amt]) => {
                      const current = inventory[res as ResourceType] ?? 0;
                      const isShort = current < (amt ?? 0);
                      return (
                      <span
                        key={res}
                        className={`resource-pill ${isShort ? 'resource-pill--short' : 'resource-pill--ready'}`}
                        title={`${res}: ${current}/${amt}`}
                      >
                        <img
                          src={imageMap[`resources/${res}.png`]}
                          alt=""
                          aria-hidden="true"
                        />
                        {current}/{amt}
                      </span>
                      );
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getToolHint({
  isOpen,
  roadPlacementMode,
  roadRemovalMode,
  selectedBuildingToPlace,
}: {
  isOpen: boolean;
  roadPlacementMode: boolean;
  roadRemovalMode: boolean;
  selectedBuildingToPlace: BuildingType | null;
}) {
  if (selectedBuildingToPlace) {
    const definition = BUILDING_DEFINITIONS[selectedBuildingToPlace];
    return {
      tone: 'active',
      label: `Placing ${definition.name}`,
      detail: 'Click an owned valid tile. Right-click or choose the building again to cancel.',
    };
  }

  if (roadPlacementMode) {
    return {
      tone: 'active',
      label: 'Road tool active',
      detail: 'Click owned tiles to draw connected scar paths between vaults and workplaces.',
    };
  }

  if (roadRemovalMode) {
    return {
      tone: 'warn',
      label: 'Road removal active',
      detail: 'Click owned road tiles to clear them. Buildings can disconnect if paths are removed.',
    };
  }

  if (isOpen) {
    return {
      tone: '',
      label: 'Choose a building',
      detail: 'Campaign tab follows the main production chain; other tabs expose optional economy branches.',
    };
  }

  return {
    tone: '',
    label: 'Build tools ready',
    detail: 'Open Build for structures, Road for logistics, or Clear road to reshape paths.',
  };
}
