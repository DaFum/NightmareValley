import React from 'react'
import type { ReactNode } from 'react'
import { Logger } from '../../lib/logger'

type Props = {
	children?: ReactNode
	fallback?: React.ReactNode | ((error: Error | null, reset: () => void) => React.ReactNode)
	onError?: (error: Error, info: React.ErrorInfo) => void
}
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		Logger.error('ErrorBoundary caught an error:', error, info)
		this.props.onError?.(error, info)
	}

	private reset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (typeof this.props.fallback === 'function') {
				return this.props.fallback(this.state.error, this.reset)
			}

			return (
				this.props.fallback ?? (
					<div className="app-error-fallback" role="alert" aria-live="assertive">
						<h1>NightmareValley stopped rendering</h1>
						<p>The runtime caught an unrecoverable UI error. The simulation has been paused visually to avoid corrupt input.</p>
						<pre>{String(this.state.error?.message ?? this.state.error ?? 'Unknown error')}</pre>
						<button className="hud-button" type="button" onClick={this.reset}>Try again</button>
					</div>
				)
			)
		}

		return this.props.children ?? null
	}
}

export default ErrorBoundary

