import React from 'react'
import type { ReactNode } from 'react'
import ThemeProvider from './ThemeProvider'
import ErrorBoundary from './ErrorBoundary'
import { Logger } from '../../lib/logger'
import { useGameStore } from '../../store/game.store'
import { useUIStore } from '../../store/ui.store'
import { useSelectionStore } from '../../store/selection.store'

export type AppProvidersProps = {
	children?: ReactNode
	onError?: (error: Error, info: React.ErrorInfo) => void
	errorFallback?: React.ReactNode | ((error: Error | null, reset: () => void) => React.ReactNode)
	enableStoreBootstrap?: boolean
}

/**
 * Centralized provider composition for app runtime.
 * - Theme context and persisted theme variables
 * - Top-level React error boundary + logger reporting
 */
function StoreBootstrap() {
	React.useEffect(() => {
		// Touch stores at runtime to guarantee deterministic initialization order
		// before first interactive frame and make dev introspection easier.
		void useGameStore.getState()
		void useUIStore.getState()
		void useSelectionStore.getState()

		if (__DEV__ && typeof window !== 'undefined') {
			;(window as Window & { __nvStoresReady?: boolean }).__nvStoresReady = true
		}
	}, [])

	return null
}

export const AppProviders: React.FC<AppProvidersProps> = ({
	children,
	onError,
	errorFallback,
	enableStoreBootstrap = true,
}) => {
	return (
		<ThemeProvider>
			<ErrorBoundary
				fallback={errorFallback}
				onError={(error, info) => {
					Logger.error('React runtime error:', error, info)
					onError?.(error, info)
				}}
			>
				{enableStoreBootstrap ? <StoreBootstrap /> : null}
				{children ?? null}
			</ErrorBoundary>
		</ThemeProvider>
	)
}

export default AppProviders
