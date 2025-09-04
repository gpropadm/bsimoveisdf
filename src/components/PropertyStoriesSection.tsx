'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PropertyVideoModal from './PropertyVideoModal'
import FavoriteButton from './FavoriteButton'

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

interface PropertyStoriesSectionProps {
  properties: Property[]
  loading: boolean
}

export default function PropertyStoriesSection({ properties, loading }: PropertyStoriesSectionProps) {
  const router = useRouter()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)



  const SkeletonCards = () => (
    <div>
      <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              {/* Título */}
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-0.5"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              {/* Tipo do imóvel */}
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-0.5"></div>
              {/* Preço e Favorito */}
              <div className="flex justify-between items-center mb-0.5">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              {/* Cidade */}
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-1.5"></div>
              {/* Features */}
              <div className="flex space-x-4 mb-4">
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-14 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              {/* Botão */}
              <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="py-8 px-4 bg-gray-50">
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

  return (
    <div className="pt-2 pb-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">


        {/* Properties by City Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-2 text-left">Descubra seu novo Lar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onViewDetails={handlePropertyClick} formatPrice={formatPrice} onOpenVideo={handleStoryClick} hasVideos={hasVideos} />
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
      `}</style>
    </div>
  )
}

// Componente PropertyCard com carrossel de imagens
function PropertyCard({ property, onViewDetails, formatPrice, onOpenVideo, hasVideos }: {
  property: Property
  onViewDetails: (slug: string) => void
  formatPrice: (price: number) => string
  onOpenVideo?: (property: Property) => void
  hasVideos: (property: Property) => boolean
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const getImages = (images: string[] | string | undefined): string[] => {
    if (!images) return ['/placeholder-house.jpg']
    
    // Se já é um array, usar diretamente
    if (Array.isArray(images)) {
      return images.length > 0 ? images : ['/placeholder-house.jpg']
    }
    
    // Se é string, tentar fazer parse
    try {
      const imageArray = JSON.parse(images)
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray : ['/placeholder-house.jpg']
    } catch {
      return ['/placeholder-house.jpg']
    }
  }
  
  const images = getImages(property.images)
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  
  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image Carousel */}
      <div className="relative h-64 bg-gray-200">
        <Image
          src={images[currentImageIndex]}
          alt={`${property.title} - ${property.category} em ${property.city}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-house.jpg'
          }}
        />
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Image Counter */}
            <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
        
        {/* Favorite Button and Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-50">
          <div className="bg-white rounded-full p-0.5">
            <FavoriteButton propertyId={property.id} size="small" variant="card" />
          </div>
          <div className={`px-2 py-1 rounded-full flex items-center justify-center text-white ${
            property.type === 'venda' ? 'bg-teal-500' : 'bg-orange-500'
          }`}>
            <span className="text-xs font-medium">
              {property.type === 'venda' ? 'VENDA' : 'ALUGUEL'}
            </span>
          </div>
        </div>

        {/* Ícone de Shorts no canto inferior direito da foto */}
        {onOpenVideo && hasVideos(property) && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenVideo(property)
            }}
            className="absolute bottom-3 right-3 transition-all duration-300 group z-40 cursor-pointer"
            title="Ver vídeo do imóvel"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none">
              <rect x="-1" y="4" width="20" height="8" rx="4" fill="#FF0000" transform="rotate(120 12 12)"/>
              <rect x="2" y="12" width="20" height="8" rx="4" fill="#FF0000" transform="rotate(120 12 12)"/>
              <polygon points="9,8 9,16 17,12" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5"/>
            </svg>
          </button>
        )}
      </div>
      
      {/* Property Details */}
      <div className="p-4">
        {/* Título da propriedade */}
        <h3 className="font-raleway font-semibold text-base text-gray-700 line-clamp-2 mb-1">
          {property.title}
        </h3>
        
        {/* Tipo do imóvel - texto menor, lado esquerdo */}
        <p className="font-montserrat text-gray-600 text-sm capitalize mb-0.5">
          {property.category || 'Casa'}
        </p>
        
        {/* Preço */}
        <div className="mb-0.5">
          <span className="font-roboto font-bold text-lg text-gray-700">
            {formatPrice(property.price)}
          </span>
        </div>
        
        {/* Cidade - mesmo tamanho do tipo */}
        <p className="font-montserrat text-gray-600 text-sm mb-1.5">
          {property.city}
        </p>
        
        {/* Property Features - quartos, banheiros, garagem */}
        <div className="font-roboto flex items-center space-x-4 text-sm text-gray-500 mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Image src="/icons/icons8-sleeping-in-bed-50.png" alt="Ícone de quartos" width={16} height={16} className="opacity-60 mr-1" />
              {property.bedrooms} {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Image src="/icons/icons8-bathroom-32.png" alt="Ícone de banheiros" width={16} height={16} className="opacity-60 mr-1" />
              {property.bathrooms} {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}
            </div>
          )}
          {property.parking && (
            <div className="flex items-center">
              <Image src="/icons/icons8-hennessey-venom-30.png" alt="Ícone de garagem" width={16} height={16} className="opacity-60 mr-1" />
              {property.parking} {property.parking === 1 ? 'Vaga' : 'Vagas'}
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => onViewDetails(property.slug)}
          className="font-raleway w-full border border-gray-400 hover:border-gray-600 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 bg-transparent cursor-pointer"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  )
}