'use client'

import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'imobiliaria_favorites'

// Estado global compartilhado mais robusto
let globalFavorites: string[] = []
let globalListeners: Set<(favorites: string[]) => void> = new Set()
let isInitialized = false

// Função para notificar todos os listeners com debounce
let notifyTimeout: NodeJS.Timeout | null = null
const notifyListeners = (newFavorites: string[]) => {
  globalFavorites = [...newFavorites] // Cria nova referência

  // Salva no localStorage imediatamente
  saveFavoritesToStorage(newFavorites)

  // Debounce para evitar múltiplas notificações
  if (notifyTimeout) {
    clearTimeout(notifyTimeout)
  }

  notifyTimeout = setTimeout(() => {
    globalListeners.forEach(listener => {
      try {
        listener([...newFavorites])
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }, 50)
}

// Carregar favoritos do localStorage
const loadFavoritesFromStorage = (): string[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    const favorites = stored ? JSON.parse(stored) : []
    return Array.isArray(favorites) ? favorites : []
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error)
    return []
  }
}

// Salvar favoritos no localStorage
const saveFavoritesToStorage = (favorites: string[]) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    // Disparar evento para sincronizar entre tabs
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites }))
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error)
  }
}

// Inicializar estado global uma única vez
const initializeGlobalState = () => {
  if (!isInitialized && typeof window !== 'undefined') {
    globalFavorites = loadFavoritesFromStorage()
    isInitialized = true
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Inicializar estado global e carregar favoritos iniciais
  useEffect(() => {
    initializeGlobalState()
    setFavorites([...globalFavorites])
    setIsLoaded(true)
  }, [])

  // Listener para mudanças globais
  useEffect(() => {
    const listener = (newFavorites: string[]) => {
      setFavorites([...newFavorites])
    }

    globalListeners.add(listener)

    return () => {
      globalListeners.delete(listener)
    }
  }, [])

  // Escutar mudanças de outras abas/janelas
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY && e.newValue) {
        try {
          const newFavorites = JSON.parse(e.newValue)
          if (Array.isArray(newFavorites)) {
            globalFavorites = [...newFavorites]
            globalListeners.forEach(listener => listener([...newFavorites]))
          }
        } catch (error) {
          console.error('Erro ao sincronizar favoritos:', error)
        }
      }
    }

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent
      if (Array.isArray(customEvent.detail)) {
        // Não notificar novamente se veio do mesmo contexto
        globalFavorites = [...customEvent.detail]
        globalListeners.forEach(listener => listener([...customEvent.detail]))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('favoritesChanged', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('favoritesChanged', handleCustomEvent)
    }
  }, [])

  // Verificar se um imóvel está nos favoritos
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favorites.includes(propertyId)
  }, [favorites])

  // Toggle favorito (adiciona se não tiver, remove se tiver)
  const toggleFavorite = useCallback((propertyId: string) => {
    initializeGlobalState()
    const newFavorites = globalFavorites.includes(propertyId)
      ? globalFavorites.filter(id => id !== propertyId)
      : [...globalFavorites, propertyId]

    notifyListeners(newFavorites)
  }, [])

  // Adicionar aos favoritos
  const addToFavorites = useCallback((propertyId: string) => {
    initializeGlobalState()
    if (!globalFavorites.includes(propertyId)) {
      const newFavorites = [...globalFavorites, propertyId]
      notifyListeners(newFavorites)
    }
  }, [])

  // Remover dos favoritos
  const removeFromFavorites = useCallback((propertyId: string) => {
    initializeGlobalState()
    const newFavorites = globalFavorites.filter(id => id !== propertyId)
    notifyListeners(newFavorites)
  }, [])

  // Limpar todos os favoritos
  const clearFavorites = useCallback(() => {
    notifyListeners([])
  }, [])

  return {
    favorites,
    isLoaded,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }
}