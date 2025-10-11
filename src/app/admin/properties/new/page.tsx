'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import AdminLayout from '@/components/AdminLayout'
import {
  formatCurrency,
  parseCurrency,
  formatPhone,
  parsePhone,
  formatCEP,
  parseCEP,
  formatArea,
  parseArea,
  formatNumber,
  parseNumber
} from '@/lib/maskUtils'
import { toast } from 'react-toastify'
import MapSelector from '@/components/MapSelector'
import SimpleTextEditor from '@/components/SimpleTextEditor'
import { getAddressFromCEP } from '@/lib/geocoding'

export default function NewProperty() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'venda',
    status: 'disponivel',
    category: 'apartamento',
    cep: '',
    address: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
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
    areaUnit: 'hectares', // Unidade de medida para fazendas
    buildings: [] as string[],
    waterSources: '',
    // Campos específicos para casa
    houseType: '',
    yard: false,
    garage: '',
    lotArea: '',
    builtArea: '',
    // Campos específicos para comercial
    commercialType: '',
    floor_commercial: '',
    businessCenter: '',
    features: [] as string[],
    // Formas de pagamento
    acceptsFinancing: false,
    acceptsTrade: false,
    acceptsCar: false
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [imageIds, setImageIds] = useState<string[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' })
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showMap, setShowMap] = useState(false)

  // Cleanup dos preview URLs quando o componente for desmontado
  useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url))
      videoPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreview, videoPreviews])



  // Função para capturar geolocalização GPS
  const getCurrentLocation = () => {
    setGettingLocation(true)

    if (!navigator.geolocation) {
      toast.error('Geolocalização não é suportada neste navegador')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        })
        toast.success('Localização capturada com sucesso!')
        setGettingLocation(false)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        let errorMessage = 'Erro ao obter localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão negada. Permita o acesso à localização.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível'
            break
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido'
            break
        }

        toast.error(errorMessage)
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep: string) => {
    // Remove formatação do CEP
    const cleanCep = parseCEP(cep)

    if (cleanCep.length !== 8) return

    try {
      // Usar a função que já corrige automaticamente as regiões do DF
      const addressData = await getAddressFromCEP(cep)

      if (!addressData) {
        toast.error('CEP não encontrado!')
        return
      }

      // Preenche os campos automaticamente com a cidade corrigida
      setFormData(prev => ({
        ...prev,
        address: addressData.logradouro || '',
        city: addressData.localidade || '', // Já vem com a região administrativa correta (Santa Maria, Gama, etc)
        state: addressData.uf || ''
      }))

      console.log(`✅ CEP ${cep} → Cidade: ${addressData.localidade}`)

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP. Verifique se o CEP está correto.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    } else if (name === 'apartmentTotalArea' || name === 'apartmentUsefulArea' || name === 'totalArea' || name === 'cultivatedArea' || name === 'pastures' || name === 'frontage' || name === 'lotArea' || name === 'builtArea') {
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
      cep: formattedCep
    }))

    // Se o CEP tem 8 dígitos, busca o endereço
    const cleanCep = parseCEP(value)
    if (cleanCep.length === 8) {
      fetchAddressByCep(formattedCep)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Adicionar todas as imagens sem limitação
    const newImages = [...images, ...files]
    setImages(newImages)

    // Criar previews e IDs únicos
    const previews = newImages.map(file => URL.createObjectURL(file))
    const newIds = newImages.map((_, index) => `img-${Date.now()}-${index}`)
    
    setImagePreview(previews)
    setImageIds(newIds)
  }

  const removeImage = (index: number) => {
    // Verificar se o índice é válido
    if (index < 0 || index >= images.length) return
    
    // Limpar URL object para evitar memory leaks
    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index])
    }
    
    // Filtrar arrays removendo o item no índice especificado
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    const newIds = imageIds.filter((_, i) => i !== index)
    
    // Resetar o estado de drag se estávamos arrastando o item removido
    if (draggedIndex === index) {
      setDraggedIndex(null)
    } else if (draggedIndex !== null && draggedIndex > index) {
      // Ajustar o índice se removemos um item antes do item sendo arrastado
      setDraggedIndex(draggedIndex - 1)
    }
    
    setImages(newImages)
    setImagePreview(newPreviews)
    setImageIds(newIds)
  }

  // Funções para drag and drop das imagens
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Verificar se os índices são válidos
    if (draggedIndex < 0 || draggedIndex >= images.length || dropIndex < 0 || dropIndex >= images.length) {
      setDraggedIndex(null)
      return
    }

    // Reordenar as imagens com mais segurança
    const newImages = [...images]
    const newPreviews = [...imagePreview]
    const newIds = [...imageIds]
    
    // Verificar se os elementos existem antes de manipular
    if (!newImages[draggedIndex] || !newPreviews[draggedIndex] || !newIds[draggedIndex]) {
      setDraggedIndex(null)
      return
    }
    
    // Remove o item da posição original
    const draggedImage = newImages.splice(draggedIndex, 1)[0]
    const draggedPreview = newPreviews.splice(draggedIndex, 1)[0]
    const draggedId = newIds.splice(draggedIndex, 1)[0]
    
    // Insere na nova posição
    newImages.splice(dropIndex, 0, draggedImage)
    newPreviews.splice(dropIndex, 0, draggedPreview)
    newIds.splice(dropIndex, 0, draggedId)
    
    // Atualizar os estados
    setImages(newImages)
    setImagePreview(newPreviews)
    setImageIds(newIds)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Processar cada arquivo selecionado
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name}: Por favor, selecione apenas arquivos de vídeo.`)
        continue
      }

      // Verificar tamanho inicial (máximo 100MB para upload)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name}: O vídeo deve ter no máximo 100MB para upload.`)
        continue
      }

      try {
        console.log(`🎬 Processando vídeo ${i + 1}/${files.length}: ${file.name}`)
        
        // Importar utilitários de vídeo dinamicamente
        const { validateShortsVideo, compressVideo, getVideoInfo } = await import('@/lib/videoUtils')
        
        // Validar se é adequado para shorts
        const validation = await validateShortsVideo(file)
        if (!validation.valid) {
          toast.error(`${file.name}: Problemas encontrados: ${validation.issues.join(', ')}`)
          continue
        }

        // Mostrar informações do vídeo original
        const originalInfo = await getVideoInfo(file)
        console.log('📹 Vídeo original:', {
          name: file.name,
          duration: `${Math.round(originalInfo.duration)}s`,
          size: `${(originalInfo.size / 1024 / 1024).toFixed(2)}MB`,
          dimensions: `${originalInfo.width}x${originalInfo.height}`
        })

        // Comprimir vídeo se necessário
        let processedFile = file
        if (file.size > 10 * 1024 * 1024) { // Comprimir se > 10MB
          console.log('🔄 Comprimindo vídeo...')
          processedFile = await compressVideo(file, {
            quality: 0.8,
            maxWidth: 720,
            maxHeight: 1280,
            maxSizeMB: 10
          })
        }

        // Adicionar o novo vídeo à lista
        setVideoFiles(prev => [...prev, processedFile])
        setVideoPreviews(prev => [...prev, URL.createObjectURL(processedFile)])
        
      } catch (error) {
        console.error(`Erro ao processar vídeo ${file.name}:`, error)
        toast.error(`Erro ao processar o vídeo ${file.name}. Continuando com outros arquivos...`)
      }
    }
    
    // Limpar o input para permitir reselecionar
    e.target.value = ''
  }

  const removeVideo = (index: number) => {
    // Limpar URL do preview
    URL.revokeObjectURL(videoPreviews[index])
    
    // Remover vídeo e preview dos arrays
    setVideoFiles(prev => prev.filter((_, i) => i !== index))
    setVideoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Primeiro, fazer upload das imagens se houver
      let imageUrls: string[] = []
      
      if (images.length > 0) {
        const uploadFormData = new FormData()
        images.forEach((image, index) => {
          uploadFormData.append(`image-${index}`, image)
        })

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          credentials: 'include',
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          console.error('❌ Erro no upload de imagens:', errorData)
          throw new Error(`Erro ao fazer upload das imagens: ${errorData.error || uploadResponse.statusText}`)
        }

        const uploadResult = await uploadResponse.json()
        imageUrls = uploadResult.urls
      }

      // Upload dos vídeos se houver
      let videoUrls: string[] = []
      
      if (videoFiles.length > 0) {
        console.log('📹 Iniciando upload de', videoFiles.length, 'vídeos...')
        
        for (const videoFile of videoFiles) {
          console.log('📹 Processando vídeo:', videoFile.name, 'Tamanho:', (videoFile.size / 1024 / 1024).toFixed(2) + 'MB')
          
          // Verificar tamanho antes do upload
          if (videoFile.size > 50 * 1024 * 1024) {
            throw new Error(`Vídeo ${videoFile.name} é muito grande. Máximo 50MB.`)
          }
          
          const videoFormData = new FormData()
          videoFormData.append('video', videoFile)

          const videoUploadResponse = await fetch('/api/admin/upload-video', {
            method: 'POST',
            credentials: 'include',
            body: videoFormData
          })

          console.log('📹 Resposta do upload:', videoUploadResponse.status, videoUploadResponse.statusText)

          if (!videoUploadResponse.ok) {
            let errorMessage = 'Erro ao fazer upload do vídeo'
            try {
              const responseText = await videoUploadResponse.text()
              console.error('❌ Raw video upload error:', responseText)
              
              try {
                const errorData = JSON.parse(responseText)
                errorMessage = errorData.details || errorData.error || errorMessage
              } catch {
                errorMessage = responseText || `HTTP ${videoUploadResponse.status}: ${videoUploadResponse.statusText}`
              }
            } catch (readError) {
              console.error('❌ Error reading video upload response:', readError)
              errorMessage = `HTTP ${videoUploadResponse.status}: ${videoUploadResponse.statusText}`
            }
            
            throw new Error(`Erro ao fazer upload do vídeo: ${errorMessage}`)
          }

          const videoUploadResult = await videoUploadResponse.json()
          console.log('✅ Vídeo uploadado com sucesso')
          videoUrls.push(videoUploadResult.url)
        }
      }

      // Criar o imóvel com as URLs das imagens
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Campos básicos
          title: formData.title,
          description: formData.description,
          price: parseCurrency(formData.price),
          type: formData.type,
          status: formData.status,
          category: formData.category,
          cep: formData.cep || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          bedrooms: parseNumber(formData.bedrooms) || null,
          bathrooms: parseNumber(formData.bathrooms) || null,
          parking: parseNumber(formData.parking) || null,
          featured: formData.featured,
          // Campos específicos para apartamento
          floor: formData.floor ? parseNumber(formData.floor) : null,
          condoFee: formData.condoFee ? parseCurrency(formData.condoFee) : null,
          amenities: formData.amenities.length > 0 ? JSON.stringify(formData.amenities) : null,
          apartmentTotalArea: formData.apartmentTotalArea ? parseArea(formData.apartmentTotalArea) : null,
          apartmentUsefulArea: formData.apartmentUsefulArea ? parseArea(formData.apartmentUsefulArea) : null,
          suites: formData.suites ? parseNumber(formData.suites) : null,
          iptu: formData.iptu ? parseCurrency(formData.iptu) : null,
          // Campos específicos para terreno
          zoning: formData.zoning || null,
          slope: formData.slope || null,
          frontage: formData.frontage ? parseArea(formData.frontage) : null,
          // Campos específicos para fazenda
          totalArea: formData.totalArea ? parseArea(formData.totalArea) : null,
          cultivatedArea: formData.cultivatedArea ? parseArea(formData.cultivatedArea) : null,
          pastures: formData.pastures ? parseArea(formData.pastures) : null,
          areaUnit: formData.areaUnit || null,
          buildings: formData.buildings.length > 0 ? JSON.stringify(formData.buildings) : null,
          waterSources: formData.waterSources || null,
          // Campos específicos para casa
          houseType: formData.houseType || null,
          yard: formData.yard || null,
          garage: formData.garage || null,
          lotArea: formData.lotArea ? parseArea(formData.lotArea) : null,
          builtArea: formData.builtArea ? parseArea(formData.builtArea) : null,
          // Campos específicos para comercial
          commercialType: formData.commercialType || null,
          floor_commercial: formData.floor_commercial || null,
          businessCenter: formData.businessCenter || null,
          features: formData.features.length > 0 ? JSON.stringify(formData.features) : null,
          // Formas de pagamento
          acceptsFinancing: formData.acceptsFinancing,
          acceptsTrade: formData.acceptsTrade,
          acceptsCar: formData.acceptsCar,
          // Mídia
          images: JSON.stringify(imageUrls),
          video: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
          // Coordenadas
          latitude: coordinates.latitude ? parseFloat(coordinates.latitude) : null,
          longitude: coordinates.longitude ? parseFloat(coordinates.longitude) : null
        })
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao criar imóvel'
        try {
          // Primeiro, tentamos ler como texto
          const responseText = await response.text()
          console.error('Raw error response:', responseText)
          
          // Depois tentamos fazer parse JSON
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.details || errorData.error || 'Erro ao criar imóvel'
          } catch {
            // Se não for JSON válido, usamos o texto bruto
            errorMessage = responseText || `Erro HTTP ${response.status}: ${response.statusText}`
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      toast.success('Imóvel criado com sucesso!')
      router.push('/admin/properties')
    } catch (error) {
      console.error('Erro ao criar imóvel:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao criar imóvel: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const actions = (
    <Link
      href="/admin/properties"
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5"/>
        <polyline points="12,19 5,12 12,5"/>
      </svg>
      <span>Voltar</span>
    </Link>
  )

  return (
    <AdminLayout
      title="Novo Imóvel"
      subtitle="Adicione um novo imóvel ao catálogo"
      currentPage="properties"
      actions={actions}
    >
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
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
                  placeholder="Ex: Apartamento 3 quartos no Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <SimpleTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Descreva as características do imóvel..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="500.000,00"
                    />
                  </div>
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  >
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="terreno">Terreno</option>
                    <option value="fazenda">Fazenda</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Localização</h3>
            </div>
            <div className="p-6 space-y-6">

              {/* Campo CEP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                  placeholder="00000-000"
                />
              </div>

              {/* Alternativas para localização */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Ou use uma dessas opções para propriedades rurais/sem CEP:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Botão GPS Mobile */}
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center justify-center px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {gettingLocation ? 'Obtendo localização...' : '📍 Usar Minha Localização'}
                  </button>

                  {/* Botão Seleção no Mapa */}
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center justify-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    🗺️ {showMap ? 'Fechar Mapa' : 'Selecionar no Mapa'}
                  </button>
                </div>

                {/* Exibir Coordenadas se capturadas */}
                {(coordinates.latitude || coordinates.longitude) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 mb-2">Coordenadas GPS capturadas:</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-green-700 mb-1">Latitude:</label>
                        <input
                          type="text"
                          value={coordinates.latitude}
                          onChange={(e) => setCoordinates(prev => ({ ...prev, latitude: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="Ex: -25.4808"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-700 mb-1">Longitude:</label>
                        <input
                          type="text"
                          value={coordinates.longitude}
                          onChange={(e) => setCoordinates(prev => ({ ...prev, longitude: e.target.value }))}
                          className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:ring-1 focus:ring-green-500"
                          placeholder="Ex: -49.2478"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      ✅ Essas coordenadas serão usadas para posicionar o imóvel no mapa
                    </p>
                  </div>
                )}

                {/* Mapa Interativo */}
                {showMap && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Selecione a localização no mapa:</h5>
                    <MapSelector
                      onLocationSelect={(lat, lng) => {
                        setCoordinates({
                          latitude: lat.toString(),
                          longitude: lng.toString()
                        })
                      }}
                      initialLatitude={coordinates.latitude ? parseFloat(coordinates.latitude) : undefined}
                      initialLongitude={coordinates.longitude ? parseFloat(coordinates.longitude) : undefined}
                    />
                  </div>
                )}
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
                  placeholder="Rua das Flores, 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Florianópolis"
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
                    placeholder="SC"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Características Básicas - Para apartamento, casa, cobertura e comercial */}
          {(formData.category === 'apartamento' || formData.category === 'casa' || formData.category === 'cobertura' || formData.category === 'comercial') && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Características Básicas</h3>
                <p className="text-sm text-gray-500 mt-1">Informações gerais do imóvel</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quartos
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banheiros
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vagas de Garagem
                    </label>
                    <input
                      type="number"
                      name="parking"
                      value={formData.parking}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para casa */}
          {formData.category === 'casa' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Características da Casa</h3>
                <p className="text-sm text-gray-500 mt-1">Informações específicas para casas</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Características específicas da casa */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Casa
                    </label>
                    <select
                      name="houseType"
                      value={formData.houseType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="terrea">Térrea</option>
                      <option value="sobrado">Sobrado</option>
                      <option value="condominio">Condomínio Fechado</option>
                      <option value="geminada">Geminada</option>
                      <option value="vila">Vila</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Garagem
                    </label>
                    <select
                      name="garage"
                      value={formData.garage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="coberta">Coberta</option>
                      <option value="descoberta">Descoberta</option>
                      <option value="fechada">Fechada</option>
                      <option value="nao-tem">Não tem</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="yard"
                        checked={formData.yard}
                        onChange={handleChange}
                        className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Possui quintal
                      </span>
                    </label>
                  </div>
                </div>

                {/* Áreas da Casa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área do Lote (m²)
                    </label>
                    <input
                      type="text"
                      name="lotArea"
                      value={formData.lotArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 300,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Construída (m²)
                    </label>
                    <input
                      type="text"
                      name="builtArea"
                      value={formData.builtArea}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 180,50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para apartamento/cobertura */}
          {(formData.category === 'apartamento' || formData.category === 'cobertura') && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Informações do Apartamento</h3>
                <p className="text-sm text-gray-500 mt-1">Dados específicos para apartamentos e coberturas</p>
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
                      value={formData.floor}
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
                      value={formData.suites}
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
                      value={formData.apartmentTotalArea}
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
                      value={formData.apartmentUsefulArea}
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
                        value={formData.condoFee}
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
                        value={formData.iptu}
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
                      // Lazer e Recreação
                      'Piscina',
                      'Piscina Aquecida',
                      'Piscina Infantil',
                      'Academia',
                      'Playground',
                      'Churrasqueira',
                      'Salão de Festas',
                      'Quadra Esportiva',
                      'Quadra de Tênis',
                      'Beach Tennis',
                      'Quadra de Futebol',
                      'Quadra de Vôlei',
                      'Quadra Poliesportiva',
                      'Sauna',
                      'Spa',
                      'Brinquedoteca',
                      'Espaço Gourmet',
                      'Salão de Jogos',
                      'Cinema/Home Theater',
                      'Pista de Cooper',
                      'Pista de Caminhada',
                      'Espaço Zen/Yoga',
                      'Sala de Massagem',
                      'Área para Eventos',

                      // Serviços e Facilidades
                      'Portaria 24h',
                      'Concierge',
                      'Elevador',
                      'Elevador Social',
                      'Elevador de Serviço',
                      'Coworking',
                      'Wifi Gratuito',
                      'Lavanderia',
                      'Lavanderia Self-Service',
                      'Depósito/Storage',
                      'Bicicletário',
                      'Pet Place',
                      'Pet Shop',
                      'Clínica Veterinária',

                      // Áreas Externas
                      'Jardim',
                      'Área de Lazer',
                      'Área Verde',
                      'Horta Comunitária',
                      'Deck',
                      'Pergolado',
                      'Gazebo',

                      // Garagem e Estacionamento
                      'Garagem Coberta',
                      'Vaga Demarcada',
                      'Vaga para Deficiente',
                      'Vaga para Idoso',
                      'Lava Rápido',

                      // Segurança e Tecnologia
                      'CFTV',
                      'Interfone',
                      'Portão Eletrônico',
                      'Controle de Acesso',
                      'Cerca Elétrica',
                      'Alarme',
                      'Vigilância Armada',

                      // Infraestrutura
                      'Gás Central',
                      'Gerador',
                      'Ar Condicionado Central',
                      'Aquecimento Central',
                      'Sistema de Som Ambiente',
                      'Elevador Panorâmico',

                      // Comércio e Serviços
                      'Loja de Conveniência',
                      'Farmácia',
                      'Restaurante',
                      'Café/Lanchonete',
                      'Salão de Beleza',
                      'Banco 24h',

                      // Outros
                      'Piscina com Raia',
                      'Solário',
                      'Redário',
                      "Espelho d'água",
                      'Cascata',
                      'Fonte',
                      'Forno de Pizza',
                      'Bar Molhado',
                      'Mesa de Bilhar',
                      'Mesa de Ping Pong',
                      'Videokê',
                      'Anfiteatro',
                      'Biblioteca',
                      'Sala de Leitura'
                    ].map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            e.stopPropagation()
                            const isChecked = e.target.checked
                            setFormData(prev => ({
                              ...prev,
                              amenities: isChecked
                                ? [...(prev.amenities || []), amenity]
                                : (prev.amenities || []).filter(a => a !== amenity)
                            }))
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

          {/* Campos específicos para terreno */}
          {formData.category === 'terreno' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Informações do Terreno</h3>
                <p className="text-sm text-gray-500 mt-1">Dados específicos para terrenos</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zoneamento
                    </label>
                    <select
                      name="zoning"
                      value={formData.zoning}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione o zoneamento</option>
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
                      value={formData.slope}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione a topografia</option>
                      <option value="plano">Plano</option>
                      <option value="aclive">Aclive</option>
                      <option value="declive">Declive</option>
                      <option value="irregular">Irregular</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frente do Terreno (metros)
                  </label>
                  <input
                    type="number"
                    name="frontage"
                    value={formData.frontage}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    placeholder="Ex: 12.50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos para fazenda */}
          {formData.category === 'fazenda' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Informações da Fazenda</h3>
                <p className="text-sm text-gray-500 mt-1">Dados específicos para propriedades rurais</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Seletor de Unidade de Medida */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidade de Medida para Área
                  </label>
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
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
                                  formData.areaUnit.includes('alqueires') ? 'alqueires' :
                                  formData.areaUnit === 'tarefas' ? 'tarefas' :
                                  formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                    </label>
                    <input
                      type="number"
                      name="totalArea"
                      value={formData.totalArea}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 50.75"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Cultivada ({formData.areaUnit === 'metros' ? 'm²' :
                                      formData.areaUnit === 'quilometros' ? 'km²' :
                                      formData.areaUnit === 'hectares' ? 'ha' :
                                      formData.areaUnit === 'acres' ? 'acres' :
                                      formData.areaUnit.includes('alqueires') ? 'alqueires' :
                                      formData.areaUnit === 'tarefas' ? 'tarefas' :
                                      formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                    </label>
                    <input
                      type="number"
                      name="cultivatedArea"
                      value={formData.cultivatedArea}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 30.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área de Pastagens ({formData.areaUnit === 'metros' ? 'm²' :
                                         formData.areaUnit === 'quilometros' ? 'km²' :
                                         formData.areaUnit === 'hectares' ? 'ha' :
                                         formData.areaUnit === 'acres' ? 'acres' :
                                         formData.areaUnit.includes('alqueires') ? 'alqueires' :
                                         formData.areaUnit === 'tarefas' ? 'tarefas' :
                                         formData.areaUnit === 'braças' ? 'braças²' : 'ha'})
                    </label>
                    <input
                      type="number"
                      name="pastures"
                      value={formData.pastures}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                      placeholder="Ex: 15.25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fontes de Água
                  </label>
                  <input
                    type="text"
                    name="waterSources"
                    value={formData.waterSources}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    placeholder="Ex: Rio, 2 poços artesianos, açude"
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
                          checked={formData.buildings.includes(building)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                buildings: [...prev.buildings, building]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                buildings: prev.buildings.filter(b => b !== building)
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
          )}

          {/* Campos específicos para comercial */}
          {formData.category === 'comercial' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Características Comerciais</h3>
                <p className="text-sm text-gray-500 mt-1">Informações específicas para imóveis comerciais</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Informações básicas comerciais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Imóvel Comercial
                    </label>
                    <select
                      name="commercialType"
                      value={formData.commercialType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="loja">Loja</option>
                      <option value="sala-comercial">Sala Comercial</option>
                      <option value="galpao">Galpão</option>
                      <option value="deposito">Depósito</option>
                      <option value="escritorio">Escritório</option>
                      <option value="consultorio">Consultório</option>
                      <option value="clinica">Clínica</option>
                      <option value="restaurante">Restaurante</option>
                      <option value="hotel">Hotel</option>
                      <option value="pousada">Pousada</option>
                      <option value="posto-gasolina">Posto de Gasolina</option>
                      <option value="industria">Indústria</option>
                      <option value="shopping">Shopping Center</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Andar (se aplicável)
                  </label>
                  <input
                    type="number"
                    name="floor_commercial"
                    value={formData.floor_commercial}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    placeholder="Ex: 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centro Empresarial/Edifício/Shopping
                  </label>
                  <input
                    type="text"
                    name="businessCenter"
                    value={formData.businessCenter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7360ee] focus:border-[#7360ee]"
                    placeholder="Ex: Centro Empresarial ABC, Shopping XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características e Facilidades
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Ar Condicionado',
                      'Internet/Wifi',
                      'Elevador',
                      'Estacionamento',
                      'Segurança 24h',
                      'Recepção',
                      'CFTV',
                      'Gerador',
                      'Copa/Cozinha',
                      'Banheiro Privativo',
                      'Sala de Reunião',
                      'Depósito',
                      'Vitrine',
                      'Pé Direito Alto',
                      'Rampa de Acesso',
                      'Entrada Independente',
                      'Mezanino',
                      'Escritório Anexo',
                      'Área Externa',
                      'Próximo ao Centro',
                      'Transporte Público',
                      'Fácil Acesso'
                    ].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                features: [...prev.features, feature]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                features: prev.features.filter(f => f !== feature)
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

          {/* Upload de Imagens */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Imagens do Imóvel</h3>
              <p className="text-sm text-gray-500 mt-1">Adicione quantas imagens quiser (JPEG, PNG - máx 5MB cada)</p>
            </div>
            <div className="p-6">
              {/* Upload Area */}
              <div className="mb-6">
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#7360ee] hover:text-blue-500">Clique para fazer upload</span> ou arraste as imagens aqui
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPEG, PNG • Tamanho máximo: 5MB por arquivo
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Preview das Imagens */}
              {imagePreview.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Imagens Selecionadas ({imagePreview.length})
                    <span className="text-xs text-gray-500 ml-2">• Arraste para reordenar</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div 
                        key={imageIds[index] || `fallback-${index}`} 
                        className={`relative group cursor-move transition-all duration-200 ${
                          draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-transparent hover:border-[#7360ee]/30">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-all z-20 shadow-lg hover:scale-110"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-[#7360ee]/100 text-white text-xs px-2 py-1 rounded font-medium z-10">
                            Principal
                          </div>
                        )}
                        {/* Indicador de drag */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg z-5">
                          <div className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                            ↕️ Arraste
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🎯 <strong>Imagem Principal:</strong> A primeira imagem será a foto principal do imóvel.<br/>
                    🖱️ <strong>Reordenar:</strong> Arraste qualquer imagem para a primeira posição para torná-la principal.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload de Vídeo */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vídeo Shorts do Imóvel</h3>
              <p className="text-sm text-gray-500 mt-1">Adicione um vídeo vertical de até 60 segundos (formato shorts - máx 100MB)</p>
            </div>
            <div className="p-6">
              {/* Upload Area */}
              <div className="mb-6">
                <label className="block">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    onChange={handleVideoUpload}
                    multiple
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#7360ee] hover:text-blue-500">Clique para fazer upload</span> ou arraste os vídeos aqui
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: MP4, WebM, MOV • Vertical • Máx 60s • Até 100MB cada • Múltiplos vídeos
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Preview dos Vídeos */}
              {videoPreviews.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Vídeos Selecionados ({videoPreviews.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <video
                            src={preview}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Vídeo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ✅ Vídeos processados e otimizados para web. Serão comprimidos se necessário.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Configurações</h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Imóvel em destaque (aparecerá na página inicial)
                </span>
              </label>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Formas de Pagamento Aceitas:</p>

                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="acceptsFinancing"
                    checked={formData.acceptsFinancing}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aceita Financiamento Bancário
                  </span>
                </label>

                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="acceptsTrade"
                    checked={formData.acceptsTrade}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aceita Permuta/Troca
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="acceptsCar"
                    checked={formData.acceptsCar}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#7360ee] focus:ring-[#7360ee] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aceita Carro como Parte do Pagamento
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/properties"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#7360ee] text-white rounded-lg hover:bg-[#7360ee]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Criar Imóvel'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}