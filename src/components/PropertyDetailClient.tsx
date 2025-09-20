'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyGalleryWi from '@/components/PropertyGalleryWi'
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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white">
        {/* Header com menu */}
        <Header settings={settings} />

        {/* Galeria - 100% DA TELA SEM MARGEM NENHUMA */}
        <div className="w-full" style={{ marginTop: '80px' }}>
          <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <PropertyGalleryWi
              images={images}
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* Conteúdo básico */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {property.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {property.address}, {property.city} - {property.state}
          </p>

          <div className="text-5xl font-bold text-green-600 mb-8">
            {formatPrice(property.price)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {property.bedrooms && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{property.bedrooms}</div>
                <div className="text-gray-600">Quartos</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-3xl font-bold text-teal-600">{property.bathrooms}</div>
                <div className="text-gray-600">Banheiros</div>
              </div>
            )}
            {property.area && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{property.area}m²</div>
                <div className="text-gray-600">Área</div>
              </div>
            )}
            {property.parking && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{property.parking}</div>
                <div className="text-gray-600">Vagas</div>
              </div>
            )}
          </div>

          {property.description && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Interessado neste imóvel?
            </h3>
            <p className="text-gray-600 mb-4">
              Entre em contato conosco para mais informações.
            </p>
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
              Entrar em Contato
            </button>
          </div>
        </div>

        <Footer />
      </div>
    </ToastProvider>
  )
}