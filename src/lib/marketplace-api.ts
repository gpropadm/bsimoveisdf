// Cliente para API do Marketplace
const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:3001'
const API_KEY = process.env.MARKETPLACE_API_KEY || ''

interface MarketplaceImovel {
  imovelIdOriginal: string
  dados: {
    titulo: string
    preco: number
    type: string
    category: string
    city: string
    state: string
    address?: string
    bedrooms?: number
    bathrooms?: number
    area?: number
    images?: string[]
    description?: string
  }
}

interface MarketplaceLead {
  imovelFederadoId: string
  nome: string
  email: string
  telefone: string
  mensagem?: string
}

class MarketplaceAPI {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string = API_KEY, baseUrl: string = MARKETPLACE_API_URL) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ==================== IMÓVEIS ====================

  async publicarImovel(imovel: MarketplaceImovel) {
    return this.request('/imoveis', {
      method: 'POST',
      body: JSON.stringify(imovel)
    })
  }

  async listarImoveisParceiros(filtros?: {
    type?: string
    city?: string
    minPrice?: number
    maxPrice?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filtros?.type) params.set('type', filtros.type)
    if (filtros?.city) params.set('city', filtros.city)
    if (filtros?.minPrice) params.set('minPrice', filtros.minPrice.toString())
    if (filtros?.maxPrice) params.set('maxPrice', filtros.maxPrice.toString())
    if (filtros?.limit) params.set('limit', filtros.limit.toString())

    const query = params.toString()
    return this.request(`/imoveis${query ? `?${query}` : ''}`)
  }

  async meusImoveisPublicados() {
    return this.request('/imoveis/meus/publicados')
  }

  async buscarImovel(id: string) {
    return this.request(`/imoveis/${id}`)
  }

  async atualizarImovel(id: string, dados: any) {
    return this.request(`/imoveis/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ dados })
    })
  }

  async removerDoMarketplace(id: string) {
    return this.request(`/imoveis/${id}`, {
      method: 'DELETE'
    })
  }

  // ==================== LEADS ====================

  async enviarLead(lead: MarketplaceLead) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(lead)
    })
  }

  async listarLeadsRecebidos(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/leads/recebidos${query}`)
  }

  async listarLeadsEnviados(status?: string) {
    const query = status ? `?status=${status}` : ''
    return this.request(`/leads/enviados${query}`)
  }

  async atualizarStatusLead(id: string, status: string) {
    return this.request(`/leads/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async buscarLead(id: string) {
    return this.request(`/leads/${id}`)
  }

  // ==================== NOTIFICAÇÕES ====================

  async listarNotificacoes(lida?: boolean) {
    const query = lida !== undefined ? `?lida=${lida}` : ''
    return this.request(`/notificacoes${query}`)
  }

  async marcarComoLida(id: string) {
    return this.request(`/notificacoes/${id}/ler`, {
      method: 'PUT'
    })
  }

  async marcarTodasComoLidas() {
    return this.request('/notificacoes/todas/ler', {
      method: 'PUT'
    })
  }

  // ==================== ESTATÍSTICAS ====================

  async buscarEstatisticas() {
    return this.request('/stats')
  }

  async buscarStatsLeads() {
    return this.request('/stats/leads')
  }

  async buscarStatsImoveis() {
    return this.request('/stats/imoveis')
  }

  async buscarStatsComissoes() {
    return this.request('/stats/comissoes')
  }

  // ==================== IMOBILIÁRIAS ====================

  async listarParceiras() {
    return this.request('/imobiliarias/parceiras')
  }
}

export const marketplaceAPI = new MarketplaceAPI()
export default marketplaceAPI
