'use client'

import { createContext, useContext, useState } from 'react'

// Context para compartilhar estado do mapa
const MapContext = createContext<{
  showMap: boolean
  setShowMap: (show: boolean) => void
} | null>(null)

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapContext deve ser usado dentro de MapProvider')
  }
  return context
}

// Provider para o contexto do mapa
export function MapProvider({ children }: { children: React.ReactNode }) {
  const [showMap, setShowMap] = useState(true)

  return (
    <MapContext.Provider value={{ showMap, setShowMap }}>
      {children}
    </MapContext.Provider>
  )
}