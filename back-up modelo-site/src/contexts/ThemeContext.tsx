'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  primaryColor: string
  setPrimaryColor: (color: string) => void
  themeName: string
  setThemeName: (name: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themeColors = {
  'Roxo (Padrão)': '#7162f0',
  'Azul': '#3b82f6',
  'Verde': '#10b981',
  'Laranja': '#f97316',
  'Rosa': '#ec4899',
  'Vermelho': '#ef4444',
  'Turquesa': '#14b8a6',
  'Índigo': '#6366f1',
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState('#7162f0')
  const [themeName, setThemeName] = useState('Roxo (Padrão)')

  // Carregar tema do localStorage ao montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-name')
    const savedColor = localStorage.getItem('theme-color')

    if (savedTheme && savedColor) {
      setThemeName(savedTheme)
      setPrimaryColor(savedColor)
    }
  }, [])

  // Atualizar CSS custom property quando a cor mudar
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor)
  }, [primaryColor])

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color)
    localStorage.setItem('theme-color', color)
  }

  const handleSetThemeName = (name: string) => {
    setThemeName(name)
    localStorage.setItem('theme-name', name)
  }

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        setPrimaryColor: handleSetPrimaryColor,
        themeName,
        setThemeName: handleSetThemeName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
