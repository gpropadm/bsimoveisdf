import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`🚀 [${requestId}] Iniciando upload request...`)

  try {
    console.log(`🔐 [${requestId}] Verificando sessão para upload...`)
    const session = await getServerSession(authOptions)
    console.log(`👤 [${requestId}] Sessão encontrada:`, session ? 'SIM' : 'NÃO')

    if (!session) {
      console.log(`❌ [${requestId}] Upload bloqueado - sem sessão`)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log(`📦 [${requestId}] Processando FormData...`)

    let formData
    try {
      formData = await request.formData()
      console.log(`✅ [${requestId}] FormData processado com sucesso`)
    } catch (error) {
      console.error(`❌ [${requestId}] Erro ao processar FormData:`, error)
      throw new Error('Erro ao processar dados do formulário')
    }

    const files = []

    // Extrair todos os arquivos do FormData
    for (const [key, value] of formData.entries()) {
      console.log(`🔍 [${requestId}] FormData entry:`, key, typeof value, value instanceof File ? `File: ${value.name}` : value)
      if (key.startsWith('image-') && value instanceof File) {
        console.log(`✅ [${requestId}] Arquivo válido encontrado:`, {
          key,
          name: value.name,
          type: value.type,
          size: `${(value.size / 1024 / 1024).toFixed(2)}MB`,
          lastModified: new Date(value.lastModified).toISOString()
        })
        files.push(value)
      }
    }

    console.log(`📊 [${requestId}] Total de arquivos extraídos:`, files.length)

    if (files.length === 0) {
      console.log(`❌ [${requestId}] Nenhum arquivo válido encontrado no FormData`)
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`🔄 [${requestId}] Processando arquivo ${i + 1}/${files.length}: "${file.name}"`)

      try {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          const error = `Tipo de arquivo inválido: "${file.name}" (${file.type})`
          console.log(`❌ [${requestId}] ${error}`)
          errors.push(error)
          continue
        }

        // Validar tamanho (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          const error = `Arquivo "${file.name}" é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB.`
          console.log(`❌ [${requestId}] ${error}`)
          errors.push(error)
          continue
        }

        // Converter File para Buffer
        console.log(`🔄 [${requestId}] Convertendo arquivo para buffer: "${file.name}"`)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        console.log(`☁️ [${requestId}] Fazendo upload para Cloudinary: "${file.name}" - Tamanho: ${(buffer.length/1024/1024).toFixed(2)}MB`)

        // Upload para Cloudinary com timeout
        const uploadResult = await Promise.race([
          new Promise((resolve, reject) => {
            console.log(`⬆️ [${requestId}] Iniciando upload para Cloudinary: "${file.name}"`)
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'imoveis',
                transformation: [
                  { width: 1200, height: 800, crop: 'limit' },
                  { quality: 'auto', fetch_format: 'auto' }
                ]
              },
              (error, result) => {
                if (error) {
                  console.error(`❌ [${requestId}] Erro do Cloudinary para "${file.name}":`, error)
                  reject(error)
                } else {
                  console.log(`✅ [${requestId}] Upload Cloudinary sucesso para "${file.name}":`, result?.public_id)
                  resolve(result)
                }
              }
            ).end(buffer)
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Upload timeout após 30s para "${file.name}"`)), 30000)
          )
        ]) as any

        console.log(`✅ [${requestId}] Upload concluído: "${file.name}" -> ${uploadResult.secure_url}`)
        uploadedUrls.push(uploadResult.secure_url)

      } catch (fileError) {
        const error = `Erro no upload de "${file.name}": ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}`
        console.error(`❌ [${requestId}] ${error}`)
        errors.push(error)
      }
    }

    console.log(`📊 [${requestId}] Resumo do upload:`, {
      totalArquivos: files.length,
      sucessos: uploadedUrls.length,
      erros: errors.length,
      errorsList: errors
    })

    if (uploadedUrls.length === 0 && errors.length > 0) {
      console.log(`❌ [${requestId}] Nenhum arquivo foi carregado com sucesso`)
      return NextResponse.json({
        error: 'Nenhum arquivo foi carregado com sucesso',
        details: errors.join('; ')
      }, { status: 400 })
    }

    const response = {
      urls: uploadedUrls,
      message: `${uploadedUrls.length} imagens enviadas com sucesso`,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log(`✅ [${requestId}] Upload concluído:`, response)
    return NextResponse.json(response)

  } catch (error) {
    console.error(`❌ [${requestId}] Erro detalhado no upload:`, {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}