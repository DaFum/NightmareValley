import { useGameStore } from '../../store/game.store'
import { useUIStore } from '../../store/ui.store'
import { useDebugStore } from '../../store/debug.store'
import { useRenderStore } from '../../store/render.store'

const DEBUG_ROUTE_ENABLED = __DEV__

export default function DebugRoute(): JSX.Element {
	const tick = useGameStore((state) => state.gameState.tick)
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
				<div><dt>Running</dt><dd>{isRunning ? 'yes' : 'no'}</dd></div>
				<div><dt>Tick rate</dt><dd>{tickRate}x</dd></div>
				<div><dt>Active panel</dt><dd>{activePanel ?? 'none'}</dd></div>
				<div><dt>Placement</dt><dd>{selectedBuildingToPlace ?? 'none'}</dd></div>
				<div><dt>Last error</dt><dd>{lastErrorText}</dd></div>
				<div><dt>LOD</dt><dd>{renderStats.lodLevel ?? 'full'}</dd></div>
				<div><dt>Warnings</dt><dd>{[...debugWarnings, ...renderWarnings].join(' | ') || 'none'}</dd></div>
			</dl>
			<a className="hud-button" href="/">Return to game</a>
		</main>
	)
}
