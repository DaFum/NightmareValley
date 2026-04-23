import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', toggleTheme: () => {} })

export const ThemeProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		try {
			const stored = localStorage.getItem('nv-theme')
			if (stored === 'light' || stored === 'dark') return stored
		} catch (e) {
			// ignore
		}
		return 'dark'
	})

	useEffect(() => {
		try {
			document.documentElement.setAttribute('data-theme', theme)
			localStorage.setItem('nv-theme', theme)
		} catch (e) {
			// ignore
		}
	}, [theme])

	const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children ?? null}</ThemeContext.Provider>
}

export function useTheme() {
	return useContext(ThemeContext)
}

export default ThemeProvider

