'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RxMobile, RxEnvelopeClosed } from 'react-icons/rx'

interface PropertyGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  propertyTitle: string
  propertyPrice: number
  propertyType: string
  images?: string[]
}

export default function PropertyGalleryModal({ 
  isOpen, 
  onClose, 
  propertyTitle, 
  propertyPrice, 
  propertyType,
  images = []
}: PropertyGalleryModalProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })

  // Atualizar mensagem quando as props mudarem
  useEffect(() => {
    if (propertyTitle && propertyPrice) {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(price)
      }

      setFormData(prev => ({
        ...prev,
        message: `Olá! Tenho interesse no imóvel "${propertyTitle}" no valor de ${formatPrice(propertyPrice)}. Gostaria de mais informações.`
      }))
    }
  }, [propertyTitle, propertyPrice])

  // Usar imagens fornecidas ou fallback
  const photos = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop'
  ]

  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.name.trim()) {
      setSubmitMessage('Por favor, preencha seu nome')
      return
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setSubmitMessage('Por favor, preencha seu telefone ou email')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Salvar lead na API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          propertyTitle,
          propertyPrice,
          propertyType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar dados')
      }

      // Após salvar com sucesso, enviar WhatsApp
      const message = `*NOVO LEAD - SITE IMOBILIARIA*

*Cliente:* ${formData.name}
*Telefone:* ${formData.phone || 'Não informado'}
*Email:* ${formData.email || 'Não informado'}

*Imovel de interesse:* ${propertyTitle}
*Valor:* R$ ${propertyPrice.toLocaleString('pt-BR')}
*Tipo:* ${propertyType}

*Mensagem do cliente:*
${formData.message}

*Data:* ${new Date().toLocaleString('pt-BR')}`

      // Buscar configurações para pegar o WhatsApp
      const settingsResponse = await fetch('/api/admin/settings')
      const settingsData = await settingsResponse.json()
      const whatsappNumber = settingsData.site?.contactWhatsapp || '5548998645864'
      
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappURL, '_blank')

      setSubmitMessage('✅ Dados enviados com sucesso!')
      
      // Limpar formulário após 2 segundos
      setTimeout(() => {
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(price)
        }

        setFormData({
          name: '',
          phone: '',
          email: '',
          message: `Olá! Tenho interesse no imóvel "${propertyTitle}" no valor de ${formatPrice(propertyPrice)}. Gostaria de mais informações.`
        })
        setSubmitMessage('')
      }, 2000)

    } catch (error) {
      console.error('Erro:', error)
      setSubmitMessage('❌ Erro ao enviar dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex">
      {/* Gallery Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-white hover:text-gray-300 z-10"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Main Image */}
        <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
          <Image
            src={photos[currentPhoto]}
            alt={`${propertyTitle} - Foto ${currentPhoto + 1}`}
            className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg"
            width={800}
            height={600}
            unoptimized
          />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevPhoto}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 transition-all hover:bg-black/70 z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <button
          onClick={nextPhoto}
          className="absolute right-[22rem] top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 transition-all hover:bg-black/70 z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute top-6 right-[22rem] text-white bg-black bg-opacity-60 px-4 py-2 rounded-full">
          {currentPhoto + 1} / {photos.length}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          {/* Seta Esquerda */}
          {photos.length > 5 && (
            <button
              onClick={() => {
                const container = document.querySelector('.thumbnail-scroll');
                if (container) container.scrollLeft -= 150;
              }}
              className="text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
          )}
          
          {/* Miniaturas */}
          <div className="flex gap-2 max-w-2xl overflow-x-auto scrollbar-hide thumbnail-scroll">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhoto(index)}
                className={`flex-shrink-0 relative w-16 h-12 rounded overflow-hidden border-2 transition-all duration-200 ${
                  index === currentPhoto 
                    ? 'border-white' 
                    : 'border-gray-400 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo}
                  alt={`Thumb ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
          
          {/* Seta Direita */}
          {photos.length > 5 && (
            <button
              onClick={() => {
                const container = document.querySelector('.thumbnail-scroll');
                if (container) container.scrollLeft += 150;
              }}
              className="text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white h-full overflow-y-auto">
        <div className="p-6">
          {/* Property Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{propertyTitle}</h3>
            <div className="text-2xl font-bold text-gray-800">
              R$ {propertyPrice.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Agent Profile */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Ana Paula Corretor</h4>
                <p className="text-sm text-gray-600">CRECI 5362J</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <RxMobile className="w-4 h-4 text-green-500" />
                <span>(48) 99864-5864</span>
              </div>
              <div className="flex items-center gap-2">
                <RxEnvelopeClosed className="w-4 h-4 text-blue-500" />
                <span>contato@imobinext.com</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Vamos conversar?</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="(48) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {submitMessage && (
                <div className={`p-3 rounded-lg text-sm font-medium mb-4 ${
                  submitMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : submitMessage.includes('❌')
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
                  </svg>
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}