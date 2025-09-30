'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface CloudinaryStats {
  bandwidth: {
    used: number
    limit: number
    percentage: number
  }
  storage: {
    used: number
    limit: number
    percentage: number
  }
  transformations: {
    used: number
    limit: number
    percentage: number
  }
  resources: {
    images: number
    videos: number
    total: number
  }
  lastUpdated: string
  planType: string
}

export default function CloudinaryUsagePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<CloudinaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    fetchStats()
  }, [status, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/cloudinary-usage', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7360ee] rounded-xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (error) {
    return (
      <AdminLayout title="Central de Mídia" subtitle="Erro ao carregar dados" currentPage="media">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar estatísticas</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchStats}
                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const refreshButton = (
    <button
      onClick={fetchStats}
      className="bg-[#7360ee] hover:bg-[#7360ee]/90 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Atualizar
    </button>
  )

  return (
    <AdminLayout
      title="Central de Mídia"
      subtitle="Monitore o uso de armazenamento, largura de banda e processamento de mídia"
      currentPage="media"
      actions={refreshButton}
    >
        {/* Plan Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Plano Atual: {stats?.planType}</h2>
              <p className="text-sm text-gray-600">
                Última atualização: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="bg-[#7360ee] hover:bg-[#7360ee]/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Largura de Banda */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Largura de Banda</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats?.bandwidth.percentage || 0)}`}>
                {stats?.bandwidth.percentage}%
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{stats?.bandwidth.used}GB usados</span>
                <span>{stats?.bandwidth.limit}GB total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor(stats?.bandwidth.percentage || 0)}`}
                  style={{ width: `${Math.min(stats?.bandwidth.percentage || 0, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Dados transferidos para visualização de imagens e vídeos
            </p>
          </div>

          {/* Armazenamento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Armazenamento</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats?.storage.percentage || 0)}`}>
                {stats?.storage.percentage}%
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{stats?.storage.used}GB usados</span>
                <span>{stats?.storage.limit}GB total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor(stats?.storage.percentage || 0)}`}
                  style={{ width: `${Math.min(stats?.storage.percentage || 0, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Espaço usado para armazenar imagens e vídeos
            </p>
          </div>

          {/* Transformações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transformações</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats?.transformations.percentage || 0)}`}>
                {stats?.transformations.percentage}%
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{stats?.transformations.used.toLocaleString()} usadas</span>
                <span>{stats?.transformations.limit.toLocaleString()} total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor(stats?.transformations.percentage || 0)}`}
                  style={{ width: `${Math.min(stats?.transformations.percentage || 0, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Créditos para processamento e otimização de mídia
            </p>
          </div>
        </div>

        {/* Resources Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recursos Armazenados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.resources.images}</div>
              <div className="text-sm text-gray-600">Imagens</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats?.resources.videos}</div>
              <div className="text-sm text-gray-600">Vídeos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats?.resources.total}</div>
              <div className="text-sm text-gray-600">Total de Arquivos</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {((stats?.bandwidth.percentage || 0) >= 80 || (stats?.storage.percentage || 0) >= 80 || (stats?.transformations.percentage || 0) >= 80) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.824-.833-2.598 0L3.732 16.5c-.77.833-.192 2.5 1.732 2.5z"/>
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Atenção - Próximo do Limite</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Você está usando mais de 80% de alguns recursos. Considere fazer upgrade do plano ou otimizar o uso.
                </p>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  )
}