'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ArboGalleryProps {
  images: string[]
  propertyTitle: string
}

export default function ArboGallery({ images, propertyTitle }: ArboGalleryProps) {
  const [showGridModal, setShowGridModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Nenhuma imagem disponível</p>
        </div>
      </div>
    )
  }

  const openGridModal = () => {
    setShowGridModal(true)
    document.body.style.overflow = 'hidden'
  }

  const openImageModal = (index: number = 0) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
    setShowGridModal(false)
  }

  const closeGridModal = () => {
    setShowGridModal(false)
    document.body.style.overflow = 'auto'
  }

  const closeImageModal = () => {
    setShowImageModal(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Gestos de touch para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showImageModal && e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Placeholder para touchMove se necessário
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!showImageModal) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchStart.x - touchEndX
    const deltaY = touchStart.y - touchEndY
    const minSwipeDistance = 50

    // Swipe horizontal (maior que vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      e.preventDefault()
      if (deltaX > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
    // Swipe vertical para baixo - fechar modal
    else if (deltaY < -minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
      e.preventDefault()
      closeImageModal()
    }
  }

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showImageModal) {
        if (event.key === 'ArrowRight') {
          nextImage()
        } else if (event.key === 'ArrowLeft') {
          prevImage()
        } else if (event.key === 'Escape') {
          closeImageModal()
        }
      } else if (showGridModal) {
        if (event.key === 'Escape') {
          closeGridModal()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal, showGridModal])

  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNjAgMTgwIDgwLTgwIDgwIDgwdjQwSDE2MHYtNDBaIiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjE4MCIgY3k9IjEyMCIgcj0iMjAiIGZpbGw9IiM5Y2EzYWYiLz4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjMzYTgyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TZW0gaW1hZ2VtPC90ZXh0Pgo8L3N2Zz4K'

  return (
    <div className="w-full bg-white">
      {/* Gallery Container - Responsivo */}
      <div className="relative w-full">

        {/* MOBILE: Carrossel simples com setas */}
        {isMobile ? (
          <div className="relative w-full" style={{ height: '300px' }}>
            <div className="relative w-full h-full">
              <Image
                src={images[currentImageIndex]}
                alt={`${propertyTitle} - Foto ${currentImageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderSvg;
                }}
              />

              {/* Setas Mobile */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg z-10"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6-6 6z"/>
                    </svg>
                  </button>
                </>
              )}

              {/* Contador Mobile */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP: Layout 50/50 */
          <div className="flex flex-row gap-2 relative w-full" style={{ height: '400px' }}>
          {/* Primeira imagem - Desktop: 50% */}
          <div className="w-1/2" style={{ height: '400px' }}>
            <div
              className="relative w-full h-full cursor-pointer rounded overflow-hidden"
              onClick={() => openGridModal()}
            >
              <Image
                src={images[0]}
                alt={propertyTitle}
                fill
                sizes="50vw"
                className="object-cover transition-all hover:scale-105"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderSvg;
                }}
              />
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-all" />
            </div>
          </div>

          {/* Grid de imagens menores - Desktop: 4 em grade 2x2 */}
          <div className="w-1/2" style={{ height: '400px' }}>
            <div className="grid grid-cols-2 gap-2" style={{ height: '400px' }}>
              {images.slice(1, 5).map((image, index) => (
                <div key={index + 1} className="relative" style={{ height: '196px' }}>
                  <div
                    className="relative w-full h-full cursor-pointer rounded overflow-hidden"
                    onClick={() => openGridModal()}
                  >
                    <Image
                      src={image}
                      alt={`${propertyTitle} - Foto ${index + 2}`}
                      fill
                      sizes="25vw"
                      className="object-cover transition-all hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderSvg;
                      }}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-all" />

                    {/* Overlay para "Ver mais" na última imagem */}
                    {index === 3 && images.length > 5 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-white text-center">
                          <div className="text-lg font-semibold">+{images.length - 5}</div>
                          <div className="text-xs">Ver mais</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Ver Todas as Fotos - Apenas Desktop */}
          <button
            onClick={() => openGridModal()}
            className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 border-0 rounded-full px-3 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all text-sm font-medium text-white"
          >
            <i className="far fa-images text-base"></i>
            Ver todas as {images.length} fotos
          </button>
          </div>
        )}
      </div>

      {/* Modal da Galeria em Grade - Primeira Etapa */}
      {showGridModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            backgroundColor: 'white',
            overflowY: 'auto'
          }}
          onClick={closeGridModal}
          onTouchStart={(e) => {
            if (showGridModal) {
              setTouchStart({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              })
            }
          }}
          onTouchEnd={(e) => {
            if (showGridModal) {
              const deltaY = touchStart.y - e.changedTouches[0].clientY
              if (deltaY > 100) {
                closeGridModal()
              }
            }
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '100vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={closeGridModal}
              className="fixed top-4 right-4 bg-transparent border-0 text-gray-600 z-50 text-2xl hover:text-gray-800"
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Título */}
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-gray-800 text-xl font-medium mb-6 mt-8 text-left">
                Galeria de Fotos - {propertyTitle}
              </h2>
            </div>

            {/* Grid de Fotos - 2 colunas mobile, 4 desktop */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer overflow-hidden shadow-sm rounded"
                    style={{
                      aspectRatio: '4/3',
                      minHeight: '150px'
                    }}
                    onClick={() => openImageModal(index)}
                  >
                    <Image
                      src={image}
                      alt={`${propertyTitle} - Foto ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderSvg;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Galeria Individual - Segunda Etapa */}
      {showImageModal && (
        <div
          className="position-fixed w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            top: 0,
            left: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.95)'
          }}
        >
          <div className="position-relative w-100 h-100 d-flex align-items-center" style={{ maxWidth: '1200px', maxHeight: '100vh', padding: '20px' }}>

            {/* Seta Esquerda - Fora da imagem */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                className="bg-black/50 hover:bg-black/70 border-0 flex items-center justify-center transition-all"
                style={{
                  width: '50px',
                  height: '60px',
                  color: 'white',
                  marginRight: '20px',
                  flexShrink: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                </svg>
              </button>
            )}

            {/* Container da Imagem */}
            <div className="flex-1 position-relative h-100">
              {/* Botão Fechar */}
              <button
                onClick={closeImageModal}
                className="position-absolute bg-transparent border-0 text-white"
                style={{
                  top: '0px',
                  right: '0px',
                  zIndex: 10,
                  fontSize: '24px'
                }}
              >
                <i className="fas fa-times"></i>
              </button>

              {/* Imagem Principal */}
              <div
                className="position-relative w-100 h-100 d-flex align-items-center justify-content-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y' }}
              >
                <Image
                  src={images[currentImageIndex]}
                  alt={`${propertyTitle} - Foto ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Contador de Imagens */}
              <div
                className="position-absolute text-white bg-black px-3 py-1 rounded"
                style={{
                  bottom: '80px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  fontSize: '14px'
                }}
              >
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Thumbnails - 100% da tela */}
              <div
                ref={(el) => {
                  if (el) {
                    // Auto scroll quando a imagem atual muda
                    const currentThumb = el.children[currentImageIndex] as HTMLElement;
                    if (currentThumb) {
                      currentThumb.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                      });
                    }
                  }
                }}
                className="fixed left-0 right-0 flex gap-2 overflow-x-auto justify-center py-4"
                style={{
                  bottom: '60px',
                  width: '100vw',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="relative overflow-hidden transition-all rounded"
                    style={{
                      width: '100px',
                      minWidth: '100px',
                      maxWidth: '100px',
                      height: '70px',
                      opacity: index === currentImageIndex ? 1 : 0.6,
                      border: index === currentImageIndex ? '2px solid white' : '2px solid transparent'
                    }}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = placeholderSvg;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Seta Direita - Fora da imagem */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                className="bg-black/50 hover:bg-black/70 border-0 flex items-center justify-center transition-all"
                style={{
                  width: '50px',
                  height: '60px',
                  color: 'white',
                  marginLeft: '20px',
                  flexShrink: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6-6 6z"/>
                </svg>
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  )
}