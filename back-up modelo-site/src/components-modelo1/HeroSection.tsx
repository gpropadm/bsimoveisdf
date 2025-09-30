'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/imoveis?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const quickLinks = [
    { label: 'Apartamentos', href: '/imoveis?category=apartamento' },
    { label: 'Casas', href: '/imoveis?category=casa' },
    { label: 'Comercial', href: '/imoveis?category=comercial' },
    { label: 'Lançamentos', href: '/imoveis?status=lancamento' }
  ]

  return (
    <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Casa moderna de luxo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-display">
            Encontre o 
            <span className="block text-[#bf530b]">
              Imóvel dos Seus Sonhos
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Apartamentos, casas e salas comerciais com a qualidade e confiança que você merece
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-16">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o bairro, cidade ou tipo de imóvel..."
              className="w-full px-8 py-5 pr-40 text-lg rounded-2xl border-0 shadow-2xl focus:ring-4 focus:ring-teal-500/50 focus:outline-none bg-white/95 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-10 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="bg-white/15 backdrop-blur-sm text-white px-6 py-4 rounded-xl hover:bg-white/25 transition-all duration-200 border border-white/20 font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>

    </section>
  )
}