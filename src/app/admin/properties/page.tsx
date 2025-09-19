'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { getFirstImage } from '@/lib/imageUtils'
import { formatAreaDisplay } from '@/lib/maskUtils'
import { toast } from 'react-toastify'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Componente para exibir imagem da propriedade
function PropertyImage({ images, title }: { images?: string; title: string }) {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const firstImage = getFirstImage(images)

  if (firstImage === '/placeholder-house.jpg') {
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

function getStatusBadge(status: string) {
  const statusConfig = {
    'disponivel': {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      label: 'Disponível'
    },
    'vendido': {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Vendido'
    },
    'alugado': {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Alugado'
    },
    'reservado': {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Reservado'
    },
    'indisponivel': {
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Indisponível'
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['disponivel']

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
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
      toast.success('Imóvel excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir imóvel. Tente novamente.')
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
                  <span>{formatAreaDisplay(property.area)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getStatusBadge(property.status)}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${
                    property.type === 'venda'
                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}>
                    {property.type === 'venda' ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    )}
                    {property.type === 'venda' ? 'Venda' : 'Aluguel'}
                  </span>
                  {property.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Destaque
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Link
                  href={`/admin/properties/${property.id}/edit`}
                  className="text-gray-400 hover:text-gray-600"
                  title="Editar imóvel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(property.id)}
                  disabled={deleting === property.id}
                  className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="Excluir imóvel"
                >
                  {deleting === property.id ? (
                    <div className="animate-spin w-4 h-4 border border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
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
                      <div>{formatAreaDisplay(property.area)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {getStatusBadge(property.status)}
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${
                            property.type === 'venda'
                              ? 'bg-violet-50 text-violet-700 border-violet-200'
                              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          }`}>
                            {property.type === 'venda' ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                            )}
                            {property.type === 'venda' ? 'Venda' : 'Aluguel'}
                          </span>
                          {property.featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="text-gray-400 hover:text-gray-600"
                          title="Editar imóvel"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          disabled={deleting === property.id}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="Excluir imóvel"
                        >
                          {deleting === property.id ? (
                            <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
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