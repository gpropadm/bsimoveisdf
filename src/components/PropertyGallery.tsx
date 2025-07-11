'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PropertyGalleryProps {
  propertyTitle: string
}

export default function PropertyGallery({ propertyTitle }: PropertyGalleryProps) {
  // Fotos de exemplo - em produção viriam do banco de dados
  const photos = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560449752-ac516afe327b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop'
  ]

  const [currentPhoto, setCurrentPhoto] = useState(0)

  return (
    <div className="space-y-4">
      {/* Foto principal */}
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
        <Image
          src={photos[currentPhoto]}
          alt={`${propertyTitle} - Foto ${currentPhoto + 1}`}
          fill
          className="object-cover"
          priority
        />
        
        {/* Navegação anterior/próxima */}
        <button
          onClick={() => setCurrentPhoto(prev => prev === 0 ? photos.length - 1 : prev - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full shadow-lg hover:bg-black/90 hover:shadow-xl transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={() => setCurrentPhoto(prev => prev === photos.length - 1 ? 0 : prev + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full shadow-lg hover:bg-black/90 hover:shadow-xl transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        {/* Contador de fotos */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentPhoto + 1} / {photos.length}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setCurrentPhoto(index)}
            className={`relative h-16 rounded-sm overflow-hidden border-2 transition-all ${
              currentPhoto === index 
                ? 'border-blue-500 scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image
              src={photo}
              alt={`${propertyTitle} - Miniatura ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Labels das fotos */}
      <div className="text-center text-sm text-gray-600">
        {[
          'Fachada',
          'Sala de estar',
          'Cozinha',
          'Quarto principal',
          'Banheiro',
          'Área externa',
          'Garagem',
          'Vista área'
        ][currentPhoto]}
      </div>
    </div>
  )
}