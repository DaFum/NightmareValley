
export default function NotFoundRoute(): JSX.Element {
	const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname
	const debugEnabled = __DEV__

	return (
		<main className="not-found-route" role="main">
			<h1>Route not found</h1>
			<p>The path <code>{currentPath}</code> does not map to a NightmareValley screen.</p>
			<p>Try returning to the game route{debugEnabled ? ' or opening debug tools in development builds' : ''}.</p>
			<nav aria-label="Recovery actions">
				<a className="hud-button" href="/">Open game</a>
				<a className="hud-button" href="/game">Reload game route</a>
				{debugEnabled ? <a className="hud-button" href="/debug">Open debug route</a> : null}
			</nav>
		</main>
	)
}
