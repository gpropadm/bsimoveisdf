'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { toast } from 'react-toastify'
import marketplaceAPI from '@/lib/marketplace-api'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Componente para exibir imagem da propriedade
function PropertyImage({ images, title }: { images?: string[]; title: string }) {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const firstImage = images && images.length > 0 ? images[0] : null

  if (!firstImage) {
    return <PlaceholderIcon />
  }

  return (
    <div className="w-20 h-20 bg-gray-200 rounded-sm overflow-hidden">
      {!showPlaceholder ? (
        <img
          src={firstImage}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setShowPlaceholder(true)}
        />
      ) : (
        <PlaceholderIcon />
      )}
    </div>
  )
}

function PlaceholderIcon() {
  return (
    <div className="w-20 h-20 bg-gray-200 rounded-sm overflow-hidden">
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
    </div>
  )
}

interface MarketplaceProperty {
  id: string
  imovelIdOriginal: string
  imobiliariaId: string
  imobiliaria?: {
    id: string
    nome: string
    city: string
  }
  dados: {
    titulo: string
    preco: number
    type: string
    category: string
    city: string
    state: string
    address?: string
    bedrooms?: number
    bathrooms?: number
    area?: number
    images?: string[]
    description?: string
  }
  createdAt: string
  updatedAt: string
}

export default function MarketplaceParceirosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<MarketplaceProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    minPrice: '',
    maxPrice: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      loadProperties()
    }
  }, [status])

  const loadProperties = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando imóveis de parceiros...')

      const filterParams: any = {}
      if (filters.type) filterParams.type = filters.type
      if (filters.city) filterParams.city = filters.city
      if (filters.minPrice) filterParams.minPrice = Number(filters.minPrice)
      if (filters.maxPrice) filterParams.maxPrice = Number(filters.maxPrice)

      const response = await marketplaceAPI.listarImoveisParceiros(filterParams)
      console.log('✅ Imóveis recebidos:', response)

      setProperties(response.imoveis || [])

      if (response.imoveis && response.imoveis.length > 0) {
        toast.success(`${response.imoveis.length} imóveis de parceiros encontrados`)
      } else {
        toast.info('Nenhum imóvel de parceiros encontrado')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar imóveis:', error)
      toast.error('Erro ao buscar imóveis de parceiros')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const applyFilters = () => {
    loadProperties()
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      city: '',
      minPrice: '',
      maxPrice: ''
    })
    setTimeout(loadProperties, 100)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'venda': 'Venda',
      'aluguel': 'Aluguel',
      'temporada': 'Temporada'
    }
    return types[type] || type
  }

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'terreno': 'Terreno',
      'comercial': 'Comercial',
      'rural': 'Rural',
      'flat': 'Flat',
      'kitnet': 'Kitnet',
      'sobrado': 'Sobrado',
      'cobertura': 'Cobertura',
      'studio': 'Studio'
    }
    return categories[category] || category
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Imóveis de Parceiros</h1>
            <p className="text-gray-600 mt-1">
              Imóveis disponíveis no marketplace regional
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
                <option value="temporada">Temporada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Ex: Brasília"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Mínimo
              </label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="R$ 0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Máximo
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="R$ 999999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de Imóveis */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando imóveis de parceiros...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum imóvel encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Não há imóveis de parceiros disponíveis no momento.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imóvel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imobiliária
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <PropertyImage images={property.dados.images} title={property.dados.titulo} />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.dados.titulo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getCategoryLabel(property.dados.category)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {property.imobiliaria?.nome || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {property.imobiliaria?.city || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {getTypeLabel(property.dados.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{property.dados.city}</div>
                        <div className="text-xs text-gray-500">{property.dados.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(property.dados.preco)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          {property.dados.bedrooms && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                              {property.dados.bedrooms}
                            </div>
                          )}
                          {property.dados.bathrooms && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                              </svg>
                              {property.dados.bathrooms}
                            </div>
                          )}
                          {property.dados.area && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                              {property.dados.area}m²
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Total: <span className="font-medium">{properties.length}</span> imóveis encontrados
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
