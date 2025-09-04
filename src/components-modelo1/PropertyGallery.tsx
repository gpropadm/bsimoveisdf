'use client'

import { useState } from 'react'
import Image from 'next/image'
import PropertyGalleryModal from './PropertyGalleryModal'

interface PropertyGalleryProps {
  propertyTitle: string
  propertyPrice?: number
  propertyType?: string
  images?: string[]
}

export default function PropertyGallery({ 
  propertyTitle, 
  propertyPrice = 850000, 
  propertyType = 'venda',
  images = []
}: PropertyGalleryProps) {
  // Usar imagens fornecidas ou fallback para placeholder
  const photos = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
  ]

  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-4">
        {/* Foto principal */}
        <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 rounded-lg overflow-hidden cursor-pointer relative">
          <Image
            src={photos[currentPhoto]}
            alt={`${propertyTitle} - Foto ${currentPhoto + 1}`}
            fill
            className="object-cover"
            onClick={() => setIsModalOpen(true)}
            unoptimized
          />
          
          {/* Navegação anterior/próxima */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhoto(prev => prev === 0 ? photos.length - 1 : prev - 1);
            }}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-black/90 hover:shadow-xl transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhoto(prev => prev === photos.length - 1 ? 0 : prev + 1);
            }}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-black/90 hover:shadow-xl transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          
          {/* Contador de fotos */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            {currentPhoto + 1} / {photos.length}
          </div>
        </div>

        {/* Miniaturas */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentPhoto(index)}
              className={`relative h-12 sm:h-16 rounded-md overflow-hidden transition-all duration-300 ${
                currentPhoto === index 
                  ? 'ring-1 sm:ring-2 ring-blue-500 shadow-lg transform scale-105' 
                  : 'opacity-70 hover:opacity-100 hover:shadow-md'
              }`}
            >
              <Image
                src={photo}
                alt={`${propertyTitle} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>

      </div>

      {/* Modal Gallery */}
      <PropertyGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyTitle={propertyTitle}
        propertyPrice={propertyPrice}
        propertyType={propertyType}
        images={photos}
      />
    </>
  )
}