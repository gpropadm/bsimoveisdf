'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PropertyGallery2Props {
  propertyTitle: string
}

export default function PropertyGallery2({ propertyTitle }: PropertyGallery2Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Mock images - in real app, these would come from property.images
  const mockImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop&q=80'
  ]

  // Check if mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % mockImages.length)
    }, 4000) // Muda a imagem a cada 4 segundos

    return () => clearInterval(interval)
  }, [mockImages.length])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mockImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mockImages.length) % mockImages.length)
  }


  return (
    <div className="w-full overflow-hidden bg-purple-500">
      {/* Slider Container */}
      <div className="relative h-64 lg:h-80 overflow-hidden">
        {/* Images Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full gap-1 sm:gap-2 px-2 sm:px-4"
          style={{ 
            transform: isMobile 
              ? `translateX(calc(-${currentImageIndex * 90}% - ${currentImageIndex * 4}px))`
              : `translateX(calc(-${currentImageIndex * 35}% - ${currentImageIndex * 8}px))`
          }}
        >
          {mockImages.map((image, index) => (
            <div key={index} className="w-[90%] sm:w-[35%] h-full relative overflow-hidden shadow-lg flex-shrink-0">
              <Image
                src={image}
                alt={`${propertyTitle} - Foto ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-3 sm:p-6 pointer-events-none">
          <button
            onClick={prevImage}
            className="bg-white bg-opacity-30 hover:bg-opacity-60 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-200 pointer-events-auto"
          >
            <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="bg-white bg-opacity-80 hover:bg-opacity-95 text-gray-800 p-2 sm:p-3 rounded-full transition-all duration-200 pointer-events-auto shadow-lg"
          >
            <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}