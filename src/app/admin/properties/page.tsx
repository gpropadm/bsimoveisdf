'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Componente para exibir imagem da propriedade
function PropertyImage({ images, title }: { images?: string; title: string }) {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  
  if (!images || images === '[]' || images === '') {
    return <PlaceholderIcon />
  }

  try {
    const imageArray = JSON.parse(images)
    const firstImage = Array.isArray(imageArray) && imageArray.length > 0 ? imageArray[0] : null
    
    if (!firstImage) {
      return <PlaceholderIcon />
    }

    return (
      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
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
  } catch (e) {
    return <PlaceholderIcon />
  }
}

function PlaceholderIcon() {
  return (
    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
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

interface Property {
  id: string
  title: string
  slug: string
  description: string
  price: number
  type: string
  status: string
  bedrooms: number
  bathrooms: number
  area: number
  city: string
  state: string
  address: string
  images: string
  featured: boolean
  createdAt: string
}

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    fetchProperties()
  }, [status, router])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties')
      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
      return
    }

    setDeleting(propertyId)
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir imóvel')
      }

      setProperties(prev => prev.filter((property) => property.id !== propertyId))
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir imóvel. Tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7360ee] rounded-xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const actions = (
    <Link
      href="/admin/properties/new"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#7360ee] border border-transparent rounded-lg hover:bg-[#7360ee]/90 focus:ring-4 focus:ring-[#7360ee]/30"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Novo Imóvel
    </Link>
  )

  return (
    <AdminLayout
      title="Imóveis"
      subtitle={`Gerencie seus ${properties.length} imóveis cadastrados`}
      currentPage="properties"
      actions={actions}
    >
      {/* Mobile Cards View */}
      <div className="lg:hidden p-4">
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4 mb-3">
                <PropertyImage images={property.images} title={property.title} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                  <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
                  <p className="text-lg font-bold text-[#7360ee]">
                    R$ {property.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <div className="flex space-x-4">
                  <span>{property.bedrooms}🛏️</span>
                  <span>{property.bathrooms}🚿</span>
                  <span>{property.area}m²</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    property.type === 'venda' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {property.type}
                  </span>
                  {property.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      ⭐ Destaque
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link
                  href={`/admin/properties/${property.id}/edit`}
                  className="text-[#7360ee] hover:text-[#7360ee]/80 text-sm"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(property.id)}
                  disabled={deleting === property.id}
                  className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                >
                  {deleting === property.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}

          {properties.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v4l4-2-4-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-600 mb-4">Comece adicionando seu primeiro imóvel!</p>
              <Link
                href="/admin/properties/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#7360ee] rounded-lg hover:bg-[#7360ee]/90"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Imóvel
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v4l4-2-4-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600 mb-4">Comece adicionando seu primeiro imóvel!</p>
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#7360ee] rounded-lg hover:bg-[#7360ee]/90"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Imóvel
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imóvel
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PropertyImage images={property.images} title={property.title} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {property.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.city}</div>
                      <div className="text-sm text-gray-500">{property.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#7360ee]">
                        R$ {property.price.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{property.bedrooms} quartos</div>
                      <div>{property.bathrooms} banheiros</div>
                      <div>{property.area}m²</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.type === 'venda' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.type}
                        </span>
                        {property.featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="text-[#7360ee] hover:text-[#7360ee]/80"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deleting === property.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleting === property.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}