'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function SimpleAdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#7360ee] to-purple-600 rounded-2xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  // Static data
  const stats = {
    totalProperties: 6,
    saleProperties: 4,
    rentalProperties: 2,
    featuredProperties: 3
  }

  const recentProperties = [
    {
      id: '1',
      title: 'Apartamento Moderno em Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      price: 850000,
      type: 'venda',
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Casa Luxuosa em Alphaville',
      city: 'Barueri',
      state: 'SP',
      price: 1200000,
      type: 'venda',
      featured: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Cobertura Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      price: 1800000,
      type: 'venda',
      featured: true,
      createdAt: new Date().toISOString()
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7360ee]/100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#7360ee] to-purple-600 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
                <p className="text-blue-200 text-sm">Bem-vindo, {session.user?.name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="hidden lg:block px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Ver Site
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-500/20"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#7360ee]/20 to-[#7360ee]/90/20 backdrop-blur-md rounded-2xl p-6 border border-[#7360ee]/30 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-[#7360ee]/100 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-blue-200 text-sm font-medium">Total de Imóveis</p>
                <p className="text-3xl font-bold text-white">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v20m5-5l-5 5-5-5"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-green-200 text-sm font-medium">Para Venda</p>
                <p className="text-3xl font-bold text-white">{stats.saleProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-md rounded-2xl p-6 border border-orange-500/30 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-orange-200 text-sm font-medium">Para Aluguel</p>
                <p className="text-3xl font-bold text-white">{stats.rentalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-yellow-200 text-sm font-medium">Em Destaque</p>
                <p className="text-3xl font-bold text-white">{stats.featuredProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/properties/new" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#7360ee] to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Novo Imóvel</h3>
                <p className="text-gray-300">Cadastrar novo imóvel no sistema</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/properties" className="group">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 00-2 2v7a2 2 0 002 2h6a2 2 0 002-2v-7a2 2 0 00-2-2z"/>
                    <path d="M13 11h6a2 2 0 012 2v7a2 2 0 01-2 2h-6a2 2 0 01-2-2v-7a2 2 0 012-2z"/>
                    <path d="M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gerenciar Imóveis</h3>
                <p className="text-gray-300">Visualizar e editar imóveis</p>
              </div>
            </div>
          </Link>

          <div className="group cursor-not-allowed">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 opacity-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Configurações</h3>
                <p className="text-gray-300">Em breve...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Imóveis Recentes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <div key={property.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{property.title}</h3>
                      <p className="text-gray-300 text-sm">{property.city}, {property.state}</p>
                      <p className="text-blue-300 font-bold">R$ {property.price.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {property.featured && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                          ⭐ Destaque
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        property.type === 'venda' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      }`}>
                        {property.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}