import { ReactNode, useEffect, useState } from 'react'
import { Theme, ThemeContext } from './themeContextValue'

interface ThemeProviderProps {
  children: ReactNode
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light' // SSR safety check
  const savedTheme = localStorage.getItem('theme') as Theme | null
  return savedTheme ?? 'light'
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement

    // Toggle Tailwind's 'dark' class
    const usesDarkTheme = theme === 'dark' || (
      theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    if (usesDarkTheme) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Keep data-theme as well if you use standard CSS attribute selectors anywhere
    root.setAttribute('data-theme', theme)
    
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (theme: Theme) => {
    setThemeState(theme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
