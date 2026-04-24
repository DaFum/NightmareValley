import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void }

const STORAGE_KEY = 'nv-theme'

const THEME_VARIABLES: Record<Theme, Record<string, string>> = {
	dark: {
		'--bg': '#050304',
		'--fg': '#e3dcd3',
		'--panel-bg': 'rgba(10, 5, 6, 0.85)',
	},
	light: {
		'--bg': '#e3dcd3',
		'--fg': '#12090a',
		'--panel-bg': 'rgba(250, 245, 238, 0.9)',
	},
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: 'dark',
	setTheme: () => {},
	toggleTheme: () => {},
})

export const ThemeProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			if (stored === 'light' || stored === 'dark') return stored
		} catch (e) {
			// localStorage may be unavailable during SSR or privacy-restricted browsing.
		}
		return 'dark'
	})

	useEffect(() => {
		try {
			document.documentElement.setAttribute('data-theme', theme)
			for (const [name, value] of Object.entries(THEME_VARIABLES[theme])) {
				document.documentElement.style.setProperty(name, value)
			}
			localStorage.setItem(STORAGE_KEY, theme)
		} catch (e) {
			// The app remains usable with stylesheet defaults when DOM storage is unavailable.
		}
	}, [theme])

	const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme])

	return <ThemeContext.Provider value={value}>{children ?? null}</ThemeContext.Provider>
}

export function useTheme() {
	return useContext(ThemeContext)
}

export default ThemeProvider

