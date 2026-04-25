import React from 'react'
import type { ReactNode } from 'react'
import AppProviders from '../providers/AppProviders'

export type RootLayoutProps = {
	children?: ReactNode
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
	return (
		<AppProviders>
			<div className="app-root" data-app-root="nightmare-valley">
				{children ?? null}
			</div>
		</AppProviders>
	)
}

export default RootLayout

