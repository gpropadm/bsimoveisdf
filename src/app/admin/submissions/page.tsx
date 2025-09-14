'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface PropertySubmission {
  id: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  title: string
  propertyType: string
  saleType: string
  price: number | null
  city: string
  status: string
  urgency: string
  createdAt: string
}

export default function AdminSubmissionsPage() {
  const { data: session, status } = useSession()
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      redirect('/admin/login')
      return
    }
    fetchSubmissions()
  }, [session, status])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/property-submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Erro ao buscar submissões:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/property-submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchSubmissions() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'em_analise': return 'bg-blue-100 text-[#7360ee]'
      case 'aprovado': return 'bg-green-100 text-green-800'
      case 'rejeitado': return 'bg-red-100 text-red-800'
      case 'publicado': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-[#7360ee]'
      case 'baixa': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7360ee]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-2xl font-bold text-black">
                Admin
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Cadastros de Imóveis</span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/admin" className="text-gray-800 hover:text-black">Dashboard</Link>
              <Link href="/admin/properties" className="text-gray-800 hover:text-black">Imóveis</Link>
              <Link href="/admin/submissions" className="text-black font-medium">Cadastros</Link>
              <Link href="/admin/requests" className="text-gray-800 hover:text-black">Solicitações</Link>
              <Link href="/admin/messages" className="text-gray-800 hover:text-black">Mensagens</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cadastros de Imóveis</h1>
          <p className="text-gray-600 mt-2">Gerencie os imóveis cadastrados pelos proprietários</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-[#7360ee]">{submissions.filter(s => s.status === 'pendente').length}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === 'aprovado').length}</div>
            <div className="text-sm text-gray-600">Aprovados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{submissions.filter(s => s.status === 'publicado').length}</div>
            <div className="text-sm text-gray-600">Publicados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-600">{submissions.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proprietário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imóvel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgência
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
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{submission.ownerName}</div>
                        <div className="text-sm text-gray-500">{submission.ownerEmail}</div>
                        <div className="text-sm text-gray-500">{submission.ownerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{submission.title}</div>
                        <div className="text-sm text-gray-500">
                          {submission.propertyType} • {submission.saleType} • {submission.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.price ? `R$ ${submission.price.toLocaleString('pt-BR')}` : 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(submission.urgency)}`}>
                        {submission.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <select
                        value={submission.status}
                        onChange={(e) => updateStatus(submission.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_analise">Em Análise</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                        <option value="publicado">Publicado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cadastro encontrado</h3>
              <p className="text-gray-500">Ainda não há imóveis cadastrados por proprietários.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}