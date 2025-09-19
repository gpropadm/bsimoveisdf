'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FavoriteButton from '@/components/FavoriteButton'
import { useSettings } from '@/hooks/useSettings'

interface Property {
  id: string
  title: string
  type: string
  price: number
  address: string
  city: string
  state: string
  category: string
  totalArea: number
  cultivatedArea: number
  pastures: number
  images: string
  slug: string
  featured: boolean
}

interface Filters {
  state: string
  priceMin: string
  priceMax: string
  areaMin: string
  areaMax: string
}

export default function FazendasPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState('newest')
  const { settings } = useSettings()

  const [filters, setFilters] = useState<Filters>({
    state: '',
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [properties, filters, sortBy])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties/fazendas')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Erro ao buscar fazendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...properties]

    // Aplicar filtros
    if (filters.state) {
      filtered = filtered.filter(p => p.state.toLowerCase().includes(filters.state.toLowerCase()))
    }
    if (filters.priceMin) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.priceMin))
    }
    if (filters.priceMax) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.priceMax))
    }
    if (filters.areaMin) {
      filtered = filtered.filter(p => p.totalArea >= parseInt(filters.areaMin))
    }
    if (filters.areaMax) {
      filtered = filtered.filter(p => p.totalArea <= parseInt(filters.areaMax))
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'area-small':
        filtered.sort((a, b) => (a.totalArea || 0) - (b.totalArea || 0))
        break
      case 'area-large':
        filtered.sort((a, b) => (b.totalArea || 0) - (a.totalArea || 0))
        break
      default:
        filtered.sort((a, b) => b.featured ? 1 : -1)
    }

    setFilteredProperties(filtered)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      state: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando fazendas...</p>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Fazendas à Venda</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'fazenda encontrada' : 'fazendas encontradas'}
            </p>

            {/* View Mode and Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="area-small">Menor área</option>
                  <option value="area-large">Maior área</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="4" rx="1"/>
                    <rect x="3" y="12" width="18" height="4" rx="1"/>
                    <rect x="3" y="20" width="18" height="4" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Limpar filtros
                </button>
              </div>

              <div className="space-y-6">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    placeholder="Digite o estado"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      placeholder="Preço mín."
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      placeholder="Preço máx."
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área Total (hectares)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={filters.areaMin}
                      onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                      placeholder="Área mín."
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                      type="number"
                      value={filters.areaMax}
                      onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                      placeholder="Área máx."
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="flex-1">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Nenhuma fazenda encontrada
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Tente ajustar os filtros ou limpe todos os filtros para ver mais opções.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className={viewMode === 'list' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                {filteredProperties.map((property) => {
                  let imageUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

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
                    <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        <div className="w-80 h-48 flex-shrink-0 relative">
                          <img
                            src={imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <FavoriteButton propertyId={property.id} propertyTitle={property.title} size="small" variant="card" />
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                              FAZENDA
                            </span>
                          </div>
                          {property.featured && (
                            <div className="absolute top-3 right-3 bg-yellow-500 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                              Destaque
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {property.title}
                            </h3>
                            <p className="text-2xl font-bold text-teal-600">
                              R$ {property.price.toLocaleString('pt-BR')}
                            </p>
                          </div>

                          <p className="text-gray-600 mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {property.address}, {property.city} - {property.state}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            {property.totalArea && (
                              <span className="flex items-center gap-1">
                                <img src="/icons/icons8-measure-32.png" alt="Área" className="w-4 h-4 opacity-60" />
                                <span>{property.totalArea.toLocaleString('pt-BR')} hectares</span>
                              </span>
                            )}
                            {property.cultivatedArea && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                                <span>{property.cultivatedArea.toLocaleString('pt-BR')} ha cultivados</span>
                              </span>
                            )}
                            {property.pastures && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                                <span>{property.pastures.toLocaleString('pt-BR')} ha pastagens</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 capitalize bg-green-100 px-2 py-1 rounded">
                              {property.category}
                            </span>
                            <Link
                              href={`/imovel/${property.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-teal-600 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
                            >
                              Ver Detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}