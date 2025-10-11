'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PropertyVideoModal from './PropertyVideoModal'
import FavoriteButton from './FavoriteButton'
import { getPropertyUrl } from '@/lib/propertyUrl'

interface Property {
  id: string
  title: string
  slug: string
  city: string
  state: string
  price: number
  type: string
  images?: string[] | string
  category?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  totalArea?: number
  parking?: number
  video?: string
  // Campos específicos para apartamentos
  suites?: number
  apartmentTotalArea?: number
  apartmentUsefulArea?: number
}

interface PropertyStoriesSectionProps {
  properties: Property[]
  loading: boolean
  title?: string
}

export default function PropertyStoriesSection({ properties, loading, title = 'Descubra seu novo Lar' }: PropertyStoriesSectionProps) {
  const router = useRouter()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [likeStats, setLikeStats] = useState<{ likes: number; dislikes: number } | null>(null)
  const [userVote, setUserVote] = useState<{ liked: boolean } | null>(null)
  const [isLoadingVote, setIsLoadingVote] = useState(false)
  const [allVideos, setAllVideos] = useState<string[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  // Auto-play: troca de vídeo automaticamente quando termina
  useEffect(() => {
    if (isVideoModalOpen && allVideos.length > 1) {
      const videoElement = document.querySelector('video')

      const handleVideoEnd = () => {
        if (currentVideoIndex < allVideos.length - 1) {
          // Próximo vídeo
          const nextIndex = currentVideoIndex + 1
          setCurrentVideoIndex(nextIndex)
          setSelectedVideo(allVideos[nextIndex])
        } else {
          // Volta para o primeiro vídeo (loop)
          setCurrentVideoIndex(0)
          setSelectedVideo(allVideos[0])
        }
      }

      if (videoElement) {
        videoElement.addEventListener('ended', handleVideoEnd)
        return () => {
          videoElement.removeEventListener('ended', handleVideoEnd)
        }
      }
    }
  }, [isVideoModalOpen, allVideos, currentVideoIndex])


  const SkeletonCards = () => (
    <div className="text-center py-12">
      <p className="text-gray-500">Carregando imóveis...</p>
    </div>
  )

  if (loading) {
    return (
      <div className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <SkeletonCards />
        </div>
      </div>
    )
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePropertyClick = (slug: string) => {
    router.push(`/imovel/${slug}`)
  }

  const handleStoryClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  // Função para verificar se o imóvel tem vídeos
  const hasVideos = (property: Property) => {
    if (!property.video) return false
    
    try {
      // Tentar fazer parse como JSON array
      const videos = JSON.parse(property.video)
      return Array.isArray(videos) && videos.length > 0
    } catch {
      // Se não for JSON válido, assumir que é string única
      return property.video.trim() !== ''
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  const handleVideoClick = async (property: Property) => {
    if (property.video) {
      try {
        const videos = JSON.parse(property.video)
        const videoList = Array.isArray(videos) ? videos : [property.video]
        setAllVideos(videoList)
        setCurrentVideoIndex(0)
        setSelectedVideo(videoList[0])
        setSelectedPropertyId(property.id)
        setIsVideoModalOpen(true)

        // Carrega estatísticas e voto do usuário
        await loadVideoStats(property.id)
      } catch {
        setAllVideos([property.video])
        setCurrentVideoIndex(0)
        setSelectedVideo(property.video)
        setSelectedPropertyId(property.id)
        setIsVideoModalOpen(true)

        // Carrega estatísticas e voto do usuário
        await loadVideoStats(property.id)
      }
    }
  }

  const loadVideoStats = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/video-likes?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setLikeStats(data.stats)
        setUserVote(data.userVote)
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const handleVote = async (liked: boolean) => {
    if (!selectedPropertyId || isLoadingVote) return

    setIsLoadingVote(true)
    try {
      const response = await fetch('/api/video-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedPropertyId, liked })
      })

      if (response.ok) {
        const data = await response.json()
        setLikeStats(data.stats)
        setUserVote({ liked })
      }
    } catch (error) {
      console.error('Erro ao votar:', error)
    } finally {
      setIsLoadingVote(false)
    }
  }

  const handleVideoModalClose = () => {
    setIsVideoModalOpen(false)
    setSelectedVideo(null)
    setSelectedPropertyId(null)
    setLikeStats(null)
    setUserVote(null)
    setAllVideos([])
    setCurrentVideoIndex(0)
  }

  const handleNextVideo = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      const nextIndex = currentVideoIndex + 1
      setCurrentVideoIndex(nextIndex)
      setSelectedVideo(allVideos[nextIndex])
    }
  }

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1
      setCurrentVideoIndex(prevIndex)
      setSelectedVideo(allVideos[prevIndex])
    }
  }

  const handleShare = async () => {
    if (!selectedPropertyId) return

    const property = properties.find(p => p.id === selectedPropertyId)
    if (!property) return

    const shareUrl = `${window.location.origin}/imovel/${property.slug}`
    const shareText = `Confira este imóvel: ${property.title} - ${formatPrice(property.price)}`

    try {
      if (navigator.share) {
        // Usa API nativa de compartilhamento (mobile)
        await navigator.share({
          title: property.title,
          text: shareText,
          url: shareUrl
        })
      } else {
        // Fallback: copia para clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copiado para área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  return (
    <div className="pt-8 pb-8 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Título da Seção */}
        <h2 className="text-2xl md:text-3xl font-bold text-left mb-6 text-gray-800">
          {title}
        </h2>

        {/* Properties by City Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <ArboPropertyCard
                key={property.id}
                property={property}
                onViewDetails={handlePropertyClick}
                onVideoClick={handleVideoClick}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <PropertyVideoModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Modal de Vídeo Shorts */}
      {isVideoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={handleVideoModalClose}
        >
          <div className="relative flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {/* Botão Fechar */}
            <button
              onClick={handleVideoModalClose}
              className="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300 w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Contador de vídeos */}
            {allVideos.length > 1 && (
              <div className="absolute -top-12 left-0 text-white text-sm">
                {currentVideoIndex + 1} / {allVideos.length}
              </div>
            )}

            {/* Seta Anterior */}
            {allVideos.length > 1 && currentVideoIndex > 0 && (
              <button
                onClick={handlePrevVideo}
                className="absolute left-4 text-white text-4xl hover:text-gray-300 w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                style={{ zIndex: 10 }}
              >
                ‹
              </button>
            )}

            {/* Vídeo */}
            <video
              key={selectedVideo}
              src={selectedVideo}
              controls
              autoPlay
              className="rounded-lg shadow-2xl"
              style={{
                maxHeight: '85vh',
                maxWidth: '90vw',
                width: 'auto',
                height: 'auto'
              }}
            />

            {/* Seta Próxima */}
            {allVideos.length > 1 && currentVideoIndex < allVideos.length - 1 && (
              <button
                onClick={handleNextVideo}
                className="absolute right-4 text-white text-4xl hover:text-gray-300 w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
                style={{ zIndex: 10 }}
              >
                ›
              </button>
            )}

            {/* Botões laterais estilo YouTube Shorts */}
            <div className="flex flex-col gap-4" style={{ position: 'absolute', right: '-70px', bottom: '100px' }}>
              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isLoadingVote}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={userVote?.liked === true ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </button>
                <span className="text-white text-xs mt-1">{likeStats?.likes || 0}</span>
              </div>

              {/* Dislike */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleVote(false)}
                  disabled={isLoadingVote}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={userVote?.liked === false ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                </button>
                <span className="text-white text-xs mt-1">{likeStats?.dislikes || 0}</span>
              </div>

              {/* Compartilhar */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShare}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all cursor-pointer hover:scale-110"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                  </svg>
                </button>
                <span className="text-white text-xs mt-1">Enviar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Arbo Property Card Styles */
        .CarouselDefault_card__I_nK6 {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .ImovelCard_card__2FVbS {
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }


        .rec.rec-carousel-wrapper {
          position: relative;
          overflow: hidden;
        }

        .rec.rec-carousel {
          position: relative;
          overflow: hidden;
        }

        .ImovelCard_leftArrow__SY2Vj,
        .ImovelCard_rightArrow__wzdqx {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .ImovelCard_card__2FVbS:hover .ImovelCard_leftArrow__SY2Vj,
        .ImovelCard_card__2FVbS:hover .ImovelCard_rightArrow__wzdqx {
          opacity: 1;
        }

        .ImovelCard_leftArrow__SY2Vj {
          left: 10px;
        }

        .ImovelCard_rightArrow__wzdqx {
          right: 10px;
        }

        .ImovelCard_leftArrow__SY2Vj > div,
        .ImovelCard_rightArrow__wzdqx > div {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .ImovelCard_leftArrow__SY2Vj > div:hover,
        .ImovelCard_rightArrow__wzdqx > div:hover {
          background: white;
          transform: scale(1.1);
        }

        .rec.rec-slider-container {
          overflow: hidden;
          width: 100%;
        }

        .rec.rec-slider {
          display: flex;
          will-change: transform;
        }

        .rec.rec-carousel-item {
          flex-shrink: 0;
          width: 100%;
          height: 100%;
        }

        .rec.rec-pagination {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .rec.rec-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rec.rec-dot_active {
          background: white;
          transform: scale(1.2);
        }

        .ImovelCardInfo_info__QFwnz {
          padding: 16px;
        }

        .ImovelCardInfo_paddingTopTypeOfPropertie__fiRBi {
          padding-top: 8px;
        }

        .ImovelCardInfo_paddingBottomForTypeOfPropertie__XCT9C {
          padding-bottom: 8px;
        }

        .ImovelCardInfo_colorOfTypePropertie__OWVB6 {
          color: #666;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .ImovelCard_heartContent__U2wHd {
          color: #ddd;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .ImovelCard_heartContent__U2wHd:hover {
          color: #ff4757;
        }

        .ImovelCardInfo_colorOfTitleCondominium__IfTu_ {
          color: #333;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
        }

        .ImovelCardInfo_ellipsisOneLine__ryU_Q {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ImovelCardInfo_colorOfLocalization__frnmZ {
          color: #666;
          font-size: 14px;
          line-height: 1.4;
        }

        .ImovelCardInfo_addLineBottom___ASjw {
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .Icons_list__SlDEy {
          display: flex;
          flex-direction: row;
          gap: 20px;
          list-style: none;
          margin: 0;
          padding: 0;
          justify-content: space-between;
        }

        .Icons_list__SlDEy li {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #666;
          flex: 1;
          text-align: center;
        }

        .Icons_list__SlDEy li span:first-child {
          font-size: 13px;
          font-weight: 400;
          color: #333;
          line-height: 1;
        }

        .Icons_list__SlDEy li span:last-child {
          font-size: 12px;
          font-weight: 400;
          color: #666;
          line-height: 1;
        }

        .ImovelCardInfo_prices__ArwZg {
          width: 100%;
        }

        .ImovelCardInfo_sizeOfPrices__SyQDF {
          width: 100%;
        }

        .ImovelCardInfo_sizeOfPriceSale__KE1ms {
          font-size: 16px;
          font-weight: 700;
          color: #555;
        }

        .property-type-label {
          color: #666;
        }

        .position-relative {
          position: relative;
        }

        .d-flex {
          display: flex;
        }

        .flex-row {
          flex-direction: row;
        }

        .flex-column {
          flex-direction: column;
        }

        .justify-content-center {
          justify-content: center;
        }

        .justify-content-between {
          justify-content: space-between;
        }

        .justify-content-start {
          justify-content: flex-start;
        }

        .align-items-center {
          align-items: center;
        }

        .align-self-end {
          align-self: flex-end;
        }

        .c-pointer {
          cursor: pointer;
        }

        .rounded-circle {
          border-radius: 50%;
        }

        .bg-white {
          background-color: white;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .col-12 {
          width: 100%;
        }

        .p-0 {
          padding: 0;
        }

        .mb-0 {
          margin-bottom: 0;
        }

        .text-primitive-4 {
          color: #666;
        }
      `}</style>
    </div>
  )
}

// Componente ArboPropertyCard - fiel ao código da Arbo
function ArboPropertyCard({ property, onViewDetails, onVideoClick, formatPrice }: {
  property: Property
  onViewDetails: (slug: string) => void
  onVideoClick: (property: Property) => void
  formatPrice: (price: number) => string
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getImages = (images: string[] | string | undefined): string[] => {
    if (!images) return ['/placeholder-house.jpg']

    if (Array.isArray(images)) {
      return images.length > 0 ? images : ['/placeholder-house.jpg']
    }

    try {
      const imageArray = JSON.parse(images)
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray : ['/placeholder-house.jpg']
    } catch {
      return ['/placeholder-house.jpg']
    }
  }

  const images = getImages(property.images)

  // Função para verificar se o imóvel tem vídeos
  const hasVideos = () => {
    if (!property.video) return false

    try {
      const videos = JSON.parse(property.video)
      const hasVideo = Array.isArray(videos) && videos.length > 0
      console.log('🎥 Verificando vídeo para:', property.title, '- Tem vídeo:', hasVideo, '- Videos:', videos)
      return hasVideo
    } catch {
      const hasVideo = property.video.trim() !== ''
      console.log('🎥 Verificando vídeo (string) para:', property.title, '- Tem vídeo:', hasVideo)
      return hasVideo
    }
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }


  const propertyUrl = getPropertyUrl({
    category: property.category || 'imovel',
    type: property.type,
    state: property.state,
    city: property.city,
    slug: property.slug
  })

  return (
    <li className="CarouselDefault_card__I_nK6">
      <div className="ImovelCard_card__2FVbS">
        <a
          href={propertyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <div className="position-relative">
            <div style={{ width: '100%', height: '100%' }}>
              <picture>
                <div className="sc-jSUZER gvZxJM rec rec-carousel-wrapper">
                  <div className="sc-eDvSVe eTfUIS rec rec-carousel" style={{ height: '180px' }}>

                    {/* Left Arrow */}
                    {images.length > 1 && (
                      <div style={{ color: 'black' }}>
                        <div className="ImovelCard_leftArrow__SY2Vj">
                          <div
                            className="d-flex justify-content-center align-items-center c-pointer rounded-circle bg-white"
                            onClick={prevImage}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Slider Container */}
                    <div className="sc-dkrFOg itwfLR rec rec-slider-container">
                      <div
                        className="sc-hLBbgP gpusub rec rec-slider"
                        style={{
                          transition: '200ms ease',
                          display: 'flex',
                          transform: `translateX(-${currentImageIndex * 100}%)`
                        }}
                      >
                          {images.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="rec rec-carousel-item"
                              style={{
                                width: '100%',
                                flexShrink: 0,
                                height: '180px'
                              }}
                            >
                              <div
                                style={{ width: '100%', height: '180px', padding: '0px' }}
                                className="sc-gswNZR fUcWbd rec rec-item-wrapper"
                              >
                                <Image
                                  alt={`Foto do ${property.category || 'Imóvel'} - ${property.title}`}
                                  src={imageUrl}
                                  width={408}
                                  height={180}
                                  className="object-cover w-full h-full"
                                  loading="lazy"
                                  unoptimized
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-house.jpg'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    {images.length > 1 && (
                      <div style={{ color: 'black' }}>
                        <div className="ImovelCard_rightArrow__wzdqx">
                          <div
                            className="d-flex justify-content-center align-items-center c-pointer rounded-circle bg-white"
                            onClick={nextImage}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pagination Dots */}
                  {images.length > 1 && (
                    <div className="sc-iBYQkv gnDOZy rec rec-pagination">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => goToImage(index, e)}
                          className={`sc-gKPRtg ${
                            index === currentImageIndex ? 'goodpl rec rec-dot rec rec-dot_active' : 'hrBmXS rec rec-dot'
                          }`}
                          type="button"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </picture>
            </div>

            {/* Ícone de Shorts - aparece se tiver vídeo */}
            {hasVideos() && (
              <div
                className="position-absolute"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onVideoClick(property)
                }}
                style={{
                  top: '10px',
                  right: '10px',
                  zIndex: 20,
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              >
                {/* Ícone oficial YouTube Shorts */}
                <img
                  src="/youtube-shorts-icon.svg"
                  alt="Shorts"
                  width="25"
                  height="25"
                  style={{ display: 'block' }}
                />
              </div>
            )}

            {/* Card Info */}
            <div className="ImovelCardInfo_info__QFwnz">
              <div className="ImovelCardInfo_paddingTopTypeOfPropertie__fiRBi">
                <div className="col-12 p-0">
                  <h2 className="col-12 p-0">
                    <div className="ImovelCardInfo_paddingBottomForTypeOfPropertie__XCT9C d-flex flex-row justify-content-between align-items-center">
                      <span className="ImovelCardInfo_colorOfTypePropertie__OWVB6 text-primitive-4">
                        {property.category || 'Casa'}
                      </span>
                      <FavoriteButton
                        propertyId={property.id}
                        size="small"
                        variant="card"
                      />
                    </div>
                    <span className="ImovelCardInfo_colorOfTitleCondominium__IfTu_ ImovelCardInfo_ellipsisOneLine__ryU_Q d-flex flex-row justify-content-start">
                      {property.title.length > 40 ? `${property.title.substring(0, 40)}...` : property.title}
                    </span>
                  </h2>
                  <p className="ImovelCardInfo_colorOfLocalization__frnmZ mb-0">
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.address && `${property.address} - `}
                    </span>
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.city}
                    </span>
                    <br />
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.city} - {property.state}
                    </span>
                  </p>
                </div>

                <div className="col-12 align-self-end p-0">
                  <div className="ImovelCardInfo_addLineBottom___ASjw">
                    <ul className="Icons_list__SlDEy">
                      {property.category === 'apartamento' ? (
                        <>
                          {/* Para apartamentos, mostrar área do apartamento */}
                          {(property.apartmentUsefulArea || property.area) && (
                            <li>
                              <span>{property.apartmentUsefulArea || property.area} m²</span>
                              <span></span>
                            </li>
                          )}
                          {property.bedrooms && (
                            <li>
                              <span>{property.bedrooms}</span>
                              <span>Quartos</span>
                            </li>
                          )}
                          {property.suites && (
                            <li>
                              <span>{property.suites}</span>
                              <span>Suítes</span>
                            </li>
                          )}
                          {property.bathrooms && (
                            <li>
                              <span>{property.bathrooms}</span>
                              <span>Banheiros</span>
                            </li>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Para casas e outros imóveis - mostra área antes dos quartos */}
                          {property.area && (
                            <li>
                              <span>{property.area} m²</span>
                              <span></span>
                            </li>
                          )}
                          {property.bedrooms && (
                            <li>
                              <span>{property.bedrooms}</span>
                              <span>Quartos</span>
                            </li>
                          )}
                          {property.suites && (
                            <li>
                              <span>{property.suites}</span>
                              <span>Suítes</span>
                            </li>
                          )}
                          {property.bathrooms && (
                            <li>
                              <span>{property.bathrooms}</span>
                              <span>Banheiros</span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>

                  <h3 className="d-flex flex-row justify-content-start align-items-center">
                    <div className="ImovelCardInfo_prices__ArwZg ImovelCardInfo_widthSpace__o4SMY">
                      <div className="ImovelCardInfo_sizeOfPrices__SyQDF d-flex flex-column">
                        <div className="d-flex flex-row justify-content-between text-truncate">
                          <span className="property-type-label">{property.type === 'venda' ? 'Venda' : 'Aluguel'}</span>
                          <span className="ImovelCardInfo_sizeOfPriceSale__KE1ms d-flex flex-row text-truncate">
                            {formatPrice(property.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </li>
  )
}

