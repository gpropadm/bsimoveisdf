'use client'

import { useState } from 'react'
import Modal from './Modal'

interface CadastrarImovelModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CadastrarImovelModal({ isOpen, onClose }: CadastrarImovelModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    title: '',
    propertyType: '',
    saleType: '',
    price: '',
    address: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    urgency: 'normal'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/property-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        alert('Erro ao enviar cadastro. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      ownerName: '', ownerEmail: '', ownerPhone: '', title: '', propertyType: '',
      saleType: '', price: '', address: '', city: '', state: '', bedrooms: '',
      bathrooms: '', area: '', description: '', urgency: 'normal'
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
      <Modal isOpen={isOpen} onClose={handleClose} title="Cadastro Enviado!" maxWidth="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            Recebemos o cadastro do seu imóvel. Nossa equipe analisará as informações e entrará em contato em breve.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleClose}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
            <button 
              onClick={() => setSuccess(false)}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cadastrar Outro Imóvel
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastre seu Imóvel" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Suas Informações</h4>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                placeholder="Nome completo *" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleChange}
                  placeholder="Email *" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange}
                  placeholder="Telefone *" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Informações do Imóvel</h4>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Título do anúncio *" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="grid grid-cols-3 gap-4">
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tipo *</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="cobertura">Cobertura</option>
                <option value="terreno">Terreno</option>
              </select>
              <select name="saleType" value={formData.saleType} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Negócio *</option>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
              <input
                type="number" name="price" value={formData.price} onChange={handleChange}
                placeholder="Preço"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Localização e Detalhes</h4>
            <input
              type="text" name="address" value={formData.address} onChange={handleChange}
              placeholder="Endereço *" required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text" name="city" value={formData.city} onChange={handleChange}
                placeholder="Cidade *" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text" name="state" value={formData.state} onChange={handleChange}
                placeholder="Estado *" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange}
                placeholder="Quartos"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange}
                placeholder="Banheiros"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number" name="area" value={formData.area} onChange={handleChange}
                placeholder="Área (m²)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Descrição do imóvel" rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select name="urgency" value={formData.urgency} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="baixa">Urgência: Baixa</option>
              <option value="normal">Urgência: Normal</option>
              <option value="alta">Urgência: Alta</option>
            </select>
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
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Cadastrar Imóvel'}
              </button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}