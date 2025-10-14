'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { convertUnsplashUrl } from '@/lib/unsplash-utils'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  contactWhatsapp: string
  address: string
  city: string
  state: string
  socialFacebook: string
  socialInstagram: string
  featuredLimit: number
  enableRegistrations: boolean
  enableComments: boolean
  headerTitle: string
  headerSubtitle: string
  anthropicApiKey: string
}

interface UserSettings {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('site')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'ImobiNext',
    siteDescription: 'Encontre o imóvel dos seus sonhos',
    contactEmail: 'contato@imobinext.com',
    contactPhone: '(48) 99864-5864',
    contactWhatsapp: '5548998645864',
    address: 'Rua das Flores, 123',
    city: 'Florianópolis',
    state: 'SC',
    socialFacebook: 'https://facebook.com',
    socialInstagram: 'https://instagram.com',
    featuredLimit: 6,
    enableRegistrations: true,
    enableComments: false,
    headerTitle: 'Encontre o Imóvel Perfeito',
    headerSubtitle: 'Casas, apartamentos e terrenos dos seus sonhos',
    anthropicApiKey: ''
  })

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user) {
      setUserSettings(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }))
    }

    fetchSettings()
  }, [status, router, session])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.site) {
          setSiteSettings(data.site)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSiteSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setSiteSettings(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (type === 'number') {
      setSiteSettings(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }))
    } else {
      // Se for o campo WhatsApp, remover caracteres especiais
      let finalValue = value
      if (name === 'contactWhatsapp') {
        finalValue = value.replace(/[\s\-()]/g, '')
      }

      setSiteSettings(prev => ({
        ...prev,
        [name]: finalValue
      }))
    }
  }

  const handleUserSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'site',
          settings: siteSettings
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Erro ao salvar configurações')
      }

      window.dispatchEvent(new CustomEvent('settings-updated'))
      alert('Configurações do site salvas com sucesso!')

      // Recarregar configurações
      fetchSettings()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao salvar configurações: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveUserSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userSettings.newPassword && userSettings.newPassword !== userSettings.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    setSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configurações do usuário salvas com sucesso!')
      setUserSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7360ee] rounded-xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <AdminLayout
      title="Configurações"
      subtitle="Gerencie as configurações do sistema e sua conta"
      currentPage="settings"
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 py-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('site')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'site'
                ? 'border-[#7360ee] text-[#7360ee]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Site
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-[#7360ee] text-[#7360ee]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Minha Conta
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-[#7360ee] text-[#7360ee]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notificações
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'site' && (
          <form onSubmit={handleSaveSiteSettings} className="space-y-6">
            {/* Informações do Header Top */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🔝 Informações do Header Top</h3>
                <p className="text-sm text-gray-600">Estas informações aparecem no topo do site</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📞 Telefone Rodapé
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={siteSettings.contactPhone}
                      onChange={handleSiteSettingsChange}
                      placeholder="(61) 98579-6033"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={siteSettings.contactEmail}
                      onChange={handleSiteSettingsChange}
                      placeholder="contato@imobinext.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📱 WhatsApp
                    </label>
                    <input
                      type="text"
                      name="contactWhatsapp"
                      value={siteSettings.contactWhatsapp}
                      onChange={handleSiteSettingsChange}
                      placeholder="5548998645864"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📍 Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={siteSettings.city}
                      onChange={handleSiteSettingsChange}
                      placeholder="Florianópolis"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏛️ Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={siteSettings.state}
                      onChange={handleSiteSettingsChange}
                      maxLength={2}
                      placeholder="SC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Header Hero */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🎨 Header Hero</h3>
                <p className="text-sm text-gray-600">Configure a imagem e textos do banner principal</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Título Principal
                    </label>
                    <input
                      type="text"
                      name="headerTitle"
                      value={siteSettings.headerTitle}
                      onChange={handleSiteSettingsChange}
                      placeholder="Encontre o Imóvel Perfeito"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📄 Subtítulo
                    </label>
                    <input
                      type="text"
                      name="headerSubtitle"
                      value={siteSettings.headerSubtitle}
                      onChange={handleSiteSettingsChange}
                      placeholder="Casas, apartamentos e terrenos dos seus sonhos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações de IA (Chatbot) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-900">🤖 Inteligência Artificial</h3>
                <p className="text-sm text-gray-600">Configure o chatbot inteligente powered by Anthropic Claude</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900 mb-2">
                    💳 <strong>Gerenciar Créditos e Faturamento:</strong>
                  </p>
                  <a
                    href="https://console.anthropic.com/settings/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Acessar Console Anthropic
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔑 Chave da API Anthropic
                  </label>
                  <input
                    type="password"
                    name="anthropicApiKey"
                    value={siteSettings.anthropicApiKey}
                    onChange={handleSiteSettingsChange}
                    placeholder="sk-ant-api03-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    ℹ️ Obtenha sua chave em <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">console.anthropic.com</a>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Dica:</strong> Ao trocar a chave da API, o chatbot passará a usar os créditos da nova conta automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Gerais */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Informações Gerais</h3>
                <p className="text-sm text-gray-600">Configure as informações básicas do site</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Site
                    </label>
                    <input
                      type="text"
                      name="siteName"
                      value={siteSettings.siteName}
                      onChange={handleSiteSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={siteSettings.address}
                      onChange={handleSiteSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Site
                  </label>
                  <textarea
                    name="siteDescription"
                    value={siteSettings.siteDescription}
                    onChange={handleSiteSettingsChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Redes Sociais</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="socialFacebook"
                      value={siteSettings.socialFacebook}
                      onChange={handleSiteSettingsChange}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="socialInstagram"
                      value={siteSettings.socialInstagram}
                      onChange={handleSiteSettingsChange}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Configurações Avançadas</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Imóveis em Destaque
                  </label>
                  <input
                    type="number"
                    name="featuredLimit"
                    value={siteSettings.featuredLimit}
                    onChange={handleSiteSettingsChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="enableRegistrations"
                      checked={siteSettings.enableRegistrations}
                      onChange={handleSiteSettingsChange}
                      className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Permitir registro de novos usuários</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="enableComments"
                      checked={siteSettings.enableComments}
                      onChange={handleSiteSettingsChange}
                      className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Permitir comentários nos imóveis</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#7360ee] hover:bg-[#7360ee]/90 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'account' && (
          <form onSubmit={handleSaveUserSettings} className="space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={userSettings.name}
                      onChange={handleUserSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={userSettings.email}
                      onChange={handleUserSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Alterar Senha */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
                <p className="text-sm text-gray-600">Deixe em branco se não quiser alterar a senha</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={userSettings.currentPassword}
                    onChange={handleUserSettingsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={userSettings.newPassword}
                      onChange={handleUserSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={userSettings.confirmPassword}
                      onChange={handleUserSettingsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#7360ee] hover:bg-[#7360ee]/90 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Notificação</h3>
              <p className="text-sm text-gray-600">Configure como e quando você quer receber notificações</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Novos imóveis cadastrados</span>
                    <p className="text-xs text-gray-500">Receba notificação quando um novo imóvel for cadastrado</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Atualizações de imóveis</span>
                    <p className="text-xs text-gray-500">Receba notificação quando um imóvel for editado</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mensagens de contato</span>
                    <p className="text-xs text-gray-500">Receba notificação quando alguém entrar em contato</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Relatórios semanais</span>
                    <p className="text-xs text-gray-500">Receba um resumo semanal das atividades do site</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-[#7360ee] hover:bg-[#7360ee]/90 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  <span>Salvar Preferências</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}