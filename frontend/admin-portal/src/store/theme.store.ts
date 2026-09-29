import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  // Remove all theme-* classes, then add the current one (skip 'blue' — it's the default)
  root.className = root.className.replace(/\btheme-\w+/g, '').trim()
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next)
          return { theme: next }
        }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'admin-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
