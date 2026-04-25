import type { ReactNode } from 'react'

export default function Panel({ children }: { children?: ReactNode }): JSX.Element | null {
	return <>{children ?? null}</>
}

