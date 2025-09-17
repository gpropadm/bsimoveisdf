'use client'

import { useState } from 'react'
import PropertyCard from './PropertyCard'
import PropertyVideoModal from './PropertyVideoModal'

interface Property {
  id: string
  title: string
  slug: string
  address: string
  city: string
  state: string
  price: number
  type: 'venda' | 'aluguel'
  bedrooms?: number
  bathrooms?: number
  parking?: number
  area?: number
  images?: string[]
  video?: string
}

interface FeaturedPropertiesSectionProps {
  properties: Property[]
  loading: boolean
}

export default function FeaturedPropertiesSection({ properties, loading }: FeaturedPropertiesSectionProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenVideo = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Imóveis em Destaque</h2>
          <p className="text-gray-600">Selecionamos os melhores imóveis para você</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-3 pt-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} onOpenVideo={handleOpenVideo} />
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      <PropertyVideoModal 
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  )
}