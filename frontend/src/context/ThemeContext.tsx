import { ReactNode, useEffect, useState } from 'react'
import { Theme, ThemeContext } from './themeContextValue'

interface ThemeProviderProps {
  children: ReactNode
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme') as Theme | null
  return savedTheme ?? 'light'
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (theme: Theme) => {
    setThemeState(theme)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}
