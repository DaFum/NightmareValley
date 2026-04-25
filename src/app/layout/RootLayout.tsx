import React from 'react'
import type { ReactNode } from 'react'
import AppProviders from '../providers/AppProviders'

export type RootLayoutProps = {
	children?: ReactNode
	errorFallback?: React.ReactNode | ((error: Error | null, reset: () => void) => React.ReactNode)
	enableStoreBootstrap?: boolean
}

export const RootLayout: React.FC<RootLayoutProps> = ({
	children,
	errorFallback,
	enableStoreBootstrap = true,
}) => {
	return (
		<AppProviders errorFallback={errorFallback} enableStoreBootstrap={enableStoreBootstrap}>
			<div className="app-root" data-app-root="nightmare-valley">
				{children ?? null}
			</div>
		</AppProviders>
	)
}

export default RootLayout
