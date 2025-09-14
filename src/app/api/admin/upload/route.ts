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
  try {
    console.log('🔐 Verificando sessão para upload...')
    const session = await getServerSession(authOptions)
    console.log('👤 Sessão encontrada:', session ? 'SIM' : 'NÃO')
    
    if (!session) {
      console.log('❌ Upload bloqueado - sem sessão')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = []

    console.log('📦 Processando FormData...')

    // Extrair todos os arquivos do FormData
    for (const [key, value] of formData.entries()) {
      console.log('🔍 FormData entry:', key, typeof value, value instanceof File ? value.name : value)
      if (key.startsWith('image-') && value instanceof File) {
        console.log('✅ Arquivo válido encontrado:', {
          key,
          name: value.name,
          type: value.type,
          size: `${(value.size / 1024 / 1024).toFixed(2)}MB`,
          lastModified: new Date(value.lastModified).toISOString()
        })
        files.push(value)
      }
    }

    console.log('📊 Total de arquivos extraídos:', files.length)

    if (files.length === 0) {
      console.log('❌ Nenhum arquivo válido encontrado no FormData')
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      console.log(`🔄 Processando arquivo: "${file.name}"`)

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.log(`❌ Tipo de arquivo inválido: "${file.name}" (${file.type})`)
        continue
      }

      // Validar tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = `Arquivo "${file.name}" é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB.`
        console.log('❌', errorMsg)
        return NextResponse.json({ error: errorMsg }, { status: 400 })
      }

      // Converter File para Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      console.log('☁️ Fazendo upload para Cloudinary...', file.name, 'Tamanho:', (buffer.length/1024/1024).toFixed(2) + 'MB')

      // Upload para Cloudinary com timeout
      const uploadResult = await Promise.race([
        new Promise((resolve, reject) => {
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
                console.error('❌ Erro do Cloudinary:', error)
                reject(error)
              } else {
                console.log('✅ Upload Cloudinary sucesso:', result?.public_id)
                resolve(result)
              }
            }
          ).end(buffer)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout após 30s')), 30000)
        )
      ]) as any

      console.log('✅ Upload concluído:', uploadResult.secure_url)
      uploadedUrls.push(uploadResult.secure_url)
    }

    return NextResponse.json({ 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} imagens enviadas com sucesso`
    })

  } catch (error) {
    console.error('❌ Erro detalhado no upload:', {
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