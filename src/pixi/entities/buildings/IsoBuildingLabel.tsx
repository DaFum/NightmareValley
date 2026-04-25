import type { ReactNode } from 'react'

export function IsoBuildingLabel({ children }: { children?: ReactNode }): JSX.Element | null {
	return <>{children ?? null}</>
}

export default IsoBuildingLabel

