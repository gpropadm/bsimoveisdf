'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  message?: string
  propertyTitle?: string
  propertyPrice?: number
  propertyType?: string
  status: string
  source: string
  createdAt: string
  property?: {
    id: string
    title: string
    slug: string
    type: string
    price: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminLeadsPage() {
  const { status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/admin/login')
  }

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'novo', label: 'Novo' },
    { value: 'contatado', label: 'Contatado' },
    { value: 'interessado', label: 'Interessado' },
    { value: 'convertido', label: 'Convertido' },
    { value: 'perdido', label: 'Perdido' }
  ]

  const getStatusBadge = (status: string) => {
    const statusMap = {
      novo: 'bg-blue-100 text-[#7360ee]',
      contatado: 'bg-yellow-100 text-yellow-800',
      interessado: 'bg-green-100 text-green-800',
      convertido: 'bg-purple-100 text-purple-800',
      perdido: 'bg-red-100 text-red-800'
    }
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'
  }

  const fetchLeads = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/leads?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, filters])

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchLeads(pagination.page)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'
    return `R$ ${price.toLocaleString('pt-BR')}`
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads()
    }
  }, [status, filters, fetchLeads])

  const handleSearch = () => {
    fetchLeads(1)
  }

  const handleStatusFilter = (newStatus: string) => {
    setFilters(prev => ({ ...prev, status: newStatus }))
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout
      title="Leads"
      subtitle="Acompanhe e gerencie todos os leads do seu site"
      currentPage="leads"
    >
      {/* Filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou imóvel..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-[#7360ee] text-white rounded-lg hover:bg-[#7360ee]/90 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-[#7360ee]">
            {leads.filter(l => l.status === 'novo').length}
          </div>
          <div className="text-sm text-gray-600">Novos</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {leads.filter(l => l.status === 'interessado').length}
          </div>
          <div className="text-sm text-gray-600">Interessados</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {leads.filter(l => l.status === 'convertido').length}
          </div>
          <div className="text-sm text-gray-600">Convertidos</div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden p-4">
        {loading ? (
          <div className="text-center py-8">Carregando leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum lead encontrado</div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <div className="text-sm text-gray-600">
                      {lead.phone && <div>📞 {lead.phone}</div>}
                      {lead.email && <div>📧 {lead.email}</div>}
                    </div>
                  </div>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusBadge(lead.status)}`}
                  >
                    <option value="novo">Novo</option>
                    <option value="contatado">Contatado</option>
                    <option value="interessado">Interessado</option>
                    <option value="convertido">Convertido</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
                {lead.propertyTitle && (
                  <div className="mb-3">
                    <div className="font-medium text-sm">{lead.propertyTitle}</div>
                    {lead.propertyPrice && (
                      <div className="text-gray-500 text-sm">
                        {formatPrice(lead.propertyPrice)} • {lead.propertyType}
                      </div>
                    )}
                  </div>
                )}
                {lead.message && (
                  <div className="mb-3 text-sm text-gray-600">
                    {lead.message.length > 100 ? `${lead.message.substring(0, 100)}...` : lead.message}
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{formatDate(lead.createdAt)}</span>
                  <div className="flex gap-2">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        WhatsApp
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[#7360ee] hover:text-[#7360ee]/80"
                      >
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        {loading ? (
          <div className="p-8 text-center">Carregando leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum lead encontrado</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imóvel
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
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          {lead.message && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {lead.message.length > 50 
                                ? `${lead.message.substring(0, 50)}...` 
                                : lead.message
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.phone && <div>📞 {lead.phone}</div>}
                          {lead.email && <div>📧 {lead.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.propertyTitle && (
                            <div className="font-medium">{lead.propertyTitle}</div>
                          )}
                          {lead.propertyPrice && (
                            <div className="text-gray-500">
                              {formatPrice(lead.propertyPrice)} • {lead.propertyType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusBadge(lead.status)}`}
                        >
                          <option value="novo">Novo</option>
                          <option value="contatado">Contatado</option>
                          <option value="interessado">Interessado</option>
                          <option value="convertido">Convertido</option>
                          <option value="perdido">Perdido</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            WhatsApp
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-[#7360ee] hover:text-[#7360ee]/80"
                          >
                            Email
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchLeads(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => fetchLeads(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      até{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchLeads(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-[#7360ee]/10 border-[#7360ee] text-[#7360ee]'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}