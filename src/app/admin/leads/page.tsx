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
  hasWhatsAppMessage?: boolean
  whatsAppMessageDate?: string | null
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
  const [sendingSuggestions, setSendingSuggestions] = useState<string | null>(null)
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

  const markAsContacted = async (leadId: string, phone: string) => {
    // Marcar como contatado e abrir WhatsApp
    await updateLeadStatus(leadId, 'contatado')
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}`, '_blank')
  }

  const sendSuggestions = async (leadId: string) => {
    setSendingSuggestions(leadId)
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/suggestions`, {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok) {
        if (result.suggestions > 0) {
          alert(`✅ ${result.suggestions} sugestões enviadas via WhatsApp!`)
        } else {
          alert('ℹ️ Nenhum imóvel compatível encontrado para este lead.')
        }
        fetchLeads(pagination.page) // Refresh a lista
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar sugestões:', error)
      alert('❌ Erro ao enviar sugestões. Tente novamente.')
    } finally {
      setSendingSuggestions(null)
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
                  <div className="flex gap-2 items-center">
                    {lead.status === 'perdido' && lead.phone && (
                      <button
                        onClick={() => sendSuggestions(lead.id)}
                        disabled={sendingSuggestions === lead.id}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors disabled:opacity-50"
                        title="Enviar sugestões de imóveis compatíveis"
                      >
                        {sendingSuggestions === lead.id ? (
                          <div className="animate-spin w-3 h-3 border border-orange-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {sendingSuggestions === lead.id ? 'Enviando...' : 'Sugestões'}
                      </button>
                    )}
                    {lead.phone && (
                      <button
                        onClick={() => markAsContacted(lead.id, lead.phone!)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          lead.hasWhatsAppMessage || lead.status === 'contatado' || lead.status === 'interessado' || lead.status === 'convertido'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                        title={lead.hasWhatsAppMessage ? 'WhatsApp enviado' : 'Marcar como contatado e abrir WhatsApp'}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.03 1.518 5.728L0 24l6.46-1.695c1.618.832 3.446 1.302 5.557 1.302 6.621 0 11.988-5.367 11.988-11.987C23.988 5.367 18.637.001 12.017 0zm5.624 17.025c-.282.79-1.692 1.51-2.31 1.578-.133.015-.133.015-.133.015-.619.067-1.618.201-4.917-1.048-3.299-1.249-5.445-4.548-5.614-4.763-.168-.215-1.369-1.822-1.369-3.477s.869-2.466 1.177-2.806c.308-.34.674-.425 1.177-.425.133 0 .267 0 .384.016.308.014.463.029.668.514.215.511.73 1.775.793 1.906.064.131.106.282.021.458-.085.176-.127.282-.253.434-.127.152-.267.34-.382.458-.127.131-.259.271-.111.53.148.258.659 1.086 1.414 1.758 1.369 1.218 2.53 1.591 2.886 1.774.355.183.562.152.77-.091.207-.243.885-1.034 1.121-1.391.236-.357.472-.297.795-.178.324.118 2.048.966 2.399 1.142.351.176.585.265.668.414.084.149.084.858-.197 1.649z"/>
                        </svg>
                        {lead.hasWhatsAppMessage || lead.status === 'contatado' || lead.status === 'interessado' || lead.status === 'convertido' ? '✓' : 'WhatsApp'}
                      </button>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[#7360ee] hover:text-[#7360ee]/80 text-xs"
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
                        <div className="flex items-center gap-3">
                          {lead.status === 'perdido' && lead.phone && (
                            <button
                              onClick={() => sendSuggestions(lead.id)}
                              disabled={sendingSuggestions === lead.id}
                              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors disabled:opacity-50 border border-orange-300"
                              title="Enviar sugestões de imóveis compatíveis"
                            >
                              {sendingSuggestions === lead.id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              )}
                              {sendingSuggestions === lead.id ? 'Enviando...' : 'Sugestões'}
                            </button>
                          )}
                          {lead.phone && (
                            <button
                              onClick={() => markAsContacted(lead.id, lead.phone!)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                lead.hasWhatsAppMessage || lead.status === 'contatado' || lead.status === 'interessado' || lead.status === 'convertido'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 border border-gray-200'
                              }`}
                              title={lead.hasWhatsAppMessage ? 'WhatsApp enviado automaticamente' : 'Marcar como contatado e abrir WhatsApp'}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 2.079.549 4.03 1.518 5.728L0 24l6.46-1.695c1.618.832 3.446 1.302 5.557 1.302 6.621 0 11.988-5.367 11.988-11.987C23.988 5.367 18.637.001 12.017 0zm5.624 17.025c-.282.79-1.692 1.51-2.31 1.578-.133.015-.133.015-.133.015-.619.067-1.618.201-4.917-1.048-3.299-1.249-5.445-4.548-5.614-4.763-.168-.215-1.369-1.822-1.369-3.477s.869-2.466 1.177-2.806c.308-.34.674-.425 1.177-.425.133 0 .267 0 .384.016.308.014.463.029.668.514.215.511.73 1.775.793 1.906.064.131.106.282.021.458-.085.176-.127.282-.253.434-.127.152-.267.34-.382.458-.127.131-.259.271-.111.53.148.258.659 1.086 1.414 1.758 1.369 1.218 2.53 1.591 2.886 1.774.355.183.562.152.77-.091.207-.243.885-1.034 1.121-1.391.236-.357.472-.297.795-.178.324.118 2.048.966 2.399 1.142.351.176.585.265.668.414.084.149.084.858-.197 1.649z"/>
                              </svg>
                              {lead.hasWhatsAppMessage || lead.status === 'contatado' || lead.status === 'interessado' || lead.status === 'convertido' ? (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {lead.hasWhatsAppMessage ? 'Enviado' : 'Lido'}
                                </span>
                              ) : (
                                'WhatsApp'
                              )}
                            </button>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-[#7360ee] hover:text-[#7360ee]/80 px-2 py-1 rounded hover:bg-[#7360ee]/10 transition-colors"
                            >
                              Email
                            </a>
                          )}
                        </div>
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