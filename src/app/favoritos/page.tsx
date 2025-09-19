'use client'

import { useState, useEffect } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import FavoriteButton from '@/components/FavoriteButton'
import ShareButton from '@/components/ShareButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSettings } from '@/hooks/useSettings'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  type: string
  price: number
  address: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  parking: number
  area: number
  images: string
  slug: string
}

export default function FavoritesPage() {
  const { favorites, isLoaded, favoritesCount } = useFavorites()
  const { settings } = useSettings()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && favorites.length > 0) {
      fetchFavoriteProperties()
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, favorites])

  const fetchFavoriteProperties = async () => {
    try {
      console.log('🔍 Buscando favoritos:', favorites)
      const response = await fetch('/api/properties/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favoriteIds: favorites }),
      })

      console.log('📡 Resposta da API:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dados recebidos:', data)
        setProperties(data.properties || [])
      } else {
        console.error('❌ Erro na API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar propriedades favoritas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header settings={settings} />
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando favoritos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header settings={settings} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Meus Favoritos</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              {favoritesCount} {favoritesCount === 1 ? 'imóvel salvo' : 'imóveis salvos'}
            </p>
            <Link 
              href="/imoveis"
              className="border border-teal-600 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              Ver Todos os Imóveis
            </Link>
          </div>
        </div>
        {favoritesCount === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nenhum imóvel favorito
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Você ainda não adicionou nenhum imóvel aos seus favoritos. 
              Explore nossos imóveis e salve os que mais gostar!
            </p>
            <Link 
              href="/imoveis"
              className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              Explorar Imóveis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => {
              let imageUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
              
              try {
                if (property.images && typeof property.images === 'string') {
                  const parsedImages = JSON.parse(property.images)
                  if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                    imageUrl = parsedImages[0]
                  }
                }
              } catch (error) {
                console.error('Erro ao fazer parse das imagens:', error)
              }

              return (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <FavoriteButton propertyId={property.id} size="medium" variant="card" />
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.type === 'venda' 
                          ? 'bg-teal-100 text-teal-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {property.type === 'venda' ? 'V' : 'A'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <ShareButton property={property} />
                    </div>
                  </div>
                
                <div className="p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {property.address}, {property.city} - {property.state}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-4 h-4 opacity-60" />
                        <span>{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""} quartos</span>
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-4 h-4 opacity-60" />
                        <span>{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""} banheiros</span>
                      </span>
                    )}
                    {property.parking && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/icons8-hennessey-venom-30.png" alt="Vagas" className="w-4 h-4 opacity-60" />
                        <span>{property.parking && property.parking > 0 ? property.parking : ""} vagas</span>
                      </span>
                    )}
                    {property.area && property.area > 0 && (
                      <span className="flex items-center gap-1">
                        <img src="/icons/icons8-measure-32.png" alt="Área" className="w-4 h-4 opacity-60" />
                        <span>{property.area && property.area > 0 ? `${property.area && property.area > 0 ? property.area : ""}m²` : ''}</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-700">
                      R$ {property.price.toLocaleString('pt-BR')}
                      {property.type === 'aluguel' && <span className="text-sm font-normal text-gray-500">/mês</span>}
                    </p>
                    <Link 
                      href={`/imovel/${property.slug}`}
                      className="border border-gray-400 hover:border-gray-600 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-transparent cursor-pointer"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}