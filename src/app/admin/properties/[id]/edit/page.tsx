'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import AdminLayout from '@/components/AdminLayout'
import {
  formatCurrency,
  formatCurrencyFromNumber,
  parseCurrency,
  formatCEP,
  parseCEP,
  formatArea,
  parseArea,
  formatNumber,
  parseNumber
} from '@/lib/maskUtils'
import MapSelector from '@/components/MapSelector'
import { toast } from 'react-toastify'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Importação dinâmica do editor para evitar problemas de SSR
const RichTextEditor = dynamicImport(() => import('@/components/RichTextEditor'), { ssr: false })

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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
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
    featured: false,
    // Campos específicos para apartamento
    floor: '',
    condoFee: '',
    amenities: [] as string[],
    apartmentTotalArea: '',
    apartmentUsefulArea: '',
    suites: '',
    iptu: '',
    // Campos específicos para terreno
    zoning: '',
    slope: '',
    frontage: '',
    // Campos específicos para fazenda
    totalArea: '',
    cultivatedArea: '',
    pastures: '',
    areaUnit: 'hectares',
    buildings: [] as string[],
    waterSources: '',
    // Campos específicos para casa
    houseType: '',
    yard: false,
    garage: '',
    // Campos específicos para comercial
    commercialType: '',
    floor_commercial: '',
    businessCenter: '',
    features: [] as string[],
    // Coordenadas GPS
    latitude: '',
    longitude: '',
    gpsAccuracy: ''
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
      const parsedImages = (() => {
        if (!data.images) return []
        try {
          if (data.images.startsWith('[')) {
            return JSON.parse(data.images)
          } else {
            return [data.images]
          }
        } catch {
          return [data.images]
        }
      })()
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
        zipcode: data.cep ? formatCEP(data.cep) : '',
        price: data.price ? formatCurrencyFromNumber(data.price) : '',
        type: data.type || '',
        status: data.status || 'disponivel',
        category: data.category || '',
        bedrooms: data.bedrooms !== null && data.bedrooms !== undefined ? data.bedrooms.toString() : '',
        bathrooms: data.bathrooms !== null && data.bathrooms !== undefined ? data.bathrooms.toString() : '',
        parking: data.parking !== null && data.parking !== undefined ? data.parking.toString() : '',
        area: data.area !== null && data.area !== undefined ? data.area.toString() : '',
        video: data.video || '',
        featured: data.featured || false,
        // Campos específicos para apartamento
        floor: data.floor !== null && data.floor !== undefined ? data.floor.toString() : '',
        condoFee: data.condoFee ? formatCurrencyFromNumber(data.condoFee) : '',
        amenities: data.amenities ? (Array.isArray(data.amenities) ? data.amenities : JSON.parse(data.amenities || '[]')) : [],
        apartmentTotalArea: data.apartmentTotalArea !== null && data.apartmentTotalArea !== undefined ? data.apartmentTotalArea.toString() : '',
        apartmentUsefulArea: data.apartmentUsefulArea !== null && data.apartmentUsefulArea !== undefined ? data.apartmentUsefulArea.toString() : '',
        suites: data.suites !== null && data.suites !== undefined ? data.suites.toString() : '',
        iptu: data.iptu ? formatCurrencyFromNumber(data.iptu) : '',
        // Campos específicos para terreno
        zoning: data.zoning || '',
        slope: data.slope || '',
        frontage: data.frontage !== null && data.frontage !== undefined ? data.frontage.toString() : '',
        // Campos específicos para fazenda
        totalArea: data.totalArea !== null && data.totalArea !== undefined ? data.totalArea.toString() : '',
        cultivatedArea: data.cultivatedArea !== null && data.cultivatedArea !== undefined ? data.cultivatedArea.toString() : '',
        pastures: data.pastures !== null && data.pastures !== undefined ? data.pastures.toString() : '',
        areaUnit: data.areaUnit || 'hectares',
        buildings: data.buildings ? (Array.isArray(data.buildings) ? data.buildings : (() => {
          try {
            return JSON.parse(data.buildings) || []
          } catch {
            return []
          }
        })()) : [],
        waterSources: data.waterSources || '',
        // Campos específicos para casa
        houseType: data.houseType || '',
        yard: data.yard || false,
        garage: data.garage || '',
        // Campos específicos para comercial
        commercialType: data.commercialType || '',
        floor_commercial: data.floor_commercial || '',
        businessCenter: data.businessCenter || '',
        features: data.features ? (Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]')) : [],
        // Coordenadas GPS
        latitude: data.latitude !== null && data.latitude !== undefined ? data.latitude.toString() : '',
        longitude: data.longitude !== null && data.longitude !== undefined ? data.longitude.toString() : '',
        gpsAccuracy: data.gpsAccuracy !== null && data.gpsAccuracy !== undefined ? data.gpsAccuracy.toString() : ''
      })
    } catch (error) {
      console.error('Erro ao carregar imóvel:', error)
      // Só redirecionar após 3 segundos para mostrar o erro
      toast.error(`Erro ao carregar imóvel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
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
      cep: formData.zipcode ? parseCEP(formData.zipcode) : null,
      price: parseCurrency(formData.price),
      bedrooms: parseNumber(formData.bedrooms),
      bathrooms: parseNumber(formData.bathrooms),
      parking: parseNumber(formData.parking),
      area: formData.area ? parseArea(formData.area) : null,
      // Campos específicos para apartamento
      floor: formData.floor ? parseNumber(formData.floor) : null,
      condoFee: formData.condoFee ? parseCurrency(formData.condoFee) : null,
      amenities: formData.amenities.length > 0 ? JSON.stringify(formData.amenities) : null,
      apartmentTotalArea: formData.apartmentTotalArea ? parseArea(formData.apartmentTotalArea) : null,
      apartmentUsefulArea: formData.apartmentUsefulArea ? parseArea(formData.apartmentUsefulArea) : null,
      suites: formData.suites ? parseNumber(formData.suites) : null,
      iptu: formData.iptu ? parseCurrency(formData.iptu) : null,
      // Campos específicos para terreno
      frontage: formData.frontage ? parseArea(formData.frontage) : null,
      // Campos específicos para fazenda
      totalArea: formData.totalArea ? parseArea(formData.totalArea) : null,
      cultivatedArea: formData.cultivatedArea ? parseArea(formData.cultivatedArea) : null,
      pastures: formData.pastures ? parseArea(formData.pastures) : null,
      buildings: formData.buildings.length > 0 ? JSON.stringify(formData.buildings) : null,
      // Campos específicos para comercial
      features: formData.features.length > 0 ? JSON.stringify(formData.features) : null,
      // Coordenadas GPS
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      gpsAccuracy: formData.gpsAccuracy ? parseFloat(formData.gpsAccuracy) : null,
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

      toast.success('Imóvel atualizado com sucesso!')
      router.push('/admin/properties')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao salvar imóvel: ${errorMessage}`)
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

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remove formatação do CEP
    const cleanCep = parseCEP(cep)

    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      if (!response.ok) throw new Error('CEP not found')

      const data = await response.json()

      if (data.erro) {
        toast.error('CEP não encontrado!')
        return
      }

      // Preenche os campos automaticamente
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }))

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Verifique se o CEP está correto.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (name === 'price' || name === 'condoFee' || name === 'iptu') {
      // Aplicar máscara de dinheiro no campo preço, condomínio e IPTU
      const formattedValue = formatCurrency(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else if (name === 'apartmentTotalArea' || name === 'apartmentUsefulArea' || name === 'totalArea' || name === 'cultivatedArea' || name === 'pastures' || name === 'frontage') {
      // Aplicar máscara para áreas (com decimais)
      const formattedValue = formatArea(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else if (name === 'bedrooms' || name === 'bathrooms' || name === 'parking' || name === 'floor' || name === 'suites') {
      // Aplicar máscara para números inteiros
      const formattedValue = formatNumber(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formattedCep = formatCEP(value)

    // Atualiza o campo CEP com formatação
    setFormData(prev => ({
      ...prev,
      zipcode: formattedCep
    }))

    // Se o CEP tem 8 dígitos, busca o endereço
    const cleanCep = parseCEP(value)
    if (cleanCep.length === 8) {
      fetchAddressByCep(formattedCep)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    // Verificar limite de arquivos
    if (files.length > 30) {
      toast.error(`❌ Muitos arquivos selecionados (${files.length}). Limite máximo: 30 arquivos por vez.`)
      return
    }

    console.log('📸 Iniciando upload de', files.length, 'arquivo(s)')

    // Log detalhado dos arquivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`📸 Arquivo ${i + 1}:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        lastModified: new Date(file.lastModified).toISOString()
      })
    }

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    try {
      const formData = new FormData()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validação local antes do upload
        if (!file.type.startsWith('image/')) {
          console.error('❌ Tipo de arquivo inválido:', file.name, file.type)
          toast.error(`Arquivo ${file.name} não é uma imagem válida. Tipos aceitos: JPG, PNG, GIF, WebP`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          console.error('❌ Arquivo muito grande:', file.name, `${(file.size / 1024 / 1024).toFixed(2)}MB`)
          toast.error(`Arquivo ${file.name} é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Limite: 5MB`)
          continue
        }

        formData.append(`image-${i}`, file)
        console.log('✅ Arquivo adicionado ao FormData:', file.name)
      }

      console.log('📤 Enviando FormData para /api/admin/upload...')
      console.log('📊 Dados sendo enviados:', {
        totalFiles: formData.getAll('image-0').length + formData.getAll('image-1').length + formData.getAll('image-2').length,
        formDataKeys: Array.from(formData.keys())
      })

      let response
      try {
        console.log('🌐 Iniciando fetch request...')
        response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })
        console.log('✅ Fetch concluído')
      } catch (fetchError) {
        console.error('❌ Erro no fetch:', fetchError)
        throw new Error(`Erro de rede: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido na requisição'}`)
      }

      console.log('📥 Resposta do servidor:', response.status, response.statusText)

      // Log mais detalhado se houver erro
      if (!response.ok) {
        console.error('❌ Headers da resposta:', Object.fromEntries(response.headers.entries()))
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro no upload:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })

        try {
          const errorData = JSON.parse(errorText)
          const errorMsg = errorData.error || errorData.details || 'Erro no upload'
          console.error('❌ Dados de erro do servidor:', errorData)
          throw new Error(errorMsg)
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta:', parseError)
          console.error('❌ Texto bruto da resposta:', errorText)

          // Se não conseguiu fazer parse, criar mensagem detalhada
          let detailedError = `HTTP ${response.status}: ${response.statusText}`
          if (errorText && errorText.trim()) {
            detailedError += ` - ${errorText}`
          } else {
            detailedError += ' (Resposta vazia do servidor)'
          }

          throw new Error(detailedError)
        }
      }

      const data = await response.json()
      console.log('✅ Upload concluído com sucesso:', data)

      if (data.urls && Array.isArray(data.urls)) {
        setImages(prev => [...prev, ...data.urls])
        setUploadProgress({ current: data.urls.length, total: files.length })

        let message = `✅ ${data.urls.length} imagem(ns) enviada(s) com sucesso!`
        if (data.errors && data.errors.length > 0) {
          message += `\n\n⚠️ Alguns arquivos tiveram problemas:\n${data.errors.join('\n')}`
        }
        toast.error(message)
      } else {
        console.error('❌ Resposta inválida do servidor:', data)
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error) {
      console.error('❌ Erro detalhado no upload:', error)
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A')
      console.error('❌ Tipo do erro:', typeof error)
      console.error('❌ Constructor:', error?.constructor?.name)

      let errorMessage = 'Erro desconhecido no upload'

      if (error instanceof Error) {
        errorMessage = error.message
        if (error.message.trim() === '') {
          errorMessage = `Erro vazio capturado. Tipo: ${error.constructor.name}`
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      } else {
        errorMessage = `Erro não identificado: ${JSON.stringify(error)}`
      }

      toast.error(`❌ Erro ao fazer upload das imagens: ${errorMessage}`)
    } finally {
      setUploading(false)
      setUploadProgress({ current: 0, total: 0 })
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
      toast.error(`Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: MP4, MOV, WebM, AVI`)
      return
    }

    // Limite de 100MB (bem maior que os 50MB anteriores)
    if (file.size > 100 * 1024 * 1024) {
      toast.error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Limite máximo: 100MB`)
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

      // Preparar dados para Cloudinary (apenas os parâmetros assinados)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', api_key)
      formData.append('folder', params.folder)

      console.log('📤 Dados para Cloudinary:', {
        signature: signature.substring(0, 10) + '...',
        timestamp,
        api_key: api_key.substring(0, 10) + '...',
        folder: params.folder
      })

      // Upload direto para Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Erro do Cloudinary:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          response: errorText
        })

        let errorMessage = `Upload falhou: ${uploadResponse.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch {
          // Se não conseguir fazer parse, usar mensagem padrão
        }

        throw new Error(errorMessage)
      }

      const uploadResult = await uploadResponse.json()
      console.log('✅ Upload concluído:', uploadResult.secure_url)

      updateVideo(index, uploadResult.secure_url)
    } catch (error) {
      console.error('❌ Erro no upload direto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao fazer upload do vídeo: ${errorMessage}`)
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

  const actions = (
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
  )

  return (
    <AdminLayout
      title="Editar Imóvel"
      subtitle={property.title}
      currentPage="properties"
      actions={actions}
    >
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white shadow rounded-lg">
              {/* Informações Básicas */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              </div>
              
              <div className="p-6 space-y-6">
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
                    Descrição *
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                    placeholder="Descreva as características do imóvel..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="0,00"
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
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Campo CEP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    placeholder="00000-000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Digite o CEP para preencher automaticamente o endereço
                  </p>
                </div>

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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                </div>

                {/* Coordenadas GPS */}
                <div className="mt-6">
                  <MapSelector
                    onLocationSelect={(latitude, longitude) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                      }))
                    }}
                    initialLatitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
                    initialLongitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Categoria do Imóvel */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Categoria do Imóvel</h3>
                <p className="text-sm text-gray-600 mt-1">Selecione o tipo de imóvel para mostrar campos específicos</p>
              </div>

              <div className="p-6">
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
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="sobrado">Sobrado</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="terreno">Terreno</option>
                    <option value="fazenda">Fazenda/Sítio</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>

                {/* Área geral - Para todos os tipos que não são apartamento */}
                {formData.category && !['apartamento', 'cobertura'].includes(formData.category) && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Total (m²)
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 250.50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Características Básicas - Para apartamento, casa, sobrado, cobertura e comercial */}
            {(formData.category === 'apartamento' || formData.category === 'casa' || formData.category === 'sobrado' || formData.category === 'cobertura' || formData.category === 'comercial') && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Características Básicas</h3>
                  <p className="text-sm text-gray-600 mt-1">Informações gerais do imóvel</p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                  </div>
                </div>
              </div>
            )}


            {/* Seções dinâmicas por categoria */}
            {/* Casa */}
            {formData.category === 'casa' && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Características da Casa</h3>
                  <p className="text-sm text-gray-600 mt-1">Informações específicas para casas</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Casa
                      </label>
                      <select
                        name="houseType"
                        value={formData.houseType || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      >
                        <option value="">Selecione</option>
                        <option value="terrea">Térrea</option>
                        <option value="sobrado">Sobrado</option>
                        <option value="geminada">Geminada</option>
                        <option value="isolada">Isolada</option>
                        <option value="village">Village</option>
                        <option value="condo">Condomínio Fechado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Garagem
                      </label>
                      <input
                        type="text"
                        name="garage"
                        value={formData.garage || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: Coberta para 2 carros"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="yard"
                      checked={formData.yard || false}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Possui quintal
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Apartamento */}
            {(formData.category === 'apartamento' || formData.category === 'cobertura') && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Informações do Apartamento</h3>
                  <p className="text-sm text-gray-600 mt-1">Dados específicos para apartamentos e coberturas</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Primeira linha - Andar e Suítes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Andar
                      </label>
                      <input
                        type="number"
                        name="floor"
                        value={formData.floor || ''}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suítes
                      </label>
                      <input
                        type="number"
                        name="suites"
                        value={formData.suites || ''}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 2"
                      />
                    </div>
                  </div>

                  {/* Segunda linha - Áreas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área Total (m²)
                      </label>
                      <input
                        type="text"
                        name="apartmentTotalArea"
                        value={formData.apartmentTotalArea || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 120,50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área Útil (m²)
                      </label>
                      <input
                        type="text"
                        name="apartmentUsefulArea"
                        value={formData.apartmentUsefulArea || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 95,00"
                      />
                    </div>
                  </div>

                  {/* Terceira linha - Valores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor do Condomínio (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          name="condoFee"
                          value={formData.condoFee || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                          placeholder="500,00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IPTU (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="text"
                          name="iptu"
                          value={formData.iptu || ''}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                          placeholder="150,00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comodidades do Condomínio
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Piscina', 'Academia', 'Playground', 'Salão de Festas', 'Churrasqueira',
                        'Quadra Esportiva', 'Sauna', 'Elevador', 'Portaria 24h', 'CFTV',
                        'Garagem Coberta', 'Área de Lazer', 'Jardim', 'Interfone', 'Gás Central',
                        'Salão de Jogos', 'Cinema/Home Theater', 'Spa', 'Coworking', 'Bicicletário',
                        'Pet Place', 'Lavanderia', 'Piscina Aquecida', 'Quadra de Tênis', 'Gerador',
                        'Pista de Cooper', 'Espaço Zen/Yoga', 'Espaço Gourmet', 'Área para Eventos',
                        'Beach Tennis', 'Horta Comunitária', 'Brinquedoteca', 'Wifi Gratuito',
                        'Depósito/Storage', 'Portão Eletrônico'
                      ].map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(formData.amenities || []).includes(amenity)}
                            onChange={(e) => {
                              const currentAmenities = formData.amenities || []
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: [...currentAmenities, amenity]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  amenities: currentAmenities.filter(a => a !== amenity)
                                }))
                              }
                            }}
                            className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terreno */}
            {formData.category === 'terreno' && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Informações do Terreno</h3>
                  <p className="text-sm text-gray-600 mt-1">Dados específicos para terrenos</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoneamento
                      </label>
                      <select
                        name="zoning"
                        value={formData.zoning || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      >
                        <option value="">Selecione</option>
                        <option value="residencial">Residencial</option>
                        <option value="comercial">Comercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="misto">Misto</option>
                        <option value="rural">Rural</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topografia
                      </label>
                      <select
                        name="slope"
                        value={formData.slope || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      >
                        <option value="">Selecione</option>
                        <option value="plano">Plano</option>
                        <option value="aclive">Aclive</option>
                        <option value="declive">Declive</option>
                        <option value="irregular">Irregular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frente do Terreno (metros)
                      </label>
                      <input
                        type="number"
                        name="frontage"
                        value={formData.frontage || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 12.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fazenda */}
            {formData.category === 'fazenda' && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Informações da Fazenda</h3>
                  <p className="text-sm text-gray-600 mt-1">Dados específicos para fazendas e sítios</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Seletor de Unidade de Medida */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidade de Medida para Área
                    </label>
                    <select
                      name="areaUnit"
                      value={formData.areaUnit || 'hectares'}
                      onChange={handleChange}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="hectares">Hectares (ha)</option>
                      <option value="alqueires-sp">Alqueires Paulista (24.200 m²)</option>
                      <option value="alqueires-mg">Alqueires Mineiro (48.400 m²)</option>
                      <option value="alqueires-go">Alqueires Goiano (48.400 m²)</option>
                      <option value="alqueires-norte">Alqueires do Norte (27.225 m²)</option>
                      <option value="metros">Metros Quadrados (m²)</option>
                      <option value="quilometros">Quilômetros Quadrados (km²)</option>
                      <option value="acres">Acres</option>
                      <option value="tarefas">Tarefas (3.025 m²)</option>
                      <option value="braças">Braças Quadradas</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Escolha a unidade mais comum na sua região
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área Total ({formData.areaUnit === 'metros' ? 'm²' :
                                    formData.areaUnit === 'quilometros' ? 'km²' :
                                    formData.areaUnit === 'hectares' ? 'ha' :
                                    formData.areaUnit === 'acres' ? 'acres' :
                                    formData.areaUnit?.includes('alqueires') ? 'alqueires' :
                                    formData.areaUnit === 'tarefas' ? 'tarefas' :
                                    formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                      </label>
                      <input
                        type="number"
                        name="totalArea"
                        value={formData.totalArea || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 50.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área Cultivada ({formData.areaUnit === 'metros' ? 'm²' :
                                        formData.areaUnit === 'quilometros' ? 'km²' :
                                        formData.areaUnit === 'hectares' ? 'ha' :
                                        formData.areaUnit === 'acres' ? 'acres' :
                                        formData.areaUnit?.includes('alqueires') ? 'alqueires' :
                                        formData.areaUnit === 'tarefas' ? 'tarefas' :
                                        formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                      </label>
                      <input
                        type="number"
                        name="cultivatedArea"
                        value={formData.cultivatedArea || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 30.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pastos ({formData.areaUnit === 'metros' ? 'm²' :
                                formData.areaUnit === 'quilometros' ? 'km²' :
                                formData.areaUnit === 'hectares' ? 'ha' :
                                formData.areaUnit === 'acres' ? 'acres' :
                                formData.areaUnit?.includes('alqueires') ? 'alqueires' :
                                formData.areaUnit === 'tarefas' ? 'tarefas' :
                                formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                      </label>
                      <input
                        type="number"
                        name="pastures"
                        value={formData.pastures || ''}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: 15.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fontes de Água
                      </label>
                      <input
                        type="text"
                        name="waterSources"
                        value={formData.waterSources || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: Poço artesiano, rio, nascente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benfeitorias da Fazenda
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          'Casa Sede',
                          'Galpão',
                          'Estábulo',
                          'Curral',
                          'Pocilga',
                          'Galinheiro',
                          'Armazém',
                          'Oficina',
                          'Casa de Funcionários',
                          'Energia Elétrica',
                          'Cerca Elétrica',
                          'Irrigação',
                          'Estrada Interna',
                          'Porteira',
                          'Balança para Gado',
                          'Sistema de Ordenha',
                          'Reservatório de Água',
                          'Poço Artesiano'
                        ].map((building) => (
                          <label key={building} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(formData.buildings || []).includes(building)}
                              onChange={(e) => {
                                const currentBuildings = formData.buildings || []
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    buildings: [...currentBuildings, building]
                                  }))
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    buildings: currentBuildings.filter(b => b !== building)
                                  }))
                                }
                              }}
                              className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm text-gray-700">{building}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comercial */}
            {formData.category === 'comercial' && (
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Informações Comerciais</h3>
                  <p className="text-sm text-gray-600 mt-1">Dados específicos para imóveis comerciais</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo Comercial
                      </label>
                      <select
                        name="commercialType"
                        value={formData.commercialType || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      >
                        <option value="">Selecione</option>
                        <option value="loja">Loja</option>
                        <option value="escritorio">Escritório</option>
                        <option value="galpao">Galpão</option>
                        <option value="sala">Sala Comercial</option>
                        <option value="predio">Prédio Comercial</option>
                        <option value="terreno">Terreno Comercial</option>
                        <option value="hotel">Hotel/Pousada</option>
                        <option value="restaurante">Restaurante</option>
                        <option value="consultorio">Consultório</option>
                        <option value="industria">Industrial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Andar
                      </label>
                      <input
                        type="text"
                        name="floor_commercial"
                        value={formData.floor_commercial || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Ex: Térreo, 1º, 2º"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Centro Empresarial
                      </label>
                      <input
                        type="text"
                        name="businessCenter"
                        value={formData.businessCenter || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                        placeholder="Nome do edifício/centro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Características e Facilidades
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Ar Condicionado', 'Internet/Wifi', 'Elevador', 'Estacionamento',
                        'Segurança 24h', 'Recepção', 'CFTV', 'Gerador', 'Copa/Cozinha',
                        'Banheiro Privativo', 'Sala de Reunião', 'Depósito', 'Vitrine',
                        'Pé Direito Alto', 'Rampa de Acesso', 'Entrada Independente',
                        'Mezanino', 'Escritório Anexo', 'Área Externa', 'Próximo ao Centro',
                        'Transporte Público', 'Fácil Acesso'
                      ].map((feature) => (
                        <label key={feature} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(formData.features || []).includes(feature)}
                            onChange={(e) => {
                              const currentFeatures = formData.features || []
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  features: [...currentFeatures, feature]
                                }))
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  features: currentFeatures.filter(f => f !== feature)
                                }))
                              }
                            }}
                            className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Imagens */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Imagens do Imóvel</h3>
                <p className="text-sm text-gray-600 mt-1">Arraste e solte imagens ou clique para selecionar</p>
              </div>
              
              <div className="p-4 sm:p-6">
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
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7360ee] mx-auto mb-2"></div>
                          <p className="text-[#7360ee] font-medium">
                            Fazendo upload... {uploadProgress.total > 0 && `(${uploadProgress.current}/${uploadProgress.total})`}
                          </p>
                          <p className="text-xs text-gray-500">Processando em lotes de 5 imagens simultaneamente</p>
                          {uploadProgress.total > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-[#7360ee] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600 font-medium mb-2">
                            Clique para selecionar imagens ou arraste aqui
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG até 5MB cada (máximo 30 imagens por vez)
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
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Vídeos do Imóvel</h3>
                <p className="text-sm text-gray-600 mt-1">Adicione vídeos para criar stories do imóvel</p>
              </div>
              
              <div className="p-4 sm:p-6">
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
                      
                      <div className="flex flex-col sm:flex-row gap-2">
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
                            className={`cursor-pointer inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7360ee] ${
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
                                      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-2">
                                        <defs>
                                          <linearGradient id="shortsGradient" x1="11.195" x2="38.591" y1="11.196" y2="38.592" gradientUnits="userSpaceOnUse">
                                            <stop offset="0" stopColor="#f44f5a"/>
                                            <stop offset=".443" stopColor="#ee3d4a"/>
                                            <stop offset="1" stopColor="#e52030"/>
                                          </linearGradient>
                                        </defs>
                                        <path fill="url(#shortsGradient)" d="M29.103,2.631c4.217-2.198,9.438-0.597,11.658,3.577c2.22,4.173,0.6,9.337-3.617,11.534	l-3.468,1.823c2.987,0.109,5.836,1.75,7.328,4.555c2.22,4.173,0.604,9.337-3.617,11.534L18.897,45.37	c-4.217,2.198-9.438,0.597-11.658-3.577s-0.6-9.337,3.617-11.534l3.468-1.823c-2.987-0.109-5.836-1.75-7.328-4.555	c-2.22-4.173-0.6-9.337,3.617-11.534C10.612,12.346,29.103,2.631,29.103,2.631z"/>
                                        <path fill="#fff" d="M19.122,18.152v11.725c0,0.532,0.583,0.857,1.036,0.579l9.518-5.848	c0.431-0.265,0.432-0.892,0.001-1.158l-9.518-5.876C19.706,17.295,19.122,17.62,19.122,18.152z"/>
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Link
              href="/admin/properties"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#7360ee] hover:bg-[#7360ee]/90 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
      </div>
    </AdminLayout>
  )
}