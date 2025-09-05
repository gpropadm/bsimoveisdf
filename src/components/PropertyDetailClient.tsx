'use client'

import { useState, useEffect, Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyGallery from '@/components/PropertyGallery'
import FavoriteButton from '@/components/FavoriteButton'
import SimilarProperties from '@/components/SimilarProperties'
import AppointmentScheduler from '@/components/AppointmentScheduler'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useSettings } from '@/hooks/useSettings'
import { ToastProvider } from '@/contexts/ToastContext'

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  type: string
  category: string
  address: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  area: number | null
  images: string | null
  video: string | null
  slug: string
}

interface PropertyDetailClientProps {
  property: Property
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const { settings } = useSettings()
  
  // Estados do formulário de interesse
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: `Olá! Tenho interesse no imóvel "${property.title}". Gostaria de mais informações.`
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Parse images safely
  const parseImages = (imageData: string | null): string[] => {
    if (!imageData) return ['/placeholder-house.jpg']
    
    try {
      const parsed = JSON.parse(imageData)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/placeholder-house.jpg']
    } catch {
      return ['/placeholder-house.jpg']
    }
  }

  const images = parseImages(property.images)
  const videoUrl = property.video || null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitMessage('❌ Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
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
          propertyTitle: property.title,
          propertyPrice: property.price,
          propertyId: property.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar dados')
      }

      // WhatsApp message
      const message = `*INTERESSE EM IMÓVEL*

*Imóvel:* ${property.title}
*Preço:* ${formatPrice(property.price)}
*Link:* ${window.location.href}

*Dados do Cliente:*
*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
*Email:* ${formData.email}

*Mensagem:*
${formData.message}

*Data:* ${new Date().toLocaleString('pt-BR')}`

      // Buscar configurações para pegar o WhatsApp
      const settingsResponse = await fetch('/api/admin/settings')
      const settingsData = await settingsResponse.json()
      const whatsappNumber = settingsData.site?.contactWhatsapp || '5548998645864'
      
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappURL, '_blank')

      setSubmitMessage('✅ Interesse enviado com sucesso! Em breve entraremos em contato.')
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: `Olá! Tenho interesse no imóvel "${property.title}". Gostaria de mais informações.`
        })
        setSubmitMessage('')
      }, 3000)

    } catch (error) {
      console.error('Erro:', error)
      setSubmitMessage('❌ Erro ao enviar dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Confira este imóvel: ${property.title} - ${formatPrice(property.price)}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: property.type === 'venda' ? 'Venda' : 'Aluguel', href: `/${property.type}` },
    { label: property.city, href: `/${property.type}?city=${encodeURIComponent(property.city)}` },
    { label: property.title, href: '', current: true },
  ]

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        <Header settings={settings} />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* Property Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-base text-gray-600 mb-2">
                  {property.address}, {property.city} - {property.state}
                </p>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.type === 'venda' ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {property.type === 'venda' ? 'VENDA' : 'ALUGUEL'}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {property.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <FavoriteButton propertyId={property.id} size="large" />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Compartilhar
                </button>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Gallery and Details */}
            <div className="lg:col-span-2">
              {/* Property Gallery */}
              <PropertyGallery 
                images={images} 
                propertyTitle={property.title}
                propertyPrice={property.price}
                propertyType={property.type}
              />
              
              {/* Property Features */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms && (
                    <div className="bg-white p-3 rounded-lg text-center">
                      <img src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-6 h-6 mx-auto mb-1 opacity-60" />
                      <div className="text-lg font-semibold text-gray-900">{property.bedrooms}</div>
                      <div className="text-xs text-gray-600">{property.bedrooms === 1 ? 'Quarto' : 'Quartos'}</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="bg-white p-3 rounded-lg text-center">
                      <img src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-6 h-6 mx-auto mb-1 opacity-60" />
                      <div className="text-lg font-semibold text-gray-900">{property.bathrooms}</div>
                      <div className="text-xs text-gray-600">{property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}</div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="bg-white p-3 rounded-lg text-center">
                      <img src="/icons/icons8-hennessey-venom-30.png" alt="Garagem" className="w-6 h-6 mx-auto mb-1 opacity-60" />
                      <div className="text-lg font-semibold text-gray-900">{property.parking}</div>
                      <div className="text-xs text-gray-600">{property.parking === 1 ? 'Vaga' : 'Vagas'}</div>
                    </div>
                  )}
                  {property.area && (
                    <div className="bg-white p-3 rounded-lg text-center">
                      <svg className="w-6 h-6 mx-auto mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                      </svg>
                      <div className="text-lg font-semibold text-gray-900">{property.area}</div>
                      <div className="text-xs text-gray-600">m²</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact Form and Appointment */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Interest Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tenho Interesse
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {submitMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        submitMessage.includes('✅') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {submitMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Enviar Interesse
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Appointment Scheduler */}
                <AppointmentScheduler propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        <SimilarProperties 
          currentProperty={property} 
          category={property.category} 
          city={property.city} 
        />
      </main>

        <Footer />
      </div>
    </ToastProvider>
  )
}