import { useEffect } from 'react'
import { useThemeStore } from '@/store/theme.store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease')
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  // Detect system preference on mount if user hasn't explicitly set one
  useEffect(() => {
    const stored = localStorage.getItem('customer-theme')
    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        useThemeStore.getState().setTheme('dark')
      }
    }
  }, [])

  return <>{children}</>
}
