'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

interface PriceAlertButtonProps {
  propertyId: string
  propertyTitle: string
}

export default function PriceAlertButton({ propertyId, propertyTitle }: PriceAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          propertyId
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Alerta cadastrado! Você será notificado se o preço for reduzido.')
        setIsOpen(false)
        setFormData({ name: '', phone: '' })
      } else {
        toast.error(data.error || 'Erro ao cadastrar alerta')
      }
    } catch (error) {
      toast.error('Erro ao cadastrar alerta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-3 font-sora fw-semibold w-100"
        style={{
          fontSize: '14px'
        }}
      >
        <i className="fas fa-bell" style={{ fontSize: '14px' }}></i>
        Avisar se Baixar Preço
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Aviso de Redução de Preço
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Cadastre-se para receber um WhatsApp quando o preço deste imóvel for reduzido.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="(48) 99999-9999"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}