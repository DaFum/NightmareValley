import React from 'react'
import type { ReactNode } from 'react'

export function HudLayout({ children }: { children?: ReactNode }): JSX.Element | null {
	return <>{children ?? null}</>
}

export default HudLayout

