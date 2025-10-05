'use client'

import LoftStyleCarousel from '@/components/LoftStyleCarousel'
import LoftStyleGallery from '@/components/LoftStyleGallery'

const sampleImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'
]

export default function TestLoftCarousel() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-poppins text-gray-900">
            Carousel Estilo Loft
          </h1>
          <p className="text-gray-600 text-lg">
            Componentes de galeria modernos inspirados no design do Loft
          </p>
        </div>

        {/* Simple Carousel */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold font-poppins text-gray-900">
            Carousel Simples
          </h2>
          <LoftStyleCarousel 
            images={sampleImages}
            title="Apartamento Moderno"
            autoPlay={true}
            showIndicators={true}
          />
        </section>

        {/* Gallery with Thumbnails */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold font-poppins text-gray-900">
            Galeria Completa
          </h2>
          <LoftStyleGallery 
            images={sampleImages}
            title="Casa Moderna"
          />
        </section>

        {/* Typography Test */}
        <section className="space-y-6 bg-[#e0e0e0] rounded-2xl p-8">
          <h2 className="text-2xl font-semibold font-poppins text-gray-900">
            Teste de Tipografia
          </h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold font-poppins text-gray-900">
              Título Principal (Poppins)
            </h1>
            <h2 className="text-2xl font-semibold font-poppins text-gray-800">
              Subtítulo (Poppins)
            </h2>
            <p className="text-base font-inter text-gray-700 leading-relaxed">
              Este é um parágrafo usando Inter, a fonte principal para corpo de texto. 
              Ela oferece excelente legibilidade e um visual moderno e clean, 
              muito similar ao que é usado no site do Loft.
            </p>
            <div className="flex items-center space-x-4 text-sm font-medium font-inter">
              <span className="text-green-600">3 quartos</span>
              <span className="text-blue-600">2 banheiros</span>
              <span className="text-purple-600">85m²</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}