'use client'

import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { toast } from 'react-toastify'
import HeartIcon from './HeartIcon'

interface FavoriteButtonProps {
  propertyId: string
  propertyTitle?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'card' | 'page'
  className?: string
}

export default function FavoriteButton({ 
  propertyId,
  size = 'medium', 
  variant = 'card',
  className = '' 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()
  const [isToggling, setIsToggling] = useState(false)

  // Não renderizar até carregar os dados do localStorage
  if (!isLoaded) {
    return null
  }

  const isFav = isFavorite(propertyId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegar quando clicado em cards com links
    e.stopPropagation()

    // Prevenir cliques duplos
    if (isToggling) return

    setIsToggling(true)
    const wasAlreadyFavorite = isFav

    try {
      toggleFavorite(propertyId)

      // Mostrar notificação
      if (wasAlreadyFavorite) {
        toast.info('Imóvel removido dos favoritos!')
      } else {
        toast.success('Imóvel adicionado aos favoritos!')
      }
    } finally {
      // Pequeno delay para evitar cliques múltiplos muito rápidos
      setTimeout(() => {
        setIsToggling(false)
      }, 300)
    }
  }

  // Configurações de tamanho
  const sizeClasses = {
    small: 'w-10 h-10 text-lg',
    medium: 'w-12 h-12 text-xl',
    large: 'w-14 h-14 text-2xl'
  }

  // Configurações de variante
  const variantClasses = {
    card: '',
    page: ''
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${variant === 'page' ? 'rounded-full' : ''} 
        flex items-center justify-center
        transition-colors duration-300 focus:outline-none focus:ring-0 cursor-pointer
        ${variant === 'page' ? 'border border-gray-200' : ''} 
        group relative
        ${className}
      `}
      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      type="button"
    >
      <HeartIcon
        size={variant === 'card' ? 20 : 24}
        filled={isFav}
        color={isFav ? '#ef4444' : '#9ca3af'}
        className={`transition-colors duration-300 ${!isFav ? 'group-hover:stroke-red-400' : ''}`}
      />
      
    </button>
  )
}