'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArboGallery from '@/components/ArboGallery'
import ArboBreadcrumbs from '@/components/ArboBreadcrumbs'
import SmartCalculator from '@/components/SmartCalculator'
import PropertyStoriesSection from '@/components/PropertyStoriesSection'
import FavoriteButton from '@/components/FavoriteButton'
import PriceAlertButton from '@/components/PriceAlertButton'
import PriceReducedBadge from '@/components/PriceReducedBadge'
import LeadForm from '@/components/LeadForm'
import AppointmentModal from '@/components/AppointmentModal'
import { ToastProvider } from '@/contexts/ToastContext'
import {
  MapPinIcon,
  ShareIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  previousPrice?: number | null
  priceReduced?: boolean
  priceReducedAt?: string | null
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
  // Campos específicos para apartamentos
  amenities: string | null
  condoFee: number | null
  floor: number | null
  suites: number | null
  iptu: number | null
  apartmentTotalArea: number | null
  apartmentUsefulArea: number | null
}

interface PropertyDetailClientProps {
  property: Property
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [relatedProperties, setRelatedProperties] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)

  // Breadcrumbs baseados na propriedade
  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Imóveis', href: '/imoveis' },
    { label: property.type === 'venda' ? 'Venda' : 'Aluguel', href: `/${property.type}` },
    { label: property.city, href: `/imoveis?city=${property.city}` },
    { label: property.title }
  ]

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

  // Buscar imóveis relacionados
  useEffect(() => {
    const fetchRelatedProperties = async () => {
      try {
        // Calcular faixa de preço (±30% do preço atual)
        const minPrice = Math.floor(property.price * 0.7)
        const maxPrice = Math.floor(property.price * 1.3)

        // Construir URL com parâmetros para buscar imóveis relacionados
        const params = new URLSearchParams({
          type: property.type,
          category: property.category,
          city: property.city,
          minPrice: minPrice.toString(),
          maxPrice: maxPrice.toString(),
          limit: '6'
        })

        const response = await fetch(`/api/properties?${params}`)
        const data = await response.json()

        // Filtrar para remover o imóvel atual
        const filtered = data.filter((p: any) => p.id !== property.id)
        setRelatedProperties(filtered.slice(0, 4)) // Máximo 4 imóveis relacionados

      } catch (error) {
        console.error('Erro ao buscar imóveis relacionados:', error)
        setRelatedProperties([])
      } finally {
        setLoadingRelated(false)
      }
    }

    fetchRelatedProperties()
  }, [property.id, property.type, property.category, property.city, property.price])

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
      <div className="min-h-screen bg-white">
        <Header />

        {/* Espaçamento do Header */}
        <div style={{ marginTop: '80px' }}></div>

        {/* Galeria - Full Width */}
        <div className="w-full px-4 lg:px-8">
          <ArboGallery
            images={images}
            propertyTitle={property.title}
          />
        </div>

        {/* Container Principal */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Coluna Principal - Informações do Imóvel */}
            <div className="lg:col-span-2 space-y-3">

              {/* Cabeçalho do Imóvel */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {property.title}
                    </h1>
                    <div className="flex items-center" style={{ color: '#5a5a5a' }}>
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      <span className="text-base">{property.address}, {property.city} - {property.state}</span>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-1.5 ml-4">
                    <FavoriteButton
                      propertyId={property.id}
                      size="small"
                      variant="page"
                    />
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 rounded-full border transition-colors flex items-center justify-center"
                      style={{ borderColor: '#e0e0e0', backgroundColor: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <ShareIcon className="w-5 h-5" style={{ color: '#5a5a5a' }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="w-6 h-6 mr-2" />
                  Características
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <HomeIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Tipo:</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{property.category}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Finalidade:</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{property.type === 'venda' ? 'Venda' : 'Aluguel'}</span>
                  </div>
                  {property.apartmentTotalArea && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 21V3L21 21H3M5 6.83L17.17 19H5V6.83Z" fill-rule="evenodd"/>
                        </svg>
                        <span className="text-sm text-gray-600">Área Total:</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{property.apartmentTotalArea}m²</span>
                    </div>
                  )}
                  {property.apartmentUsefulArea && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 21V3L21 21H3M5 6.83L17.17 19H5V6.83Z" fill-rule="evenodd"/>
                        </svg>
                        <span className="text-sm text-gray-600">Área Útil:</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{property.apartmentUsefulArea}m²</span>
                    </div>
                  )}

                  {/* Informações específicas para apartamentos */}
                  {property.category === 'apartamento' && (
                    <>
                      {property.floor && (
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <BuildingOffice2Icon className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">Andar:</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{property.floor}º andar</span>
                        </div>
                      )}
                      {property.suites && (
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7 9h14c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-1v2h-2v-2H10v2H8v-2H7c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2zm0 2v6h14v-6H7zM2 3h3v6H2V3zM3.5 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm1 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-1 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm1 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-1 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                            </svg>
                            <span className="text-sm text-gray-600">Suítes:</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{property.suites}</span>
                        </div>
                      )}
                      {property.condoFee && (
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                            </svg>
                            <span className="text-sm text-gray-600">Condomínio:</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(property.condoFee)}
                          </span>
                        </div>
                      )}
                      {property.iptu && (
                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <DocumentTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">IPTU:</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(property.iptu)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Sobre o Imóvel - Estilo Arbo */}
              {property.description && (
                <div className="bg-white rounded-3 border p-4 p-md-5" style={{ borderColor: '#e9ecef' }}>
                  <h2
                    className="fw-bold mb-4 font-sora text-lg md:text-xl"
                    style={{
                      color: '#212529',
                      lineHeight: '1.3'
                    }}
                  >
                    Sobre o imóvel
                  </h2>
                  <div
                    className="font-sora"
                    style={{
                      fontSize: '16px',
                      color: '#495057',
                      lineHeight: '1.6',
                      textAlign: 'justify'
                    }}
                    dangerouslySetInnerHTML={{ __html: property.description }}
                  />
                </div>
              )}

              {/* Comodidades do Condomínio - Separado apenas para apartamentos */}
              {property.category === 'apartamento' && property.amenities && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                    Comodidades do Condomínio
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {JSON.parse(property.amenities).map((amenity: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center py-2"
                      >
                        <span className="text-gray-500 mr-3 text-sm">✔</span>
                        <span className="text-gray-700 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar - Formulário de Contato - Estilo Arbo */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">

                {/* Card de Contato Principal - Estilo Arbo */}
                <div className="bg-white rounded-3 border p-4 mb-4" style={{ borderColor: '#e9ecef' }}>
                  <div className="mb-4">
                    <div
                      className="fw-bold mb-2 font-sora text-lg md:text-xl"
                      style={{
                        color: '#212529',
                        lineHeight: '1.2'
                      }}
                    >
                      {formatPrice(property.price)}
                    </div>

                    {/* Badge de Preço Reduzido */}
                    {property.priceReduced && (
                      <div className="mb-2">
                        <PriceReducedBadge
                          priceReduced={property.priceReduced}
                          previousPrice={property.previousPrice || undefined}
                          currentPrice={property.price}
                          size="md"
                        />
                      </div>
                    )}

                    <div
                      className="font-sora"
                      style={{
                        fontSize: '14px',
                        color: '#6c757d'
                      }}
                    >
                      {property.type === 'venda' ? 'À venda' : 'Para alugar'}
                      {property.area && ` • ${formatPrice(property.price / property.area)}/m²`}
                    </div>

                    {/* Condomínio e IPTU */}
                    {(property.condoFee || property.iptu) && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                        {property.condoFee && (
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span
                              className="font-sora"
                              style={{
                                fontSize: '14px',
                                color: '#6c757d'
                              }}
                            >
                              Condomínio
                            </span>
                            <span
                              className="fw-bold font-sora"
                              style={{
                                fontSize: '14px',
                                color: '#212529'
                              }}
                            >
                              {formatPrice(property.condoFee)}
                            </span>
                          </div>
                        )}
                        {property.iptu && (
                          <div className="d-flex justify-content-between align-items-center">
                            <span
                              className="font-sora"
                              style={{
                                fontSize: '14px',
                                color: '#6c757d'
                              }}
                            >
                              IPTU mensal
                            </span>
                            <span
                              className="fw-bold font-sora"
                              style={{
                                fontSize: '14px',
                                color: '#212529'
                              }}
                            >
                              {formatPrice(property.iptu)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3
                      className="fw-bold mb-3 font-sora"
                      style={{
                        fontSize: '18px',
                        color: '#212529'
                      }}
                    >
                      Interessado neste imóvel?
                    </h3>

                    {/* Formulário de Contato/Interesse */}
                    <div className="mb-3">
                      <LeadForm propertyId={property.id} propertyTitle={property.title} propertyPrice={property.price} propertyType={property.type} />
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        onClick={() => setIsAppointmentModalOpen(true)}
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-3 font-sora fw-semibold"
                        style={{
                          fontSize: '14px'
                        }}
                      >
                        <i className="fas fa-calendar" style={{ fontSize: '14px' }}></i>
                        Agendar Visita
                      </button>

                      <button
                        onClick={handleWhatsApp}
                        className="btn btn-success d-flex align-items-center justify-content-center gap-2 py-3 font-sora fw-semibold"
                        style={{
                          fontSize: '14px'
                        }}
                      >
                        <i className="fab fa-whatsapp" style={{ fontSize: '16px' }}></i>
                        WhatsApp
                      </button>

                      <button
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-3 font-sora fw-semibold"
                        style={{
                          fontSize: '14px'
                        }}
                      >
                        <i className="fas fa-phone" style={{ fontSize: '14px' }}></i>
                        Ligar Agora
                      </button>

                      <button
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-3 font-sora fw-semibold"
                        style={{
                          fontSize: '14px'
                        }}
                      >
                        <i className="fas fa-envelope" style={{ fontSize: '14px' }}></i>
                        Enviar E-mail
                      </button>

                      {/* Botão de Alerta de Preço */}
                      <div className="mt-2">
                        <PriceAlertButton
                          propertyId={property.id}
                          propertyTitle={property.title}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações da Imobiliária */}
                  <div
                    className="p-3 rounded-2 border-top"
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderTopColor: '#e9ecef !important'
                    }}
                  >
                    <div className="d-flex align-items-center mb-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#4f2de8',
                          color: 'white'
                        }}
                      >
                        <i className="fas fa-building" style={{ fontSize: '16px' }}></i>
                      </div>
                      <div>
                        <div
                          className="fw-bold font-sora"
                          style={{
                            fontSize: '14px',
                            color: '#212529'
                          }}
                        >
                          All Imóveis
                        </div>
                        <div
                          className="font-sora"
                          style={{
                            fontSize: '12px',
                            color: '#6c757d'
                          }}
                        >
                          Plataforma Imobiliária
                        </div>
                      </div>
                    </div>

                    <div
                      className="font-sora"
                      style={{
                        fontSize: '12px',
                        color: '#6c757d'
                      }}
                    >
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {property.address}, {property.city} - {property.state}
                    </div>
                  </div>
                </div>

                {/* Calculadora Inteligente */}
                <SmartCalculator
                  propertyPrice={property.price}
                  propertyType={property.type}
                />

                {/* Card de Características Rápidas */}
                <div className="bg-white rounded-3 border p-4" style={{ borderColor: '#e9ecef' }}>
                  <h4
                    className="fw-bold mb-3 font-sora"
                    style={{
                      fontSize: '16px',
                      color: '#212529'
                    }}
                  >
                    Características
                  </h4>

                  <div className="d-flex justify-content-between text-center">
                    {property.bedrooms && (
                      <div>
                        <i className="fas fa-bed" style={{ fontSize: '20px', color: '#6c757d' }}></i>
                        <div
                          className="fw-bold font-sora"
                          style={{ fontSize: '14px', color: '#212529' }}
                        >
                          {property.bedrooms}
                        </div>
                        <div
                          className="font-sora"
                          style={{ fontSize: '11px', color: '#6c757d' }}
                        >
                          Quartos
                        </div>
                      </div>
                    )}

                    {property.bathrooms && (
                      <div>
                        <i className="fas fa-bath" style={{ fontSize: '20px', color: '#6c757d' }}></i>
                        <div
                          className="fw-bold font-sora"
                          style={{ fontSize: '14px', color: '#212529' }}
                        >
                          {property.bathrooms}
                        </div>
                        <div
                          className="font-sora"
                          style={{ fontSize: '11px', color: '#6c757d' }}
                        >
                          Banheiros
                        </div>
                      </div>
                    )}

                    {property.area && (
                      <div>
                        <i className="fas fa-ruler-combined" style={{ fontSize: '20px', color: '#6c757d' }}></i>
                        <div
                          className="fw-bold font-sora"
                          style={{ fontSize: '14px', color: '#212529' }}
                        >
                          {property.area}m²
                        </div>
                        <div
                          className="font-sora"
                          style={{ fontSize: '11px', color: '#6c757d' }}
                        >
                          Área
                        </div>
                      </div>
                    )}

                    {property.parking && (
                      <div>
                        <i className="fas fa-car" style={{ fontSize: '20px', color: '#6c757d' }}></i>
                        <div
                          className="fw-bold font-sora"
                          style={{ fontSize: '14px', color: '#212529' }}
                        >
                          {property.parking}
                        </div>
                        <div
                          className="font-sora"
                          style={{ fontSize: '11px', color: '#6c757d' }}
                        >
                          Vagas
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Imóveis que Poderá Gostar */}
        {relatedProperties.length > 0 && (
          <div className="pb-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-2 text-center">Imóveis que Poderá Gostar</h2>
            </div>
            <PropertyStoriesSection
              properties={relatedProperties}
              loading={loadingRelated}
            />
          </div>
        )}

        <Footer />

        {/* Modal de Agendamento */}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          property={{
            id: property.id,
            title: property.title,
            address: property.address,
            price: property.price,
            type: property.type
          }}
        />
      </div>
    </ToastProvider>
  )
}