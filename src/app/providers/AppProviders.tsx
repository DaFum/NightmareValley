import React from 'react'
import type { ReactNode } from 'react'
import ThemeProvider from './ThemeProvider'
import ErrorBoundary from './ErrorBoundary'

export const AppProviders: React.FC<{ children?: ReactNode }> = ({ children }) => {
	return (
		<ThemeProvider>
			<ErrorBoundary>{children ?? null}</ErrorBoundary>
		</ThemeProvider>
	)
}

export default AppProviders

