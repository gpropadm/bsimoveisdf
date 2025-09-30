'use client'

import { notFound } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PropertyGallery from '@/components/PropertyGallery'
import FavoriteButton from '@/components/FavoriteButton'
import SimilarProperties from '@/components/SimilarProperties'
import AppointmentScheduler from '@/components/AppointmentScheduler'
import { useSettings } from '@/hooks/useSettings'

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
  const { settings } = useSettings()
  
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

  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Imóvel',
      text: `Confira este imóvel: ${property?.title} - R$ ${property?.price.toLocaleString('pt-BR')}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback para navegadores que não suportam Web Share API
        await navigator.clipboard.writeText(shareData.url)
        alert('Link copiado para a área de transferência!')
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err)
      // Fallback final - copiar para clipboard
      try {
        await navigator.clipboard.writeText(shareData.url)
        alert('Link copiado para a área de transferência!')
      } catch (clipboardErr) {
        console.error('Erro ao copiar para clipboard:', clipboardErr)
      }
    }
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
      <Header settings={settings} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="mb-6 -mx-8 px-4">
                <PropertyGallery 
                  propertyTitle={property.title}
                  propertyPrice={property.price}
                  propertyType={property.type}
                  images={propertyImages}
                />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{property.address}, {property.city} - {property.state}</span>
                </div>
                
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Compartilhar imóvel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Compartilhar</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-1">
                      <img src="/icons/icons8-sleeping-in-bed-50.png" alt="Quartos" className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""}</div>
                    <div className="text-xs text-gray-600">Quartos</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-1">
                      <img src="/icons/icons8-bathroom-32.png" alt="Banheiros" className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""}</div>
                    <div className="text-xs text-gray-600">Banheiros</div>
                  </div>
                )}
                {property.parking && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-1">
                      <img src="/icons/icons8-hennessey-venom-30.png" alt="Vagas" className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">{property.parking && property.parking > 0 ? property.parking : ""}</div>
                    <div className="text-xs text-gray-600">Vagas</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-1">
                      <img src="/icons/icons8-measure-32.png" alt="Área" className="w-5 h-5 opacity-60" />
                    </div>
                    <div className="text-xl font-bold text-gray-800">{property.area && property.area > 0 ? property.area : ""}</div>
                    <div className="text-xs text-gray-600">m²</div>
                  </div>
                )}
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-base font-bold capitalize text-gray-800">{property.type}</div>
                  <div className="text-xs text-gray-600">Tipo</div>
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
                  {property.bedrooms && <li>• Quartos: {property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""}</li>}
                  {property.bathrooms && <li>• Banheiros: {property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""}</li>}
                  {property.area && <li>• Área: {property.area && property.area > 0 ? property.area : ""}m²</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SimilarProperties
        currentPropertyId={property.id}
        city={property.city}
        state={property.state}
        price={property.price}
        type={property.type}
        showAsSlider={true}
        limit={50}
        showTitle={true}
      />

      <Footer />
    </div>
  )
}