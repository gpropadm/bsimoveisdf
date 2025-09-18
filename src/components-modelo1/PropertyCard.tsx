'use client'

import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from '@/components/FavoriteButton'

interface Property {
  id: string
  title: string
  slug: string
  address: string
  city: string
  state: string
  price: number
  type: 'venda' | 'aluguel'
  bedrooms?: number
  bathrooms?: number
  parking?: number
  area?: number
  images?: string[]
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
    <Link href={`/imovel/${property.slug}`} target="_blank" rel="noopener noreferrer" className="group">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
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
          
          {/* Badge do tipo */}
          <div className={`absolute top-3 right-3 text-white w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'}`}>
            {property.type === 'venda' ? 'V' : 'A'}
          </div>

          {/* Ícone de Shorts no canto inferior direito da foto */}
          {onOpenVideo && (
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
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-medium text-gray-400 group-hover:text-blue-600 transition-colors flex-1 mr-2">
              {property.title}
            </h3>
            {/* Botão de Favorito */}
            <FavoriteButton 
              propertyId={property.id}
              propertyTitle={property.title}
              size="small"
              variant="card"
            />
          </div>
          <p className="text-gray-600 text-sm mb-3">
            {property.address}, {property.city} - {property.state}
          </p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-gray-800">
              R$ {property.price.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-sm text-gray-500">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1h4c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-4v-2h4v-3h-2v-2z"/>
                </svg>
                <span>{property.bedrooms} quartos</span>
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 20h3c0 1.11-.89 2-2 2s-2-.89-2-2zm8 0c0 1.11-.89 2-2 2s-2-.89-2-2h4zm2-5v3H6v-3c0-3.53 2.61-6.43 6-6.92V6h-1c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1h-1v2.08c3.39.49 6 3.39 6 6.92z"/>
                </svg>
                <span>{property.bathrooms} banheiros</span>
              </span>
            )}
            {property.parking && (
              <span className="flex items-center gap-1">
                <img src="/icons/icons8-hennessey-venom-30.png" alt="Vagas" className="w-4 h-4 opacity-60" />
                <span>{property.parking} vagas</span>
              </span>
            )}
            {property.area && property.area > 0 && (
              <span className="flex items-center gap-1">
                <img src="/icons/icons8-measure-32.png" alt="Área" className="w-4 h-4 opacity-60" />
                <span>{property.area}m²</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}