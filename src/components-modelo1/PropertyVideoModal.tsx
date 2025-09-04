'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Property {
  id: string
  title: string
  slug: string
  city: string
  price: number
  type: string
  images?: string[] | string
  category?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  parking?: number
  videoUrl?: string
}

interface PropertyVideoModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export default function PropertyVideoModal({ property, isOpen, onClose }: PropertyVideoModalProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleTitleClick = () => {
    handleClose()
    router.push(`/imovel/${property?.slug}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (!isOpen || !property) return null

  // Video URL placeholder - será substituído por vídeos reais do imóvel
  const videoUrl = property.videoUrl || `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-sm mx-4 transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Container - Aspect Ratio 9:16 (Stories format) */}
        <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          {/* Video */}
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          >
            <source src={videoUrl} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none">
            {/* Top Info */}
            <div className="absolute top-4 left-4 right-4 pointer-events-auto">
              <button
                onClick={handleTitleClick}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-1 text-left">{property.title}</h3>
                <p className="text-sm text-gray-200">{property.city}</p>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-auto">
              {/* Property Details */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold">
                    {formatPrice(property.price)}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    {property.type === 'venda' ? 'Venda' : 'Aluguel'}
                  </span>
                </div>
                
                {/* Features */}
                {(property.bedrooms || property.bathrooms || property.area) && (
                  <div className="flex items-center space-x-4 text-sm">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                        </svg>
                        {property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16a3 3 0 01-3-3V6a1 1 0 011-1h1V3a1 1 0 112 0v2h2V3a1 1 0 112 0v2h1a1 1 0 011 1v7a3 3 0 01-3 3H8zM6 8v5a1 1 0 001 1h6a1 1 0 001-1V8H6z" />
                        </svg>
                        {property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {property.area}m²
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleTitleClick}
                  className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl transition-colors font-medium"
                >
                  Ver Detalhes
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-colors font-medium">
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute top-12 left-4 right-4 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full animate-pulse"
                style={{ 
                  width: '100%',
                  animation: 'progress 15s linear infinite'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  )
}