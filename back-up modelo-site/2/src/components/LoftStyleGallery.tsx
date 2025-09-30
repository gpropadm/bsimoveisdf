'use client'

import { useState } from 'react'
import Image from 'next/image'
import LoftStyleCarousel from './LoftStyleCarousel'

interface LoftStyleGalleryProps {
  images: string[]
  title?: string
  className?: string
}

export default function LoftStyleGallery({ 
  images, 
  title = '',
  className = ''
}: LoftStyleGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  if (images.length === 0) return null

  const openModal = (index: number = 0) => {
    setSelectedImage(index)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Carousel */}
        <div 
          className="cursor-pointer"
          onClick={() => openModal(0)}
        >
          <LoftStyleCarousel
            images={images}
            title={title}
            autoPlay={true}
            showIndicators={true}
          />
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={index}
                onClick={() => openModal(index)}
                className="relative h-20 bg-gray-100 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                <Image
                  src={image}
                  alt={`${title} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </button>
            ))}
            
            {/* Show more button if there are more than 8 images */}
            {images.length > 8 && (
              <button
                onClick={() => openModal(8)}
                className="relative h-20 bg-gray-900 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-white"
              >
                <span className="text-xs font-medium">+{images.length - 8}</span>
                <span className="text-xs opacity-75">mais</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Gallery */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Carousel */}
            <div className="w-full max-w-6xl max-h-[90vh]">
              <LoftStyleCarousel
                images={images}
                title={title}
                autoPlay={false}
                showIndicators={true}
                className="max-h-[90vh]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}