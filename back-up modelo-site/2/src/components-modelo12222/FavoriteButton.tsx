'use client'

import { useFavorites } from '@/hooks/useFavorites'
import { useToast } from '@/contexts/ToastContext'

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
  const { showSuccess, showInfo } = useToast()

  // Não renderizar até carregar os dados do localStorage
  if (!isLoaded) {
    return null
  }

  const isFav = isFavorite(propertyId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegar quando clicado em cards com links
    e.stopPropagation()
    
    const wasAlreadyFavorite = isFav
    toggleFavorite(propertyId)
    
    // Mostrar notificação
    if (wasAlreadyFavorite) {
      showInfo('Imóvel removido dos favoritos!')
    } else {
      showSuccess('Imóvel adicionado aos favoritos!')
    }
  }

  // Configurações de tamanho
  const sizeClasses = {
    small: 'w-6 h-6 text-lg',
    medium: 'w-8 h-8 text-xl',
    large: 'w-10 h-10 text-2xl'
  }

  // Configurações de variante
  const variantClasses = {
    card: '',
    page: 'bg-gray-100 hover:bg-gray-200'
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${variant === 'page' ? 'rounded-full' : ''} 
        flex items-center justify-center
        transition-all duration-300 transform hover:scale-110 active:scale-95
        ${variant === 'page' ? 'border border-gray-200' : ''} 
        group relative
        ${className}
      `}
      title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      type="button"
    >
      <svg 
        className={`transition-all duration-300 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400 group-hover:text-red-400'}`}
        width={variant === 'card' ? "18" : "20"} 
        height={variant === 'card' ? "18" : "20"} 
        viewBox="0 0 24 24" 
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      
      {/* Animação de "pop" quando favorita */}
      {isFav && variant === 'card' && (
        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
      )}
    </button>
  )
}