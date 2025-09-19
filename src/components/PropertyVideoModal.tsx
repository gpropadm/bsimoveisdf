'use client'

import { useState, useEffect, useRef } from 'react'
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
  video?: string
}

interface PropertyVideoModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export default function PropertyVideoModal({ property, isOpen, onClose }: PropertyVideoModalProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Função para obter lista de vídeos
  const getVideos = (videoData: string | null): string[] => {
    console.log('🎬 Getting videos from:', videoData)

    // Se não há vídeo, retornar 2 vídeos de teste para demonstrar stories
    if (!videoData) {
      console.log('📹 No video data, using test videos')
      return [
        `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`,
        `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4`
      ]
    }

    try {
      // Tentar fazer parse como JSON array
      const videos = JSON.parse(videoData)
      console.log('✅ Parsed videos:', videos)
      if (Array.isArray(videos) && videos.length > 0) {
        return videos
      }
    } catch {
      console.log('📹 Not JSON, using as single video')
      // Se não for JSON válido, assumir que é string única
      if (videoData.trim()) {
        return [videoData]
      }
    }

    // Fallback para vídeos de exemplo
    console.log('📹 Using fallback test videos')
    return [
      `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`,
      `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4`
    ]
  }

  const videos = getVideos(property?.video || null)

  // Controle de progresso e navegação automática baseado na duração real
  useEffect(() => {
    console.log('📊 Progress effect:', { isOpen, isPlaying, videoIndex: currentVideoIndex })

    if (!isOpen || !isPlaying || !videoRef.current) return

    const video = videoRef.current

    // Aguardar carregamento do vídeo para obter duração real
    const startTimer = () => {
      const duration = video.duration

      if (!duration || isNaN(duration)) {
        console.log('⏳ Waiting for video to load...')
        return
      }

      console.log('⏱️ Starting timer with REAL duration:', { duration, currentVideoIndex, totalVideos: videos.length })

      // Limpar intervalo anterior
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      // Iniciar progresso
      setProgress(0)
      const startTime = Date.now()

      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000
        const newProgress = Math.min((elapsed / duration) * 100, 100)

        setProgress(newProgress)

        // Avançar para próximo vídeo quando terminar
        if (newProgress >= 100) {
          console.log('✅ Video finished, going to next')
          goToNextVideo()
        }
      }, 100)
    }

    // Se o vídeo já carregou, iniciar imediatamente
    if (video.duration && !isNaN(video.duration)) {
      startTimer()
    } else {
      // Se não carregou ainda, aguardar evento loadedmetadata
      const handleLoadedMetadata = () => {
        console.log('📽️ Video metadata loaded, duration:', video.duration)
        startTimer()
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isOpen, isPlaying, currentVideoIndex])

  // Reset video index when property changes
  useEffect(() => {
    setCurrentVideoIndex(0)
    setProgress(0)
  }, [property])

  // Body overflow control
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCurrentVideoIndex(0) // Reset to first video
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isOpen])

  // Reset progress when video changes
  useEffect(() => {
    setProgress(0)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [currentVideoIndex])

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

  const goToNextVideo = () => {
    console.log('⏭️ Next video:', { current: currentVideoIndex, total: videos.length })
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1)
    } else {
      // Fechar modal quando terminar todos os vídeos
      console.log('🔚 All videos finished, closing modal')
      handleClose()
    }
  }

  const goToPreviousVideo = () => {
    console.log('⏮️ Previous video:', { current: currentVideoIndex })
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
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

  const currentVideoUrl = videos[currentVideoIndex]

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
            ref={videoRef}
            key={currentVideoIndex} // Force re-render when video changes
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            controls={false}
            onLoadedData={() => {
              if (videoRef.current && isPlaying) {
                videoRef.current.play()
              }
            }}
          >
            <source src={currentVideoUrl} type="video/mp4" />
            {currentVideoUrl.includes('.mov') && <source src={currentVideoUrl} type="video/quicktime" />}
            Seu navegador não suporta vídeo.
          </video>

          {/* Touch areas for navigation */}
          <div className="absolute inset-0 flex">
            {/* Left side - previous video */}
            {currentVideoIndex > 0 && (
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={goToPreviousVideo}
              />
            )}

            {/* Center - play/pause */}
            <div
              className="flex-1 h-full cursor-pointer flex items-center justify-center"
              onClick={togglePlayPause}
            >
              {!isPlaying && (
                <div className="bg-black/50 rounded-full p-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Right side - next video */}
            {currentVideoIndex < videos.length - 1 && (
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={goToNextVideo}
              />
            )}
          </div>

          {/* Navigation Controls */}
          {videos.length > 1 && (
            <>
              {/* Previous Button */}
              {currentVideoIndex > 0 && (
                <button
                  onClick={goToPreviousVideo}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Next Button */}
              {currentVideoIndex < videos.length - 1 && (
                <button
                  onClick={goToNextVideo}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none">
            {/* Stories Progress Bars - Instagram Style */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
              {videos.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width: index < currentVideoIndex
                        ? '100%'
                        : index === currentVideoIndex
                        ? `${progress}%`
                        : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Info */}
            <div className="absolute top-12 left-4 right-4 pointer-events-auto">
              <div className="flex items-start justify-between">
                <button
                  onClick={handleTitleClick}
                  className="text-white hover:text-gray-200 transition-colors flex-1"
                >
                  <h3 className="font-semibold text-lg mb-1 text-left">{property.title}</h3>
                  <p className="text-sm text-gray-200">{property.city}</p>
                </button>

                {/* Video Counter */}
                {videos.length > 1 && (
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                    {currentVideoIndex + 1} / {videos.length}
                  </div>
                )}
              </div>
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
                    {property.bedrooms && property.bedrooms > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                        </svg>
                        {property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}
                      </div>
                    )}
                    {property.bathrooms && property.bathrooms > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16a3 3 0 01-3-3V6a1 1 0 011-1h1V3a1 1 0 112 0v2h2V3a1 1 0 112 0v2h1a1 1 0 011 1v7a3 3 0 01-3 3H8zM6 8v5a1 1 0 001 1h6a1 1 0 001-1V8H6z" />
                        </svg>
                        {property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}
                      </div>
                    )}
                    {property.area && property.area > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        {property.area && property.area > 0 ? `${property.area}m²` : ''}
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

          </div>
        </div>
      </div>
    </div>
  )
}