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
}

export default function PropertyCard({ property }: PropertyCardProps) {
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
          <div className={`absolute top-3 right-3 text-white px-2 py-1 rounded text-sm font-medium capitalize ${property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'}`}>
            {property.type}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 mr-2">
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
            <span className={`text-2xl font-bold ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>
              R$ {property.price.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-sm text-gray-500">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <img src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-4 h-4 opacity-60" />
                <span>{property.bedrooms} quartos</span>
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <img src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-4 h-4 opacity-60" />
                <span>{property.bathrooms} banheiros</span>
              </span>
            )}
            {property.parking && (
              <span className="flex items-center gap-1">
                <img src="/icons/icons8-hennessey-venom-30.png" alt="Vagas" className="w-4 h-4 opacity-60" />
                <span>{property.parking} vagas</span>
              </span>
            )}
            {property.area && (
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