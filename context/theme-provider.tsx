'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type AccentPack = 'classic' | 'reports'

type ThemeContextType = {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  accentPack: AccentPack
  setTheme: (theme: Theme) => void
  setAccentPack: (pack: AccentPack) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  effectiveTheme: 'dark',
  accentPack: 'classic',
  setTheme: () => {},
  setAccentPack: () => {},
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyAccentClass(pack: AccentPack) {
  if (typeof window === 'undefined') return
  const root = window.document.documentElement
  root.classList.remove('accent-reports')
  if (pack === 'reports') {
    root.classList.add('accent-reports')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [accentPack, setAccentPackState] = useState<AccentPack>('classic')
  const [mounted, setMounted] = useState(false)

  const resolveEffective = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') return getSystemTheme()
    return t
  }

  const applyTheme = (t: Theme) => {
    if (typeof window === 'undefined') return
    const effective = resolveEffective(t)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effective)
    root.style.colorScheme = effective
  }

  useEffect(() => {
    setMounted(true)

    // Restore theme
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const validThemes: Theme[] = ['light', 'dark', 'system']
    const resolved = savedTheme && validThemes.includes(savedTheme) ? savedTheme : 'dark'
    setThemeState(resolved)
    applyTheme(resolved)

    // Restore accent pack
    const savedAccent = localStorage.getItem('accentPack') as AccentPack | null
    const validAccents: AccentPack[] = ['classic', 'reports']
    const resolvedAccent = savedAccent && validAccents.includes(savedAccent) ? savedAccent : 'classic'
    setAccentPackState(resolvedAccent)
    applyAccentClass(resolvedAccent)

    // Listen for system preference changes when in system mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const current = localStorage.getItem('theme') as Theme | null
      if (current === 'system') applyTheme('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (mounted) {
      applyAccentClass(accentPack)
      localStorage.setItem('accentPack', accentPack)
    }
  }, [accentPack, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setAccentPack = (pack: AccentPack) => {
    setAccentPackState(pack)
    // Persist to backend (fire-and-forget)
    fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accentPack: pack }),
    }).catch(() => {})
  }

  const toggleTheme = () => {
    setThemeState(prev => (resolveEffective(prev) === 'dark' ? 'light' : 'dark'))
  }

  const value = {
    theme,
    effectiveTheme: resolveEffective(theme),
    accentPack,
    setTheme,
    setAccentPack,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
