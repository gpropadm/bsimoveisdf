'use client'

import { useState } from 'react'
import { useTheme, themeColors } from '@/contexts/ThemeContext'

export default function ThemeSelector() {
  const { primaryColor, setPrimaryColor, themeName, setThemeName } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleColorSelect = (name: string, color: string) => {
    setThemeName(name)
    setPrimaryColor(color)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
      >
        <span>Escolher Cor do Site</span>
        <div
          className="w-4 h-4 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: primaryColor }}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[250px]">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Escolha a cor do site</h3>
            <div className="space-y-2">
              {Object.entries(themeColors).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => handleColorSelect(name, color)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    themeName === name ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                  </div>
                  {themeName === name && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
