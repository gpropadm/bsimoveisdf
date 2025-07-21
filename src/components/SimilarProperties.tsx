'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'

interface Property {
  id: string
  title: string
  slug: string
  price: number
  type: string
  address: string
  city: string
  state: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  images?: string
}

interface SimilarPropertiesProps {
  currentPropertyId: string
  city: string
  price: number
  type: string
  showAsSlider?: boolean
  limit?: number
  showTitle?: boolean
}

export default function SimilarProperties({ 
  currentPropertyId, 
  city, 
  price, 
  type,
  showAsSlider = false,
  limit = 4,
  showTitle = false
}: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        // Calcular faixa de preço (±30% do preço atual)
        const minPrice = price * 0.7
        const maxPrice = price * 1.3

        const response = await fetch(
          `/api/properties/similar?city=${encodeURIComponent(city)}&minPrice=${minPrice}&maxPrice=${maxPrice}&type=${type}&exclude=${currentPropertyId}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setProperties(data.slice(0, limit))
        } else {
          console.error('Erro na API similar properties:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('Resposta da API:', errorText)
        }
      } catch (error) {
        console.error('Erro ao buscar imóveis similares:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProperties()
  }, [currentPropertyId, city, price, type])

  if (loading) {
    if (showAsSlider) return null // No loading for slider mode
    
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Você poderá gostar dessas opções!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return null // Não mostrar nada quando não houver imóveis similares
  }

  if (showAsSlider) {
    if (showTitle) {
      return (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Você poderá gostar</h2>
              <p className="text-gray-600">Outros imóveis em {city}</p>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {properties.map((property) => {
                  let imageUrl = null
                  let hasImages = false
                  
                  try {
                    if (property.images && typeof property.images === 'string') {
                      const parsedImages = JSON.parse(property.images)
                      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                        imageUrl = parsedImages[0]
                        hasImages = true
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing images for property:', property.title, error)
                  }

                  return (
                    <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
                      <div className="w-80 bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow flex-shrink-0">
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
                              <span className="text-gray-500 text-sm">Foto do imóvel</span>
                            </div>
                          )}
                          
                          {/* Badge do tipo */}
                          <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-sm font-medium capitalize ${property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'}`}>
                            {property.type}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 mr-2 line-clamp-2">
                              {property.title}
                            </h3>
                            <FavoriteButton 
                              propertyId={property.id}
                              propertyTitle={property.title}
                              size="small"
                              variant="card"
                            />
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                            {property.address}, {property.city}
                          </p>
                          
                          <div className="mb-4">
                            <span className={`text-2xl font-bold ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>
                              R$ {property.price.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          
                          <div className="flex gap-3 text-sm text-gray-500">
                            {property.bedrooms && (
                              <span className="flex items-center gap-1">
                                <Image src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-4 h-4" width={16} height={16} />
                                {property.bedrooms}
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="flex items-center gap-1">
                                <Image src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-4 h-4" width={16} height={16} />
                                {property.bathrooms}
                              </span>
                            )}
                            {property.area && (
                              <span className="flex items-center gap-1">
                                <Image src="/icons/icons8-measure-32.png" alt="Área" className="w-4 h-4" width={16} height={16} />
                                {property.area}m²
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
          {properties.map((property) => {
            let imageUrl = null
            let hasImages = false
            
            try {
              if (property.images && typeof property.images === 'string') {
                const parsedImages = JSON.parse(property.images)
                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                  imageUrl = parsedImages[0]
                  hasImages = true
                }
              }
            } catch (error) {
              console.error('Error parsing images for property:', property.title, error)
            }

            return (
              <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
                <div className="w-80 bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow flex-shrink-0">
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
                        <span className="text-gray-500 text-sm">Foto do imóvel</span>
                      </div>
                    )}
                    
                    {/* Badge do tipo */}
                    <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-sm font-medium capitalize ${property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'}`}>
                      {property.type}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 mr-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <FavoriteButton 
                        propertyId={property.id}
                        propertyTitle={property.title}
                        size="small"
                        variant="card"
                      />
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                      {property.address}, {property.city}
                    </p>
                    
                    <div className="mb-4">
                      <span className={`text-2xl font-bold ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>
                        R$ {property.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex gap-3 text-sm text-gray-500">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-4 h-4" width={16} height={16} />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-4 h-4" width={16} height={16} />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-measure-32.png" alt="Área" className="w-4 h-4" width={16} height={16} />
                          {property.area}m²
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Você poderá gostar dessas opções!
          </h2>
          <p className="text-gray-600">
            Outros imóveis em {city} com valores similares
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => {
            let imageUrl = null
            let hasImages = false
            
            try {
              if (property.images && typeof property.images === 'string') {
                const parsedImages = JSON.parse(property.images)
                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                  imageUrl = parsedImages[0]
                  hasImages = true
                }
              }
            } catch (error) {
              console.error('Error parsing images for property:', property.title, error)
            }

            return (
              <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
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
                        <span className="text-gray-500 text-sm">Foto do imóvel</span>
                      </div>
                    )}
                    
                    {/* Badge do tipo */}
                    <div className={`absolute top-2 right-2 text-white px-2 py-1 rounded text-xs font-medium capitalize ${property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'}`}>
                      {property.type}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 mr-2 line-clamp-2">
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
                    
                    <p className="text-gray-600 text-xs mb-2 line-clamp-1">
                      {property.address}, {property.city}
                    </p>
                    
                    <div className="mb-2">
                      <span className={`text-lg font-bold ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>
                        R$ {property.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 text-xs text-gray-500">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-3 h-3" width={12} height={12} />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-3 h-3" width={12} height={12} />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1">
                          <Image src="/icons/icons8-measure-32.png" alt="Área" className="w-3 h-3" width={12} height={12} />
                          {property.area}m²
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}