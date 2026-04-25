import React from 'react'
import type { ReactNode } from 'react'
import ThemeProvider from './ThemeProvider'
import ErrorBoundary from './ErrorBoundary'
import { Logger } from '../../lib/logger'

export type AppProvidersProps = {
	children?: ReactNode
	onError?: (error: Error, info: React.ErrorInfo) => void
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children, onError }) => {
	return (
		<ThemeProvider>
			<ErrorBoundary
				onError={(error, info) => {
					Logger.error('React runtime error:', error, info)
					onError?.(error, info)
				}}
			>
				{children ?? null}
			</ErrorBoundary>
		</ThemeProvider>
	)
}

export default AppProviders

