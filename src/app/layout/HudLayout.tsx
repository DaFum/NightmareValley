import React from 'react'
import type { ReactNode } from 'react'

export type HudLayoutProps = {
	children?: ReactNode
	top?: ReactNode
	left?: ReactNode
	right?: ReactNode
	bottom?: ReactNode
	isMobile?: boolean
	mobileSideSlot?: 'stack-bottom' | 'hide'
	panelPriority?: Array<'top' | 'left' | 'right' | 'bottom'>
}

export const HudLayout: React.FC<HudLayoutProps> = ({
	children,
	top,
	left,
	right,
	bottom,
	isMobile = false,
	mobileSideSlot = 'stack-bottom',
	panelPriority = ['top', 'right', 'bottom', 'left'],
}) => {
	const resolvedMobile = isMobile
	const showSideSlots = !resolvedMobile || mobileSideSlot === 'stack-bottom'
	const priority = new Set(panelPriority)

	return (
		<div
			className={`hud-layout ${resolvedMobile ? 'hud-layout--mobile' : 'hud-layout--desktop'}`}
			aria-label="Game interface"
			data-mobile={resolvedMobile ? 'true' : 'false'}
		>
			{priority.has('top') && top ? <div className="hud-layout__top">{top}</div> : null}
			{showSideSlots && priority.has('left') && left ? <div className="hud-layout__left">{left}</div> : null}
			{showSideSlots && priority.has('right') && right ? <div className="hud-layout__right">{right}</div> : null}
			{priority.has('bottom') && bottom ? <div className="hud-layout__bottom">{bottom}</div> : null}
			{children ?? null}
		</div>
	)
}

export default HudLayout
