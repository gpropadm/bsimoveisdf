'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PropertyGalleryWiProps {
  images: string[]
  propertyTitle: string
}

export default function PropertyGalleryWi({ images, propertyTitle }: PropertyGalleryWiProps) {
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Nenhuma imagem disponível</p>
      </div>
    )
  }

  const mainImage = images[0]
  const thumbnailImages = images.slice(1, 5) // Próximas 4 imagens
  const remainingCount = Math.max(0, images.length - 5)

  const openModal = (index: number = 0) => {
    setCurrentImageIndex(index)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      {/* Galeria Principal */}
      <div className="w-full grid grid-cols-3 gap-3 h-96 rounded-lg overflow-hidden">
        {/* Imagem Principal - 2/3 da largura */}
        <div className="col-span-2 relative cursor-pointer group" onClick={() => openModal(0)}>
          <Image
            src={mainImage}
            alt={propertyTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
        </div>

        {/* Grid de Thumbnails - 1/3 da largura */}
        <div className="grid grid-rows-2 grid-cols-2 gap-2">
          {thumbnailImages.map((image, index) => (
            <div
              key={index + 1}
              className="relative cursor-pointer group h-full"
              onClick={() => openModal(index + 1)}
            >
              <Image
                src={image}
                alt={`${propertyTitle} - Foto ${index + 2}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />

              {/* "Ver mais fotos" na última thumbnail */}
              {index === thumbnailImages.length - 1 && images.length > 5 && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-bold">+{remainingCount}</div>
                    <div className="text-sm">Ver mais fotos</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Se houver menos de 4 thumbnails, preencher espaços vazios */}
          {thumbnailImages.length < 4 && Array.from({ length: 4 - thumbnailImages.length }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-100" />
          ))}
        </div>
      </div>

      {/* Modal da Galeria */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full max-w-6xl max-h-screen p-4">
            {/* Botão Fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Imagem Principal */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={images[currentImageIndex]}
                alt={`${propertyTitle} - Foto ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                priority
              />

              {/* Navegação Anterior */}
              {images.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Navegação Próxima */}
              {images.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Contador de Imagens */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Thumbnails na parte inferior */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-white' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}