import React from 'react'
import { useGameStore } from '../../store/game.store'
import { useUIStore } from '../../store/ui.store'

const DEBUG_ROUTE_ENABLED =
	typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

export default function DebugRoute(): JSX.Element {
	const tick = useGameStore((state) => state.gameState.tick)
	const isRunning = useGameStore((state) => state.isRunning)
	const tickRate = useGameStore((state) => state.tickRate)
	const lastError = useGameStore((state) => state.lastError)
	const activePanel = useUIStore((state) => state.activePanel)
	const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace)

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
				<div><dt>Last error</dt><dd>{lastError ? String(lastError) : 'none'}</dd></div>
			</dl>
			<a className="hud-button" href="/">Return to game</a>
		</main>
	)
}

