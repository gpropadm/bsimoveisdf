'use client'

import { useState } from 'react'
import Modal from './Modal'

interface EncomendarImovelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EncomendarImovelModal({ isOpen, onClose }: EncomendarImovelModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    propertyType: '',
    saleType: '',
    priceMin: '',
    priceMax: '',
    city: '',
    neighborhood: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    timeline: '',
    budget: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/property-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
          priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        alert('Erro ao enviar solicitação. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      clientName: '', clientEmail: '', clientPhone: '', propertyType: '', saleType: '',
      priceMin: '', priceMax: '', city: '', neighborhood: '', bedrooms: '',
      bathrooms: '', description: '', timeline: '', budget: ''
    })
    setStep(1)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Solicitação Enviada!" maxWidth="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação. Nossa equipe irá buscar imóveis que atendam ao seu perfil e entrará em contato em breve.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Fechar
            </button>
            <button 
              onClick={() => setSuccess(false)}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fazer Nova Solicitação
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Encomende seu Imóvel" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Suas Informações</h4>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text" name="clientName" value={formData.clientName} onChange={handleChange}
                placeholder="Nome completo *" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange}
                  placeholder="Email *" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleChange}
                  placeholder="Telefone *" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">O que você procura?</h4>
            <div className="grid grid-cols-2 gap-4">
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Tipo do imóvel</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="cobertura">Cobertura</option>
                <option value="terreno">Terreno</option>
              </select>
              <select name="saleType" value={formData.saleType} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Negócio *</option>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number" name="priceMin" value={formData.priceMin} onChange={handleChange}
                placeholder="Preço mínimo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="number" name="priceMax" value={formData.priceMax} onChange={handleChange}
                placeholder="Preço máximo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" name="city" value={formData.city} onChange={handleChange}
                placeholder="Cidade *" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange}
                placeholder="Bairro (opcional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Preferências</h4>
            <div className="grid grid-cols-2 gap-4">
              <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Quartos (mín.)</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Banheiros (mín.)</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="timeline" value={formData.timeline} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Prazo</option>
                <option value="urgente">Urgente (15 dias)</option>
                <option value="1_mes">1 mês</option>
                <option value="3_meses">3 meses</option>
                <option value="sem_pressa">Sem pressa</option>
              </select>
              <select name="budget" value={formData.budget} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Forma de pagamento</option>
                <option value="a_vista">À vista</option>
                <option value="financiado">Financiado</option>
                <option value="fgts">FGTS</option>
              </select>
            </div>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Descreva o que você procura..." rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Solicitar Busca'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}