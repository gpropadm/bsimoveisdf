'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zipcode: string
  price: number
  type: 'venda' | 'aluguel'
  category: string
  bedrooms: number
  bathrooms: number
  parking: number
  area: number
  video: string
  featured: boolean
  images: string[]
}

export default function EditProperty() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [originalImages, setOriginalImages] = useState<string[]>([]) // Para comparar mudanças
  const [originalVideos, setOriginalVideos] = useState<string[]>([]) // Para comparar mudanças
  const [dragActive, setDragActive] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    price: '',
    type: 'venda' as 'venda' | 'aluguel',
    status: 'disponivel',
    category: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    area: '',
    video: '',
    featured: false
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    fetchProperty()
  }, [status, router, propertyId])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        credentials: 'include' // Incluir cookies de sessão
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na API:', response.status, errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }
      const data = await response.json()
      setProperty(data)
      const parsedImages = data.images ? JSON.parse(data.images) : []
      const parsedVideos = (() => {
        console.log('🎬 Dados de vídeo do banco:', data.video)
        if (!data.video) return [''] // Start with one empty video
        try {
          const parsed = JSON.parse(data.video)
          console.log('🎬 Vídeos parseados:', parsed)
          return Array.isArray(parsed) ? parsed : [data.video]
        } catch {
          console.log('🎬 Falha no parse, usando string única:', data.video)
          return data.video ? [data.video] : ['']
        }
      })()
      
      setImages(parsedImages)
      setVideos(parsedVideos)
      // Salvar versões originais para comparação
      setOriginalImages(parsedImages)
      setOriginalVideos(parsedVideos)
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipcode: data.zipcode || '',
        price: data.price ? data.price.toString() : '',
        type: data.type || '',
        status: data.status || 'disponivel',
        category: data.category || '',
        bedrooms: data.bedrooms ? data.bedrooms.toString() : '',
        bathrooms: data.bathrooms ? data.bathrooms.toString() : '',
        parking: data.parking ? data.parking.toString() : '',
        area: data.area ? data.area.toString() : '',
        video: data.video || '',
        featured: data.featured || false
      })
    } catch (error) {
      console.error('Erro ao carregar imóvel:', error)
      // Só redirecionar após 3 segundos para mostrar o erro
      alert(`Erro ao carregar imóvel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => {
        router.push('/admin/properties')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    console.log('🎬 Vídeos antes do salvamento:', videos)
    console.log('🎬 Vídeos filtrados:', videos.filter(v => v.trim()))

    // Verificar se imagens ou vídeos mudaram
    const imagesChanged = JSON.stringify(images) !== JSON.stringify(originalImages)
    const videosChanged = JSON.stringify(videos) !== JSON.stringify(originalVideos)
    
    console.log('📸 Imagens mudaram:', imagesChanged)
    console.log('🎬 Vídeos mudaram:', videosChanged)

    const updateData: any = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      parking: parseInt(formData.parking),
      area: parseFloat(formData.area),
    }

    // Só incluir imagens/vídeos se mudaram (para evitar payload muito grande)
    if (imagesChanged) {
      updateData.images = JSON.stringify(images)
    }
    
    if (videosChanged) {
      updateData.video = videos.filter(v => v.trim()).length > 0 ? JSON.stringify(videos.filter(v => v.trim())) : null
    }

    console.log('📦 Tamanho do payload:', JSON.stringify(updateData).length, 'bytes')

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies de sessão
        body: JSON.stringify(updateData)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Erro ao salvar imóvel'
        try {
          const responseText = await response.text()
          console.error('Response error:', responseText)
          
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.details || errorData.error || errorMessage
          } catch {
            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      router.push('/admin/properties')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao salvar imóvel: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const extractYouTubeId = (url: string): string => {
    if (!url) return ''
    
    // Regex para extrair ID do YouTube de várias formas de URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return url // Retorna a URL original se não for YouTube
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      
      for (let i = 0; i < files.length; i++) {
        formData.append(`image-${i}`, files[i])
      }
      
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Erro no upload')
      }
      
      const data = await response.json()
      setImages(prev => [...prev, ...data.urls])
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload das imagens. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageUpload(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      return newImages
    })
  }

  // Funções para gerenciar vídeos
  const addVideo = () => {
    setVideos(prev => [...prev, ''])
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
  }

  const updateVideo = (index: number, url: string) => {
    setVideos(prev => prev.map((video, i) => i === index ? url : video))
  }

  const moveVideo = (fromIndex: number, toIndex: number) => {
    setVideos(prev => {
      const newVideos = [...prev]
      const [removed] = newVideos.splice(fromIndex, 1)
      newVideos.splice(toIndex, 0, removed)
      return newVideos
    })
  }

  const handleVideoUpload = async (file: File, index: number) => {
    if (!file) return

    console.log('🚀 Upload direto para Cloudinary:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    })

    // Validar arquivo antes do upload
    const validVideoTypes = [
      'video/mp4',
      'video/mov',
      'video/quicktime',
      'video/x-quicktime',
      'video/webm',
      'video/avi'
    ]

    const isValidVideo = validVideoTypes.includes(file.type.toLowerCase()) ||
                        file.name.toLowerCase().match(/\.(mov|mp4|webm|avi)$/)

    if (!isValidVideo) {
      alert(`Tipo de arquivo não suportado: ${file.type}\nTipos aceitos: MP4, MOV, WebM, AVI`)
      return
    }

    // Limite de 100MB (bem maior que os 50MB anteriores)
    if (file.size > 100 * 1024 * 1024) {
      alert(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB\nLimite máximo: 100MB`)
      return
    }

    setUploadingVideo(index)
    try {
      console.log('🔐 Obtendo assinatura do Cloudinary...')

      // Obter assinatura segura
      const signatureResponse = await fetch('/api/admin/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_type: 'video' })
      })

      if (!signatureResponse.ok) {
        throw new Error('Falha ao obter assinatura de upload')
      }

      const { signature, timestamp, api_key, cloud_name, params } = await signatureResponse.json()

      console.log('☁️ Upload direto para Cloudinary...', cloud_name)

      // Preparar dados para Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', api_key)
      formData.append('folder', params.folder)
      formData.append('resource_type', 'video')

      // Adicionar transformações se existirem
      if (params.transformation) {
        formData.append('transformation', params.transformation)
      }
      if (params.eager) {
        formData.append('eager', params.eager)
      }

      // Upload direto para Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro do Cloudinary:', errorText)
        throw new Error(`Upload falhou: ${uploadResponse.status}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log('✅ Upload concluído:', uploadResult.secure_url)

      updateVideo(index, uploadResult.secure_url)
    } catch (error) {
      console.error('❌ Erro no upload direto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao fazer upload do vídeo: ${errorMessage}`)
    } finally {
      setUploadingVideo(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7360ee] rounded-xl mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session || !property) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-[#7360ee] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">ImobiNext</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          
          <Link href="/admin/properties" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-[#7360ee]/10 text-[#7360ee] border border-[#7360ee]/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            {isSidebarOpen && <span className="font-medium">Imóveis</span>}
          </Link>
          
          <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            {isSidebarOpen && <span>Usuários</span>}
          </Link>
          
          <Link href="/admin/analytics" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            {isSidebarOpen && <span>Analytics</span>}
          </Link>
          
          <Link href="/admin/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            {isSidebarOpen && <span>Configurações</span>}
          </Link>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}>
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/admin/properties" className="text-[#7360ee] hover:text-[#7360ee] flex items-center space-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                  <span>Voltar</span>
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Imóvel</h1>
              <p className="text-gray-600">{property.title}</p>
            </div>
            <div className="flex space-x-3">
              <Link 
                href={`/imovel/${property.id}`} 
                target="_blank"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Visualizar</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {/* Informações Básicas */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="sobrado">Sobrado</option>
                      <option value="cobertura">Cobertura</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="venda">Venda</option>
                      <option value="aluguel">Aluguel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="vendido">Vendido</option>
                      <option value="alugado">Alugado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-3 mt-6">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Imóvel em destaque</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Características</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quartos *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banheiros *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vagas de Garagem *
                    </label>
                    <input
                      type="number"
                      name="parking"
                      value={formData.parking}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área (m²) *
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Imagens */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Imagens do Imóvel</h3>
                <p className="text-sm text-gray-600 mt-1">Arraste e solte imagens ou clique para selecionar</p>
              </div>
              
              <div className="p-6">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-[#7360ee] bg-[#7360ee]/10' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDrag}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 00-2.828 0L6 21"/>
                      </svg>
                      {uploading ? (
                        <p className="text-[#7360ee] font-medium">Fazendo upload...</p>
                      ) : (
                        <>
                          <p className="text-gray-600 font-medium mb-2">
                            Clique para selecionar imagens ou arraste aqui
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG até 5MB cada (múltiplas imagens permitidas)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Current Images */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      Imagens Atuais ({images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={`Imagem ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Controls */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex space-x-2">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index - 1)}
                                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                  title="Mover para esquerda"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15,18 9,12 15,6"/>
                                  </svg>
                                </button>
                              )}
                              
                              {index < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index + 1)}
                                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                  title="Mover para direita"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9,18 15,12 9,6"/>
                                  </svg>
                                </button>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Remover imagem"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18"/>
                                  <path d="M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Main Image Indicator */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-[#7360ee] text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      A primeira imagem será usada como foto principal. Use as setas para reordenar.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vídeos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Vídeos do Imóvel</h3>
                <p className="text-sm text-gray-600 mt-1">Adicione vídeos para criar stories do imóvel</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {videos.map((video, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Vídeo {index + 1} {index === 0 && <span className="text-[#7360ee]">(Principal)</span>}
                        </label>
                        <div className="flex items-center space-x-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveVideo(index, index - 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                              title="Mover para cima"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="18,15 12,9 6,15"/>
                              </svg>
                            </button>
                          )}
                          {index < videos.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveVideo(index, index + 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
                              title="Mover para baixo"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6,9 12,15 18,9"/>
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"
                            title="Remover vídeo"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18"/>
                              <path d="M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={video}
                          onChange={(e) => updateVideo(index, e.target.value)}
                          placeholder="Cole a URL do vídeo aqui (YouTube, MP4, etc.)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            accept="video/*,.mov,.mp4,.webm,.avi"
                            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0], index)}
                            className="hidden"
                            id={`video-upload-${index}`}
                            disabled={uploadingVideo === index}
                          />
                          <label
                            htmlFor={`video-upload-${index}`}
                            className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7360ee] ${
                              uploadingVideo === index ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Upload de arquivo de vídeo"
                          >
                            {uploadingVideo === index ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                            )}
                            <span className="ml-1">
                              {uploadingVideo === index ? 'Enviando...' : 'Upload'}
                            </span>
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cole uma URL ou faça upload de um arquivo de vídeo (MP4, MOV, WebM - máx. 100MB)
                      </p>
                      
                      {/* Preview do vídeo */}
                      {video && (
                        <div className="mt-3">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            {(() => {
                              const videoId = extractYouTubeId(video)
                              if (videoId && videoId !== video) {
                                return (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={`Vídeo ${index + 1}`}
                                  />
                                )
                              } else if (video.includes('.mp4') || video.includes('.mov') || video.includes('.webm')) {
                                return (
                                  <video
                                    src={video}
                                    className="w-full h-full object-cover"
                                    controls
                                    title={`Vídeo ${index + 1}`}
                                  />
                                )
                              } else {
                                return (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2">
                                        <polygon points="23 7 16 12 23 17 23 7"/>
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                      </svg>
                                      <p className="text-sm">Aguardando URL válida</p>
                                    </div>
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addVideo}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-4 text-center text-gray-600 hover:text-[#7360ee] transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      <span>Adicionar Vídeo</span>
                    </div>
                  </button>
                  
                  {videos.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum vídeo adicionado. Clique no botão acima para adicionar o primeiro vídeo.
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• <strong>URLs:</strong> Suporte a YouTube, links diretos MP4/MOV/WebM</p>
                    <p>• <strong>Upload Direto:</strong> Arquivos MOV, MP4, WebM, AVI até 100MB</p>
                    <p>• <strong>iPhone/Android:</strong> Vídeos do celular são totalmente suportados</p>
                    <p>• <strong>Performance:</strong> Upload direto - sem limites do servidor</p>
                    <p>• <strong>Stories:</strong> O primeiro vídeo será o principal no modal</p>
                    <p>• <strong>Organização:</strong> Use as setas para reordenar os vídeos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 mt-6">
              <Link
                href="/admin/properties"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#7360ee] hover:bg-[#7360ee]/90 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}