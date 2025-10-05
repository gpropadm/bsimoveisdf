'use client'

import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'
import { formatAreaDisplay } from '@/lib/maskUtils'

interface Property {
  id: string
  title: string
  slug: string
  address: string
  city: string
  state: string
  price: number
  type: 'venda' | 'aluguel'
  category?: string
  bedrooms?: number
  bathrooms?: number
  parking?: number
  area?: number
  images?: string[]
  video?: string
}

interface PropertyCardProps {
  property: Property
  onOpenVideo?: (property: Property) => void
}

export default function PropertyCard({ property, onOpenVideo }: PropertyCardProps) {
  let imageUrl = null
  let hasImages = false

  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    imageUrl = property.images[0]
    hasImages = true
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {hasImages && imageUrl ? (
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-gray-500">Foto do imóvel</span>
            </div>
          )}
          

          {/* Ícone de Shorts no canto inferior direito da foto - só aparece se tem vídeo */}
          {property.video && onOpenVideo && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onOpenVideo(property)
              }}
              className="absolute bottom-3 right-3 transition-all duration-300 group cursor-pointer"
              title="Ver vídeo do imóvel"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
                <rect x="-1" y="4" width="20" height="8" rx="4" fill="#FF0000" transform="rotate(120 12 12)"/>
                <rect x="2" y="12" width="20" height="8" rx="4" fill="#FF0000" transform="rotate(120 12 12)"/>
                <polygon points="9,8 9,16 17,12" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5"/>
              </svg>
            </button>
          )}
        </div>
        <div className="p-4">
          {/* Header com tipo e coração - estilo Arbo */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 capitalize">
              {property.category || 'Imóvel'}
            </span>
            <FavoriteButton
              propertyId={property.id}
              propertyTitle={property.title}
              size="small"
              variant="card"
            />
          </div>

          {/* Título do imóvel - estilo Arbo */}
          <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-1">
            {property.title}
          </h3>

          {/* Endereço - estilo Arbo */}
          <p className="text-sm text-gray-600 mb-4">
            {property.address && (
              <span>{property.address} - </span>
            )}
            <span>{property.city}</span>
            <br />
            <span>{property.city} - {property.state}</span>
          </p>

          {/* Ícones de características - estilo Arbo */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <div style={{ display: 'flex', flexDirection: 'row', gap: '32px' }} className="text-sm text-gray-600">
              {property.area && property.area > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="font-semibold text-gray-800">{formatAreaDisplay(property.area)}</span>
                  <span className="text-xs">Útil</span>
                </div>
              )}
              {property.bedrooms && property.bedrooms > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="font-semibold text-gray-800">{property.bedrooms}</span>
                  <span className="text-xs">Quartos</span>
                </div>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className="font-semibold text-gray-800">{property.bathrooms}</span>
                  <span className="text-xs">Banheiros</span>
                </div>
              )}
            </div>
          </div>

          {/* Preços - estilo Arbo */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">
                {property.type === 'venda' ? 'Venda' : 'Aluguel'}
              </span>
              <Link
                href={`/imovel/${property.slug}`}
                className="text-lg font-bold text-blue-600 hover:text-blue-800 underline"
              >
                R$ {property.price.toLocaleString('pt-BR')}
              </Link>
            </div>

            {/* Botão Ver Detalhes */}
            <Link
              href={`/imovel/${property.slug}`}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Detalhes
            </Link>
          </div>
        </div>
      </div>
  )
}