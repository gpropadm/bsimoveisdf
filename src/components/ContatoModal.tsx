'use client'

import { useState } from 'react'
import Modal from './Modal'

interface ContatoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContatoModal({ isOpen, onClose }: ContatoModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Mensagem Enviada!" maxWidth="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Recebemos sua mensagem. Nossa equipe entrará em contato em breve.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleClose}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fechar
            </button>
            <button 
              onClick={() => setSuccess(false)}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Enviar Nova Mensagem
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Entre em Contato" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text" name="name" value={formData.name} onChange={handleChange}
            placeholder="Nome completo *" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <input
            type="email" name="email" value={formData.email} onChange={handleChange}
            placeholder="Email *" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="tel" name="phone" value={formData.phone} onChange={handleChange}
            placeholder="Telefone"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <select
            name="subject" value={formData.subject} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Assunto *</option>
            <option value="Dúvidas sobre imóveis">Dúvidas sobre imóveis</option>
            <option value="Agendamento de visita">Agendamento de visita</option>
            <option value="Informações sobre financiamento">Financiamento</option>
            <option value="Parcerias">Parcerias</option>
            <option value="Suporte técnico">Suporte técnico</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <textarea
          name="message" value={formData.message} onChange={handleChange}
          placeholder="Sua mensagem *" required rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-gray-900">Contatos diretos:</div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>📞 (61) 99999-9999</span>
            <span>📧 contato@faimoveis.com</span>
          </div>
          <div className="text-sm text-gray-600">
            <a href="https://api.whatsapp.com/send?phone=5561999999999" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
              💬 WhatsApp: (61) 99999-9999
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </Modal>
  )
}