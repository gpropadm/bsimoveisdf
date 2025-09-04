'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

interface AdminDashboardContentProps {
  session: Session & {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

interface DashboardStats {
  totalProperties: number
  saleProperties: number
  rentalProperties: number
  featuredProperties: number
  totalLeads: number
  newLeads: number
  interestedLeads: number
  convertedLeads: number
}

interface RecentProperty {
  id: string
  title: string
  city: string
  state: string
  price: number
  type: string
  featured: boolean
  createdAt: string
}

interface RecentLead {
  id: string
  name: string
  email?: string
  phone?: string
  propertyTitle?: string
  status: string
  createdAt: string
}

export default function AdminDashboardContent({ session }: AdminDashboardContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    saleProperties: 0,
    rentalProperties: 0,
    featuredProperties: 0,
    totalLeads: 0,
    newLeads: 0,
    interestedLeads: 0,
    convertedLeads: 0
  })
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentProperties(data.recentProperties || [])
        setRecentLeads(data.recentLeads || [])
      } else {
        console.error('Erro na API:', data.error)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
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
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {isSidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>
          
          <Link href="/admin/properties" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            {isSidebarOpen && <span>Imóveis</span>}
          </Link>
          
          <Link href="/admin/leads" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
            {isSidebarOpen && <span>Leads</span>}
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

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo, {session.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Ver Site</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards - Imóveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Total de Imóveis</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M7 12l3 3 7-7"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Para Venda</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.saleProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Para Aluguel</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.rentalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Em Destaque</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.featuredProperties}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Leads */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Total de Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalLeads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Leads Novos</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.newLeads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Interessados</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.interestedLeads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Convertidos</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.convertedLeads}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/properties/new" className="group">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-blue-300">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Novo Imóvel</h3>
                  <p className="text-gray-600 text-sm">Cadastrar novo imóvel no sistema</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/properties" className="group">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-green-300">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <path d="M9 22V12h6v10"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerenciar Imóveis</h3>
                  <p className="text-gray-600 text-sm">Visualizar e editar imóveis</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/analytics" className="group">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-purple-300">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-sm">Relatórios e estatísticas</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Properties */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Imóveis Recentes</h2>
            </div>
            <div className="p-6">
              {recentProperties.length > 0 ? (
                <div className="space-y-4">
                  {recentProperties.map((property) => (
                    <div key={property.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-gray-900 font-semibold">{property.title}</h3>
                          <p className="text-gray-600 text-sm">{property.city}, {property.state}</p>
                          <p className="text-blue-600 font-bold">R$ {property.price.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {property.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                              ⭐ Destaque
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            property.type === 'venda' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {property.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum imóvel cadastrado ainda</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Leads Recentes</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Carregando leads...</p>
                </div>
              ) : recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-gray-900 font-semibold">{lead.name}</h3>
                          <div className="text-gray-600 text-sm space-y-1">
                            {lead.phone && <p>📞 {lead.phone}</p>}
                            {lead.email && <p>📧 {lead.email}</p>}
                            {lead.propertyTitle && <p>🏠 {lead.propertyTitle}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            lead.status === 'novo' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            lead.status === 'contatado' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            lead.status === 'interessado' ? 'bg-green-100 text-green-800 border border-green-200' :
                            lead.status === 'convertido' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {lead.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum lead cadastrado ainda</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}