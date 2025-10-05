'use client'

import { useState } from 'react'
import { Heart, MapPin, Home, Bath, Square } from 'lucide-react'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'

interface Imovel {
  id: number
  title: string
  price: number
  type: string
  category: string
  latitude?: number
  longitude?: number
  images?: string
  address?: string
  city?: string
  state?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  description?: string
}

interface CardImovelProps {
  imovel: Imovel
  isSelected?: boolean
  onClick?: () => void
}

export default function CardImovel({ imovel, isSelected, onClick }: CardImovelProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { isFavorite, toggleFavorite: toggleFavoriteHook } = useFavorites()

  const images = (() => {
    if (!imovel.images) return []

    try {
      // Se for um JSON válido, fazer parse
      return JSON.parse(imovel.images)
    } catch {
      // Se não for JSON, assumir que é uma URL simples
      return [imovel.images]
    }
  })()
  const allImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800']

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    )
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavoriteHook(imovel.id.toString())
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 shadow-xl' : ''
      }`}
      onClick={onClick}
    >
      {/* Imagem */}
      <div className="relative h-64 group">
        <img
          src={allImages[currentImageIndex]}
          alt={imovel.title}
          className="w-full h-full object-cover"
        />

        {/* Navegação de imagens */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.9)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.color = '#1f2937'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                color: '#1f2937'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.9)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.color = '#1f2937'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicadores de imagem */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {allImages.map((_: string, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Botão de favorito */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite(imovel.id.toString()) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
            {imovel.type}
          </span>
          <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
            {imovel.category}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Preço */}
        <div className="mb-2">
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#4f2de8' }}>
            {formatPrice(imovel.price)}
          </span>
          {imovel.type === 'aluguel' && (
            <span className="text-gray-600" style={{ fontSize: '14px' }}>/mês</span>
          )}
        </div>

        {/* Título */}
        <h3 className="mb-2 line-clamp-2" style={{ fontSize: '15px', fontWeight: 600, color: '#333', lineHeight: '1.3' }}>
          {imovel.title}
        </h3>

        {/* Localização */}
        <div className="flex items-center mb-3" style={{ color: '#666' }}>
          <MapPin className="w-4 h-4 mr-1" />
          <span style={{ fontSize: '14px', lineHeight: '1.4' }}>
            {imovel.address}, {imovel.city} - {imovel.state}
          </span>
        </div>

        {/* Características */}
        <div className="mb-4" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          <ul style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            justifyContent: 'space-between'
          }}>
            {imovel.area && (
              <li style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#666',
                flex: 1,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#333', lineHeight: 1 }}>{imovel.area} m²</span>
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#666', lineHeight: 1 }}></span>
              </li>
            )}
            {imovel.bedrooms && (
              <li style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#666',
                flex: 1,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#333', lineHeight: 1 }}>{imovel.bedrooms}</span>
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#666', lineHeight: 1 }}>Quartos</span>
              </li>
            )}
            {imovel.bathrooms && (
              <li style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#666',
                flex: 1,
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#333', lineHeight: 1 }}>{imovel.bathrooms}</span>
                <span style={{ fontSize: '12px', fontWeight: 400, color: '#666', lineHeight: 1 }}>Banheiros</span>
              </li>
            )}
          </ul>
        </div>

        {/* Botão Ver Detalhes */}
        <Link
          href={`/imovel/${imovel.id}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  )
}// Cache bust 1759449090
