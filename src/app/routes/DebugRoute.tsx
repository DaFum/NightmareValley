import { player1Id, useGameStore } from '../../store/game.store'
import { useUIStore } from '../../store/ui.store'
import { useDebugStore } from '../../store/debug.store'
import { useRenderStore } from '../../store/render.store'
import { isDevFeatureEnabled } from '../devFeatures'
import { getMilitaryMetrics } from '../../game/military'

const DEBUG_ROUTE_ENABLED = isDevFeatureEnabled('debugRoute')

export default function DebugRoute(): JSX.Element {
	const tick = useGameStore((state) => state.gameState.tick)
	const seed = useGameStore((state) => state.gameState.seed)
	const ageOfTeeth = useGameStore((state) => state.gameState.ageOfTeeth)
	const worldMetrics = useGameStore((state) => {
		const gameState = state.gameState
		const roads = Object.values(gameState.territory.tiles).filter((tile) => tile.terrain === 'scarPath').length
		const playerTiles = Object.values(gameState.territory.tiles).filter((tile) => tile.ownerId === player1Id).length
		const enemyTiles = Object.values(gameState.territory.tiles).filter((tile) => tile.ownerId === gameState.aiOwnerId).length
		const military = getMilitaryMetrics(gameState, player1Id)
		return {
			buildings: Object.keys(gameState.buildings).length,
			workers: Object.keys(gameState.workers).length,
			tiles: Object.keys(gameState.territory.tiles).length,
			roads,
			playerTiles,
			enemyTiles,
			transportJobs: Object.keys(gameState.transport.jobs).length,
			activeCarriers: Object.keys(gameState.transport.activeCarrierTasks).length,
			queuedJobs: gameState.transport.queuedJobCount,
			networkStress: gameState.transport.networkStress,
			averageLatencySec: gameState.transport.averageLatencySec,
			aiOwnerId: gameState.aiOwnerId ?? 'none',
			aiActions: gameState.ai?.lastActions.length ?? 0,
			aiApplied: gameState.ai?.appliedActions.length ?? 0,
			military,
			activeRaid: gameState.military?.activeRaid,
			nextAttackAge: gameState.military?.nextAttackAge ?? 0,
			enemyPressure: gameState.military?.enemyPressure ?? 0,
		}
	})
	const isRunning = useGameStore((state) => state.isRunning)
	const tickRate = useGameStore((state) => state.tickRate)
	const lastError = useGameStore((state) => state.lastError)
	const activePanel = useUIStore((state) => state.activePanel)
	const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace)
	const debugWarnings = useDebugStore((state) => state.warnings)
	const renderWarnings = useRenderStore((state) => state.warnings)
	const renderStats = useRenderStore((state) => state.stats)
	const lastErrorText = lastError
		? `${lastError.code}: ${lastError.message}${lastError.tick ? ` @tick ${lastError.tick}` : ''}`
		: 'none'

	if (!DEBUG_ROUTE_ENABLED) {
		return (
			<main className="not-found-route" role="main">
				<h1>Debug tools unavailable</h1>
				<p>This route is disabled for this build.</p>
				<a className="hud-button" href="/">Return to game</a>
			</main>
		)
	}

	return (
		<main className="debug-route" role="main">
			<h1>Runtime Debug</h1>
			<dl>
				<div><dt>Tick</dt><dd>{tick}</dd></div>
				<div><dt>Seed</dt><dd>{seed}</dd></div>
				<div><dt>Age</dt><dd>{Math.floor(ageOfTeeth)}s</dd></div>
				<div><dt>Running</dt><dd>{isRunning ? 'yes' : 'no'}</dd></div>
				<div><dt>Tick rate</dt><dd>{tickRate}x</dd></div>
				<div><dt>Active panel</dt><dd>{activePanel ?? 'none'}</dd></div>
				<div><dt>Placement</dt><dd>{selectedBuildingToPlace ?? 'none'}</dd></div>
				<div><dt>Last error</dt><dd>{lastErrorText}</dd></div>
				<div><dt>LOD</dt><dd>{renderStats.lodLevel ?? 'full'}</dd></div>
				<div><dt>World</dt><dd>{worldMetrics.tiles} tiles · {worldMetrics.buildings} buildings · {worldMetrics.workers} workers</dd></div>
				<div><dt>Territory</dt><dd>{worldMetrics.playerTiles} player · {worldMetrics.enemyTiles} enemy</dd></div>
				<div><dt>Pathing</dt><dd>{worldMetrics.roads} road tiles</dd></div>
				<div><dt>Transport</dt><dd>{worldMetrics.transportJobs} jobs · {worldMetrics.activeCarriers} active · {worldMetrics.queuedJobs} queued · stress {worldMetrics.networkStress.toFixed(1)} · latency {worldMetrics.averageLatencySec.toFixed(1)}s</dd></div>
				<div><dt>AI</dt><dd>{worldMetrics.aiOwnerId} · {worldMetrics.aiActions} actions · {worldMetrics.aiApplied} applied</dd></div>
				<div><dt>Military</dt><dd>{worldMetrics.military.soldiers} soldiers · defense {worldMetrics.military.defenseStrength} · pressure {worldMetrics.enemyPressure.toFixed(0)} · next {Math.max(0, worldMetrics.nextAttackAge - ageOfTeeth).toFixed(0)}s</dd></div>
				<div><dt>Raid</dt><dd>{worldMetrics.activeRaid ? `${worldMetrics.activeRaid.id} strength ${worldMetrics.activeRaid.strength} health ${worldMetrics.activeRaid.health.toFixed(1)}` : 'none'}</dd></div>
				<div><dt>Warnings</dt><dd>{[...debugWarnings, ...renderWarnings].join(' | ') || 'none'}</dd></div>
			</dl>
			<a className="hud-button" href="/">Return to game</a>
		</main>
	)
}
