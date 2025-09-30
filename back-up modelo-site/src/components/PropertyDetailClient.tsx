'use client'

import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyGalleryWi from '@/components/PropertyGalleryWi'
import { useSettings } from '@/hooks/useSettings'
import { ToastProvider } from '@/contexts/ToastContext'
import {
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  BanknotesIcon,
  HomeIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

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
  const [isFavorited, setIsFavorited] = useState(false)

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

  const handleWhatsApp = () => {
    const message = `Olá! Tenho interesse no imóvel: ${property.title} - ${formatPrice(property.price)} - ${window.location.href}`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Confira este imóvel: ${property.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#f9f3ea' }}>
        <Header settings={settings} />

        {/* Galeria - Full Width */}
        <div className="w-full" style={{ marginTop: '80px' }}>
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <PropertyGalleryWi
              images={images}
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* Container Principal */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Coluna Principal - Informações do Imóvel */}
            <div className="lg:col-span-2 space-y-6">

              {/* Cabeçalho do Imóvel */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center mb-4" style={{ color: '#5a5a5a' }}>
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      <span className="text-lg">{property.address}, {property.city} - {property.state}</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className="p-3 rounded-full border transition-colors"
                      style={{
                        borderColor: '#e0e0e0',
                        backgroundColor: isFavorited ? '#f9f3ea' : 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f3ea'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isFavorited ? '#f9f3ea' : 'white'}
                    >
                      {isFavorited ? (
                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartIcon className="w-6 h-6" style={{ color: '#5a5a5a' }} />
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full border transition-colors"
                      style={{ borderColor: '#e0e0e0', backgroundColor: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f3ea'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <ShareIcon className="w-6 h-6" style={{ color: '#5a5a5a' }} />
                    </button>
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className={`text-4xl lg:text-5xl font-bold mb-2 ${
                    property.type === 'venda' ? 'text-teal-600' : 'text-orange-600'
                  }`}>
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.type === 'venda'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {property.type === 'venda' ? 'À Venda' : 'Para Alugar'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {property.category}
                    </span>
                  </div>
                </div>

                {/* Características Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.bedrooms && (
                    <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: '#f0f9ff', borderColor: '#e0e0e0' }}>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{property.bedrooms}</div>
                      <div className="text-sm" style={{ color: '#5a5a5a' }}>Quartos</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: '#f0fdfa', borderColor: '#e0e0e0' }}>
                      <div className="text-2xl font-bold text-teal-600 mb-1">{property.bathrooms}</div>
                      <div className="text-sm" style={{ color: '#5a5a5a' }}>Banheiros</div>
                    </div>
                  )}
                  {property.area && (
                    <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: '#fff7ed', borderColor: '#e0e0e0' }}>
                      <div className="text-2xl font-bold text-orange-600 mb-1">{property.area}m²</div>
                      <div className="text-sm" style={{ color: '#5a5a5a' }}>Área</div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: '#faf5ff', borderColor: '#e0e0e0' }}>
                      <div className="text-2xl font-bold text-purple-600 mb-1">{property.parking}</div>
                      <div className="text-sm" style={{ color: '#5a5a5a' }}>Vagas</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Descrição */}
              {property.description && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <HomeIcon className="w-6 h-6 mr-2" />
                    Sobre o Imóvel
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="leading-relaxed text-lg" style={{ color: '#5a5a5a' }}>
                      {property.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Características Detalhadas */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="w-6 h-6 mr-2" />
                  Características
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                    <span style={{ color: '#5a5a5a' }}>Tipo:</span>
                    <span className="font-medium text-gray-900">{property.category}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                    <span style={{ color: '#5a5a5a' }}>Finalidade:</span>
                    <span className="font-medium text-gray-900">{property.type === 'venda' ? 'Venda' : 'Aluguel'}</span>
                  </div>
                  {property.area && (
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                      <span style={{ color: '#5a5a5a' }}>Área Total:</span>
                      <span className="font-medium text-gray-900">{property.area}m²</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                      <span style={{ color: '#5a5a5a' }}>Quartos:</span>
                      <span className="font-medium text-gray-900">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                      <span style={{ color: '#5a5a5a' }}>Banheiros:</span>
                      <span className="font-medium text-gray-900">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: '#e0e0e0' }}>
                      <span style={{ color: '#5a5a5a' }}>Vagas de Garagem:</span>
                      <span className="font-medium text-gray-900">{property.parking}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Formulário de Contato */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Card de Contato Principal */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-2" style={{ borderColor: '#e0e0e0' }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Interessado neste imóvel?
                  </h3>
                  <p className="mb-6" style={{ color: '#5a5a5a' }}>
                    Entre em contato conosco para agendar uma visita ou tirar suas dúvidas.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={handleWhatsApp}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                      WhatsApp
                    </button>

                    <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <PhoneIcon className="w-5 h-5" />
                      Ligar Agora
                    </button>
                  </div>
                </div>

                {/* Card de Informações de Preço */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <BanknotesIcon className="w-5 h-5 mr-2" />
                    Informações de Preço
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-bold text-lg text-teal-600">{formatPrice(property.price)}</span>
                    </div>
                    {property.area && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor/m²:</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(property.price / property.area)}/m²
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card de Localização */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Localização
                  </h3>
                  <div className="space-y-2">
                    <p style={{ color: '#4a4a4a' }}>{property.address}</p>
                    <p style={{ color: '#5a5a5a' }}>{property.city}, {property.state}</p>
                  </div>

                  {/* Placeholder para mapa - você pode integrar Google Maps aqui */}
                  <div className="mt-4 h-48 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f0f0' }}>
                    <span style={{ color: '#5a5a5a' }}>Mapa - Em breve</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ToastProvider>
  )
}