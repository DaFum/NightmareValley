import React from 'react'

export default function NotFoundRoute(): JSX.Element {
	const currentPath = typeof window === 'undefined' ? '/' : window.location.pathname

	return (
		<main className="not-found-route" role="main">
			<h1>Route not found</h1>
			<p>The path <code>{currentPath}</code> does not map to a NightmareValley screen.</p>
			<nav aria-label="Recovery actions">
				<a className="hud-button" href="/">Open game</a>
				<a className="hud-button" href="/game">Reload game route</a>
			</nav>
		</main>
	)
}

