import React from 'react'
import type { ReactNode } from 'react'

type Props = { children?: ReactNode; fallback?: React.ReactNode }
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
		// eslint-disable-next-line no-console
		console.error('ErrorBoundary caught an error:', error, info)
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<div role="alert" style={{ padding: 16, background: '#2b2b2b', color: '#fff' }}>
						<h2>Something went wrong</h2>
						<pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(this.state.error)}</pre>
					</div>
				)
			)
		}

		return this.props.children ?? null
	}
}

export default ErrorBoundary

