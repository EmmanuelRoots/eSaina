import { useEffect, useState } from "react"
import { Colors } from "../../constants/colors"

type ThemeMode = 'light' | 'dark'

export const useThemeColors = ()=>{
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

    const handleChange = (e:MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    // Ajoute le listener
    mediaQuery.addEventListener('change', handleChange);

    // Nettoyage
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme])

  return Colors[theme]
}