'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'system';

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: string;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
};

const themes: { value: Theme; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Clean and bright' },
  { value: 'dark', label: 'Dark', description: 'Modern and sleek' },
  { value: 'ocean', label: 'Ocean', description: 'Cool blue tones' },
  { value: 'sunset', label: 'Sunset', description: 'Warm orange hues' },
  { value: 'forest', label: 'Forest', description: 'Natural green palette' },
  { value: 'system', label: 'System', description: 'Match device settings' },
];

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && themes.some((t) => t.value === savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('dark', 'theme-ocean', 'theme-sunset', 'theme-forest');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = getSystemTheme();
    }

    setResolvedTheme(effectiveTheme);

    // Apply theme class
    switch (effectiveTheme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'ocean':
        root.classList.add('theme-ocean');
        break;
      case 'sunset':
        root.classList.add('theme-sunset');
        break;
      case 'forest':
        root.classList.add('theme-forest');
        break;
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = getSystemTheme();
        setResolvedTheme(newTheme);
        const root = document.documentElement;
        root.classList.remove('dark');
        if (newTheme === 'dark') {
          root.classList.add('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{ theme: 'system', resolvedTheme: 'light', setTheme, themes }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
