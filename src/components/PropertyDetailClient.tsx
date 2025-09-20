'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyGalleryWi from '@/components/PropertyGalleryWi'
import FavoriteButton from '@/components/FavoriteButton'
import SimilarProperties from '@/components/SimilarProperties'
import AppointmentScheduler from '@/components/AppointmentScheduler'
import FarmInfo from '@/components/FarmInfo'
import { useSettings } from '@/hooks/useSettings'
import { ToastProvider } from '@/contexts/ToastContext'
import { formatAreaDisplay } from '@/lib/maskUtils'

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
  // Campos específicos para apartamentos/coberturas
  floor: number | null
  condoFee: number | null
  amenities: string | null
  // Campos específicos para terrenos
  zoning: string | null
  slope: string | null
  frontage: number | null
  // Campos específicos para fazendas
  totalArea: number | null
  cultivatedArea: number | null
  pastures: number | null
  buildings: string | null
  waterSources: string | null
  // Campos específicos para casas
  houseType: string | null
  yard: boolean | null
  garage: string | null
  // Campos específicos para imóveis comerciais
  commercialType: string | null
  floor_commercial: number | null
  businessCenter: string | null
  features: string | null
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
      if (imageData.startsWith('[')) {
        const parsed = JSON.parse(imageData)
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/placeholder-house.jpg']
      } else {
        return [imageData]
      }
    } catch {
      return [imageData]
    }
  }

  const images = parseImages(property.images)

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

      // WhatsApp integration handled by API

      // Abrir WhatsApp (funcionamento original) - REMOVIDO para usar apenas nossa integração automática
      // const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`
      // window.open(whatsappURL, '_blank')

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


  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        <Header settings={settings} />

        <div className="pt-20">
          {/* Container principal da página */}
          <div className="max-w-7xl mx-auto px-4">

            {/* Galeria */}
            <div className="mb-8">
              <PropertyGalleryWi
                images={images}
                propertyTitle={property.title}
              />
            </div>

            {/* Conteúdo: Info + Formulário */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações do Imóvel - 2/3 da largura */}
            <div className="lg:col-span-2">
              {/* Título e Localização */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600">
                  {property.address}, {property.city} - {property.state}
                </p>
              </div>

              {/* Preço e Ações */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                      property.type === 'venda' ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {property.type}
                    </span>
                    <span className="text-sm text-gray-600 capitalize">
                      {property.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FavoriteButton propertyId={property.id} size="large" />
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Compartilhar
                  </button>
                </div>
              </div>

              {/* Características principais */}
              {(property.bedrooms || property.bathrooms || property.area) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v11h2v3h2v-3h8v3h2v-3h2V5h-2v2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                          <div className="text-xs text-gray-600">Dormitório{property.bedrooms > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    )}

                    {property.bathrooms && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 2v1h6V2a1 1 0 0 1 2 0v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h1V2a1 1 0 0 1 2 0zm0 6v10h6V8H9z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                          <div className="text-xs text-gray-600">Banheiro{property.bathrooms > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    )}

                    {property.area && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{formatAreaDisplay(property.area, property.category)}</div>
                          <div className="text-xs text-gray-600">Área</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descrição */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>

            {/* Formulário Tenho Interesse - 1/3 da largura */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tenho Interesse
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="seu@email.com"
                      required
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
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      placeholder="Sua mensagem..."
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      submitMessage.includes('✅')
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Enviando...
                      </>
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
            </div>
          </div>

          {/* Detalhes do Imóvel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2">
              
              {/* Property Features - Only show if there are any features to display */}
              {(property.bedrooms || property.bathrooms || property.parking || (property.area && property.area > 0 && property.category !== 'fazenda')) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
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
                    {property.area && property.area > 0 && property.category !== 'fazenda' && (
                      <div className="bg-white p-3 rounded-lg text-center">
                        <svg className="w-6 h-6 mx-auto mb-1 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                        </svg>
                        <div className="text-lg font-semibold text-gray-900">{formatAreaDisplay(property.area)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Apartment/Condo Specific Info */}
              {(property.category === 'apartamento' || property.category === 'cobertura') && (
                <ApartmentInfo property={property} />
              )}

              {/* House Specific Info */}
              {property.category === 'casa' && (
                <HouseInfo property={property} />
              )}


              {/* Land Specific Info */}
              {property.category === 'terreno' && (
                <LandInfo property={property} />
              )}

              {/* Farm Specific Info */}
              {property.category === 'fazenda' && (
                <FarmInfo property={property} />
              )}

              {/* Commercial Specific Info */}
              {(property.category === 'comercial' || property.category === 'loja' || property.category === 'sala') && (
                <CommercialInfo property={property} />
              )}

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

            {/* Right Column - Appointment Scheduler Only */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <AppointmentScheduler propertyId={property.id} propertyTitle={property.title} />
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <SimilarProperties
            currentPropertyId={property.id}
            city={property.city}
            state={property.state}
            address={property.address}
            price={property.price}
            type={property.type}
            category={property.category}
            bedrooms={property.bedrooms || undefined}
          />
          </div>
        </div>

        <Footer />
      </div>
    </ToastProvider>
  )
}

// Componente para informações específicas de apartamentos/coberturas
function ApartmentInfo({ property }: { property: Property }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const parseAmenities = (amenities: string | null): string[] => {
    if (!amenities) return []
    try {
      return JSON.parse(amenities)
    } catch {
      return []
    }
  }

  const amenitiesList = parseAmenities(property.amenities)

  if (!property.floor && !property.condoFee && amenitiesList.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Apartamento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {property.floor && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{property.floor}º Andar</div>
                <div className="text-sm text-gray-600">Andar do apartamento</div>
              </div>
            </div>
          </div>
        )}
        
        {property.condoFee && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{formatPrice(property.condoFee)}</div>
                <div className="text-sm text-gray-600">Taxa de condomínio</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {amenitiesList.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comodidades do Condomínio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenitiesList.map((amenity, index) => (
              <div key={index} className="bg-white px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {amenity}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para informações específicas de casas
function HouseInfo({ property }: { property: Property }) {
  if (!property.houseType && property.yard === null && !property.garage) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações da Casa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {property.houseType && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tipo</div>
                <div className="font-semibold text-gray-900 capitalize">{property.houseType}</div>
              </div>
            </div>
          </div>
        )}

        {property.yard !== null && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Quintal</div>
                <div className="font-semibold text-gray-900">{property.yard ? 'Sim' : 'Não'}</div>
              </div>
            </div>
          </div>
        )}

        {property.garage && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Garagem</div>
                <div className="font-semibold text-gray-900 capitalize">{property.garage}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


// Componente para informações específicas de terrenos
function LandInfo({ property }: { property: Property }) {
  if (!property.zoning && !property.slope && !property.frontage) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Terreno</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {property.zoning && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Zoneamento</div>
                <div className="font-semibold text-gray-900 capitalize">{property.zoning}</div>
              </div>
            </div>
          </div>
        )}

        {property.slope && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Topografia</div>
                <div className="font-semibold text-gray-900 capitalize">{property.slope}</div>
              </div>
            </div>
          </div>
        )}

        {property.frontage && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Frente</div>
                <div className="font-semibold text-gray-900">{formatAreaDisplay(property.frontage)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para informações específicas de imóveis comerciais
function CommercialInfo({ property }: { property: Property }) {
  const parseFeatures = (features: string | null): string[] => {
    if (!features) return []
    try {
      return JSON.parse(features)
    } catch {
      return []
    }
  }

  const featuresList = parseFeatures(property.features)

  if (!property.commercialType && !property.floor_commercial && !property.businessCenter && featuresList.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Comerciais</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {property.commercialType && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tipo</div>
                <div className="font-semibold text-gray-900 capitalize">{property.commercialType}</div>
              </div>
            </div>
          </div>
        )}

        {property.floor_commercial && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Andar</div>
                <div className="font-semibold text-gray-900">{property.floor_commercial}º</div>
              </div>
            </div>
          </div>
        )}

        {property.businessCenter && (
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Empreendimento</div>
                <div className="font-semibold text-gray-900">{property.businessCenter}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {featuresList.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Características Comerciais</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featuresList.map((feature, index) => (
              <div key={index} className="bg-white px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}