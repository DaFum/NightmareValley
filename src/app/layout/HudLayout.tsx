import React from 'react'
import type { ReactNode } from 'react'

export type HudLayoutProps = {
	children?: ReactNode
	top?: ReactNode
	left?: ReactNode
	right?: ReactNode
	bottom?: ReactNode
}

export const HudLayout: React.FC<HudLayoutProps> = ({ children, top, left, right, bottom }) => {
	return (
		<div className="hud-layout" aria-label="Game interface">
			{top ? <div className="hud-layout__top">{top}</div> : null}
			{left ? <div className="hud-layout__left">{left}</div> : null}
			{right ? <div className="hud-layout__right">{right}</div> : null}
			{bottom ? <div className="hud-layout__bottom">{bottom}</div> : null}
			{children ?? null}
		</div>
	)
}

export default HudLayout

