'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  address: string
  city?: string
  state?: string
  price: number
  type: string
  category?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  description?: string
  status: string
  images?: string
  featured?: boolean
  createdAt?: string
  slug?: string
}

export default function AdminProperties() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    fetchProperties()
  }, [status, router])

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

      // Remover o imóvel da lista local
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#7360ee] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900">ImobiNext</h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:relative z-50 lg:z-auto w-64 ${
        isSidebarOpen ? 'lg:w-64' : 'lg:w-16'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full lg:h-auto inset-y-0 left-0`}>
        {/* Logo/Header - Hidden on mobile */}
        <div className="hidden lg:block p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#7360ee] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">ImobiNext</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          
          <Link href="/admin/properties" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-[#7360ee]/10 text-[#7360ee] border border-[#7360ee]/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            {isSidebarOpen && <span className="font-medium">Imóveis</span>}
          </Link>
          
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            {isSidebarOpen && <span>Usuários</span>}
          </Link>
          
          <Link href="/admin/analytics" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            {isSidebarOpen && <span>Analytics</span>}
          </Link>
          
          <Link href="/admin/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            {isSidebarOpen && <span>Configurações</span>}
          </Link>
        </nav>

        {/* Toggle Button - Desktop only */}
        <div className="hidden lg:block p-4 border-t border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}>
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Gerenciar Imóveis</h1>
              <p className="text-gray-600 text-sm lg:text-base">Visualize e edite todos os imóveis cadastrados</p>
            </div>
            <Link href="/admin/properties/new" className="bg-[#7360ee] hover:bg-[#7360ee]/90 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm lg:text-base">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Novo Imóvel</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Todos os Imóveis ({properties.length})
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Filtrar
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imóvel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <PropertyImage images={property.images} title={property.title} />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.address}, {property.city} - {property.state}
                        </div>
                        <div className="text-xs text-gray-400">
                          {property.bedrooms}q • {property.bathrooms}b • {property.area}m²
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {property.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        property.type === 'venda' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {property.price.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {property.featured ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⭐ Destaque
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.createdAt ? new Date(property.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link 
                        href={`/imovel/${property.slug}`} 
                        className="text-[#7360ee] hover:text-[#7360ee]/80"
                        target="_blank"
                      >
                        Ver
                      </Link>
                      <Link 
                        href={`/admin/properties/${property.id}/edit`} 
                        className="text-green-600 hover:text-green-900"
                      >
                        Editar
                      </Link>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        disabled={deleting === property.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === property.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {properties.map((property) => (
              <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex space-x-4">
                  <PropertyImage images={property.images} title={property.title} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 truncate">{property.title}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          {property.address}, {property.city} - {property.state}
                        </p>
                        <p className="text-xs text-gray-400">
                          {property.bedrooms}q • {property.bathrooms}b • {property.area}m²
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                          {property.category}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          property.type === 'venda' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {property.type}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">
                          R$ {property.price.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <div className="flex space-x-2 pt-2 border-t border-gray-100">
                        <Link 
                          href={`/imovel/${property.slug}`} 
                          className="flex-1 text-center px-3 py-2 text-xs font-medium text-[#7360ee] bg-[#7360ee]/10 rounded-lg hover:bg-[#7360ee]/20"
                          target="_blank"
                        >
                          Ver
                        </Link>
                        <Link 
                          href={`/admin/properties/${property.id}/edit`} 
                          className="flex-1 text-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                        >
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(property.id)}
                          disabled={deleting === property.id}
                          className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === property.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}