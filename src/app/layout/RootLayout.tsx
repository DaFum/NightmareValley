import React from 'react'
import type { ReactNode } from 'react'

export const RootLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
	return <>{children ?? null}</>
}

export default RootLayout

