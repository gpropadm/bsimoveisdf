'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AutomatedReports from '@/components/AutomatedReports'
import Link from 'next/link'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function ReportsPage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-xl mb-4 animate-pulse">
            <span className="text-white text-2xl">📊</span>
          </div>
          <p className="text-gray-600 text-lg">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Acesso negado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Voltar ao Dashboard
              </Link>
              <div className="border-l pl-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  📊 Relatórios Automáticos
                </h1>
                <p className="text-sm text-gray-600">
                  Relatórios inteligentes gerados por IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-sm">
                <p className="text-gray-600">Logado como:</p>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
              </div>
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                {session.user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AutomatedReports />
      </div>
    </div>
  )
}