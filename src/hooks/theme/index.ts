import { useEffect, useState } from "react"
import { Colors } from "../../constants/colors"

type ThemeMode = 'light' | 'dark'

export const useThemeColors = () => {
  const getPreferredTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  };

  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme)

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [])

  useEffect(() => {
    const root = document.documentElement;
    const colors = Colors[theme];
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
      
      // Also set RGB version for transparency support
      if (typeof value === 'string' && value.startsWith('#')) {
        const r = parseInt(value.slice(1, 3), 16);
        const g = parseInt(value.slice(3, 5), 16);
        const b = parseInt(value.slice(5, 7), 16);
        root.style.setProperty(`--color-${key}-rgb`, `${r}, ${g}, ${b}`);
      }
    });
    
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return { ...Colors[theme], mode: theme };
}