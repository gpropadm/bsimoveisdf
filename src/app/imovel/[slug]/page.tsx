'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import PropertyGallery from '@/components/PropertyGallery'
import FavoriteButton from '@/components/FavoriteButton'
import SimilarProperties from '@/components/SimilarProperties'
import AppointmentScheduler from '@/components/AppointmentScheduler'

interface PropertyDetailProps {
  params: Promise<{ slug: string }>
}

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  type: string
  category: string
  address: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  area: number | null
  images: string | null
  video: string | null
  slug: string
}

export default function PropertyDetail({ params }: PropertyDetailProps) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  
  // Estados do formulário de interesse
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!slug) return

    const loadProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${slug}`)
        if (!response.ok) {
          notFound()
        }
        const data = await response.json()
        setProperty(data)
        
        // Inicializar mensagem do formulário
        setFormData(prev => ({
          ...prev,
          message: `Olá! Tenho interesse no imóvel "${data.title}". Gostaria de mais informações.`
        }))
      } catch (error) {
        console.error('Erro ao carregar propriedade:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!property) {
    notFound()
  }

  // Parse images safely
  let propertyImages: string[] = []
  try {
    if (property.images && typeof property.images === 'string') {
      propertyImages = JSON.parse(property.images)
    }
  } catch (error) {
    console.error('Error parsing property images:', error)
  }

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  const videoId = property.video ? extractYouTubeId(property.video) : null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async () => {
    // Validação básica
    if (!formData.name.trim()) {
      setSubmitMessage('Por favor, preencha seu nome')
      return
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setSubmitMessage('Por favor, preencha seu telefone ou email')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Salvar lead na API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          propertyTitle: property.title,
          propertyPrice: property.price,
          propertyType: property.type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar dados')
      }

      // Após salvar com sucesso, enviar WhatsApp
      const message = `*NOVO LEAD - SITE IMOBILIARIA*

*Cliente:* ${formData.name}
*Telefone:* ${formData.phone || 'Não informado'}
*Email:* ${formData.email || 'Não informado'}

*Imovel de interesse:* ${property.title}
*Valor:* R$ ${property.price.toLocaleString('pt-BR')}
*Tipo:* ${property.type}

*Mensagem do cliente:*
${formData.message}

*Data:* ${new Date().toLocaleString('pt-BR')}`

      // Buscar configurações para pegar o WhatsApp
      const settingsResponse = await fetch('/api/admin/settings')
      const settingsData = await settingsResponse.json()
      const whatsappNumber = settingsData.site?.contactWhatsapp || '5548998645864'
      
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      window.open(whatsappURL, '_blank')

      setSubmitMessage('✅ Dados enviados com sucesso!')
      
      // Limpar formulário após 2 segundos
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: `Olá! Tenho interesse no imóvel "${property.title}". Gostaria de mais informações.`
        })
        setSubmitMessage('')
      }, 2000)

    } catch (error) {
      console.error('Erro:', error)
      setSubmitMessage('❌ Erro ao enviar dados. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header with Contact and Social Media */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 text-sm">
            {/* Left side - Contact Info */}
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>(48) 99864-5864</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>contato@imobinext.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Florianópolis, SC</span>
              </div>
            </div>

            {/* Right side - Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">Siga-nos:</span>
              <div className="flex space-x-2">
                <a href="https://wa.me/5548998645864" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ImobiNext
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link href="/imoveis" className="text-gray-600 hover:text-blue-600">Imóveis</Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600">Sobre</Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
              <div className="mb-6">
                <PropertyGallery 
                  propertyTitle={property.title}
                  propertyPrice={property.price}
                  propertyType={property.type}
                  images={propertyImages}
                />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <img src="/icons/icons8-place.gif" alt="Localização" className="w-4 h-4 opacity-60" />
                <span>{property.address}, {property.city} - {property.state}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <img src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Quartos</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <img src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Banheiros</div>
                  </div>
                )}
                {property.parking && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <img src="/icons/icons8-hennessey-venom-30.png" alt="Vagas" className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.parking}</div>
                    <div className="text-sm text-gray-600">Vagas</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <img src="/icons/icons8-measure-32.png" alt="Área" className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.area}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-bold capitalize ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>{property.type}</div>
                  <div className="text-sm text-gray-600">Tipo</div>
                </div>
              </div>

              {property.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Seção de Vídeo */}
              {videoId && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    Tour Virtual
                  </h3>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`Tour Virtual - ${property.title}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {property.price.toLocaleString('pt-BR')}
                  </div>
                  <FavoriteButton 
                    propertyId={property.id}
                    propertyTitle={property.title}
                    size="medium"
                    variant="page"
                  />
                </div>
                <div className="text-gray-600 capitalize">
                  {property.category} para {property.type}
                </div>
              </div>

              <div className="space-y-4">
                <AppointmentScheduler 
                  property={{
                    id: property.id,
                    title: property.title,
                    address: property.address,
                    price: property.price,
                    type: property.type
                  }}
                />
              </div>

              {/* Formulário de Interesse */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-4">Demonstrar Interesse</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Digite seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="(48) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seu email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensagem
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                      submitMessage.includes('✅') 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : submitMessage.includes('❌')
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
                      </svg>
                    )}
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Características</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tipo: {property.category}</li>
                  <li>• Finalidade: {property.type}</li>
                  {property.bedrooms && <li>• Quartos: {property.bedrooms}</li>}
                  {property.bathrooms && <li>• Banheiros: {property.bathrooms}</li>}
                  {property.area && <li>• Área: {property.area}m²</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SimilarProperties 
        currentPropertyId={property.id}
        city={property.city}
        price={property.price}
        type={property.type}
        showAsSlider={true}
        limit={50}
        showTitle={true}
      />

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">ImobiNext</h3>
              <p className="text-gray-400 mb-4">Sua imobiliária de confiança há mais de 10 anos no mercado.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Imóveis</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/venda" className="hover:text-white">Venda</Link></li>
                <li><Link href="/aluguel" className="hover:text-white">Aluguel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 (48) 99864-5864</li>
                <li>📧 contato@imobinext.com</li>
                <li>📍 Florianópolis, SC</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ImobiNext. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}