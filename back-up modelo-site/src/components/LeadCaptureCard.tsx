'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface LeadCaptureCardProps {
  searchParams: {
    category?: string
    type?: string
    city?: string
    state?: string
    priceMin?: string
    priceMax?: string
  }
}

export default function LeadCaptureCard({ searchParams }: LeadCaptureCardProps) {
  const { primaryColor } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'busca_sem_resultado',
          preferredCategory: searchParams.category || null,
          preferredType: searchParams.type || null,
          preferredCity: searchParams.city || null,
          preferredState: searchParams.state || null,
          preferredPriceMin: searchParams.priceMin ? parseFloat(searchParams.priceMin) : null,
          preferredPriceMax: searchParams.priceMax ? parseFloat(searchParams.priceMax) : null,
          enableMatching: true,
          message: 'Lead capturado em busca sem resultado'
        })
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: '', email: '', phone: '' })
        setTimeout(() => {
          setIsExpanded(false)
          setSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSearchSummary = () => {
    const parts = []

    if (searchParams.category) {
      parts.push(searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1))
    }

    if (searchParams.type) {
      parts.push(`para ${searchParams.type.charAt(0).toUpperCase() + searchParams.type.slice(1)}`)
    }

    if (searchParams.city) {
      const location = searchParams.state
        ? `em ${searchParams.city} - ${searchParams.state}`
        : `em ${searchParams.city}`
      parts.push(location)
    }

    if (searchParams.priceMin || searchParams.priceMax) {
      const priceMin = searchParams.priceMin ? parseFloat(searchParams.priceMin) : null
      const priceMax = searchParams.priceMax ? parseFloat(searchParams.priceMax) : null

      if (priceMin && priceMax) {
        parts.push(`entre ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(priceMin)} e ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(priceMax)}`)
      } else if (priceMin) {
        parts.push(`a partir de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(priceMin)}`)
      } else if (priceMax) {
        parts.push(`até ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(priceMax)}`)
      }
    }

    return parts.length > 0 ? parts.join(' ') : 'um imóvel'
  }

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Tudo certo! 🎉</h3>
        <p className="text-green-700">
          Vamos te avisar assim que encontrarmos o imóvel perfeito para você!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
          <svg className="w-8 h-8" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Não encontramos o que você procura... ainda! 😊
        </h3>
        <p className="text-gray-600 text-lg mb-2">
          Mas temos uma boa notícia: podemos te avisar quando aparecer o imóvel perfeito!
        </p>
        <div className="bg-white rounded-xl px-4 py-3 mt-4 inline-block shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Você está procurando:</p>
          <p className="text-base font-semibold" style={{ color: primaryColor }}>
            {formatSearchSummary()}
          </p>
        </div>
      </div>

      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-4 px-6 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Quero ser avisado!
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seu nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Como podemos te chamar?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
              style={{ focusRingColor: primaryColor }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
              />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex-1 py-3 px-6 border-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#e5e7eb' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Enviando...' : 'Quero ser avisado! ✨'}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        💡 Vamos te notificar por WhatsApp quando aparecer um imóvel com essas características
      </p>
    </div>
  )
}
