'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    address: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    area: '',
    featured: false
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])

  // Cleanup dos preview URLs quando o componente for desmontado
  useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url))
      videoPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreview, videoPreviews])

  // Função para formatar valor monetário
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Se não há números, retorna vazio
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseFloat(numbers) / 100
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Função para converter valor formatado para número
  const parseCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers ? parseFloat(numbers) / 100 : 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (name === 'price') {
      // Aplicar máscara de dinheiro no campo preço
      const formattedValue = formatCurrency(value)
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limitar a 10 imagens
    const newImages = [...images, ...files].slice(0, 10)
    setImages(newImages)

    // Criar previews
    const previews = newImages.map(file => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    
    // Limpar URL object para evitar memory leaks
    URL.revokeObjectURL(imagePreview[index])
    
    setImages(newImages)
    setImagePreview(newPreviews)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Processar cada arquivo selecionado
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        alert(`${file.name}: Por favor, selecione apenas arquivos de vídeo.`)
        continue
      }

      // Verificar tamanho inicial (máximo 100MB para upload)
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name}: O vídeo deve ter no máximo 100MB para upload.`)
        continue
      }

      try {
        console.log(`🎬 Processando vídeo ${i + 1}/${files.length}: ${file.name}`)
        
        // Importar utilitários de vídeo dinamicamente
        const { validateShortsVideo, compressVideo, getVideoInfo } = await import('@/lib/videoUtils')
        
        // Validar se é adequado para shorts
        const validation = await validateShortsVideo(file)
        if (!validation.valid) {
          alert(`${file.name}: Problemas encontrados:\n\n${validation.issues.join('\n')}`)
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
        alert(`Erro ao processar o vídeo ${file.name}. Continuando com outros arquivos...`)
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
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Erro ao fazer upload das imagens')
        }

        const uploadResult = await uploadResponse.json()
        imageUrls = uploadResult.urls
      }

      // Upload dos vídeos se houver
      let videoUrls: string[] = []
      
      if (videoFiles.length > 0) {
        for (const videoFile of videoFiles) {
          const videoFormData = new FormData()
          videoFormData.append('video', videoFile)

          const videoUploadResponse = await fetch('/api/admin/upload-video', {
            method: 'POST',
            body: videoFormData
          })

          if (!videoUploadResponse.ok) {
            throw new Error('Erro ao fazer upload do vídeo')
          }

          const videoUploadResult = await videoUploadResponse.json()
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
          ...formData,
          price: parseCurrency(formData.price),
          bedrooms: parseInt(formData.bedrooms) || null,
          bathrooms: parseInt(formData.bathrooms) || null,
          parking: parseInt(formData.parking) || null,
          area: parseFloat(formData.area) || null,
          images: JSON.stringify(imageUrls),
          video: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar imóvel')
      }

      router.push('/admin/properties')
    } catch (error) {
      console.error('Erro ao criar imóvel:', error)
      alert('Erro ao criar imóvel. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Novo Imóvel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Adicione um novo imóvel ao catálogo
              </p>
            </div>
            <Link
              href="/admin/properties"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Apartamento 3 quartos no Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="terreno">Terreno</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SC"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Características</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload de Imagens */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Imagens do Imóvel</h3>
              <p className="text-sm text-gray-500 mt-1">Adicione até 10 imagens (JPEG, PNG - máx 5MB cada)</p>
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
                        <span className="font-medium text-blue-600 hover:text-blue-500">Clique para fazer upload</span> ou arraste as imagens aqui
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
                    Imagens Selecionadas ({imagePreview.length}/10)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    A primeira imagem será usada como foto principal do imóvel
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
                        <span className="font-medium text-blue-600 hover:text-blue-500">Clique para fazer upload</span> ou arraste os vídeos aqui
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
            <div className="p-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Imóvel em destaque (aparecerá na página inicial)
                </span>
              </label>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : 'Criar Imóvel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}