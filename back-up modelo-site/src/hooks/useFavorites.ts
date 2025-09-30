'use client'

import { useState, useEffect } from 'react'

const FAVORITES_KEY = 'imobiliaria_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar favoritos do localStorage quando o componente montar
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Salvar favoritos no localStorage quando a lista mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Erro ao salvar favoritos:', error)
      }
    }
  }, [favorites, isLoaded])

  // Verificar se um imóvel está nos favoritos
  const isFavorite = (propertyId: string): boolean => {
    return favorites.includes(propertyId)
  }

  // Adicionar aos favoritos
  const addToFavorites = (propertyId: string) => {
    setFavorites(prev => {
      if (!prev.includes(propertyId)) {
        return [...prev, propertyId]
      }
      return prev
    })
  }

  // Remover dos favoritos
  const removeFromFavorites = (propertyId: string) => {
    setFavorites(prev => prev.filter(id => id !== propertyId))
  }

  // Toggle favorito (adiciona se não tiver, remove se tiver)
  const toggleFavorite = (propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFromFavorites(propertyId)
    } else {
      addToFavorites(propertyId)
    }
  }

  // Limpar todos os favoritos
  const clearFavorites = () => {
    setFavorites([])
  }

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