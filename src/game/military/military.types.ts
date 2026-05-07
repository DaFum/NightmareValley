export type MilitaryDifficulty = 'easy' | 'medium' | 'hard';

export type MilitaryDefeatReason = 'vaultDestroyed' | 'territoryLost';

export interface MilitaryRaid {
  id: string;
  strength: number;
  health: number;
  startedAtAge: number;
}

export interface MilitaryRuntimeState {
  difficulty: MilitaryDifficulty;
  enemyPressure: number;
  nextAttackAge: number;
  raidsRepelled?: number;
  activeRaid?: MilitaryRaid;
  lastWarningAttackAge?: number;
  defeatReason?: MilitaryDefeatReason;
}

export interface MilitaryMetrics {
  soldiers: number;
  spires: number;
  defenseStrength: number;
  controlledTiles: number;
  enemyTerritoryTiles: number;
  controlledRatio: number;
  activeCombats: number;
  vaultIntegrity: number;
}
