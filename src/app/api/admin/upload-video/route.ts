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
    console.log('🎥 === INÍCIO DO UPLOAD DE VÍDEO ===')
    console.log('🎥 Verificando sessão para upload de vídeo...')

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('👤 Sessão encontrada:', session ? 'SIM' : 'NÃO')
    if (!session) {
      console.log('❌ Upload de vídeo bloqueado - sem sessão')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('📦 Extraindo dados do FormData...')
    const data = await request.formData()
    const video: File | null = data.get('video') as unknown as File

    if (!video) {
      console.log('❌ Nenhum arquivo de vídeo encontrado no FormData')
      return NextResponse.json({ error: 'Nenhum vídeo enviado' }, { status: 400 })
    }

    console.log('🎥 Detalhes do arquivo:', {
      name: video.name,
      type: video.type,
      size: `${(video.size / 1024 / 1024).toFixed(2)}MB`
    })

    // Verificar se é um arquivo de vídeo - incluir tipos específicos do MOV
    const validVideoTypes = [
      'video/mp4',
      'video/mov',
      'video/quicktime',
      'video/x-quicktime',
      'video/webm',
      'video/avi',
      'video/x-msvideo'
    ]

    const isValidVideo = video.type.startsWith('video/') ||
                        validVideoTypes.includes(video.type.toLowerCase()) ||
                        video.name.toLowerCase().endsWith('.mov') ||
                        video.name.toLowerCase().endsWith('.mp4') ||
                        video.name.toLowerCase().endsWith('.webm')

    if (!isValidVideo) {
      console.log('❌ Tipo de arquivo inválido:', video.type)
      return NextResponse.json({
        error: `Tipo de arquivo não suportado: ${video.type}. Tipos aceitos: MP4, MOV, WebM`
      }, { status: 400 })
    }

    // Verificar tamanho (máximo 50MB)
    if (video.size > 50 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande:', `${(video.size / 1024 / 1024).toFixed(2)}MB`)
      return NextResponse.json({ error: 'Vídeo muito grande. Máximo 50MB' }, { status: 400 })
    }

    console.log('🎥 Iniciando upload do vídeo para Cloudinary...')
    
    // Converter vídeo para Buffer
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('☁️ Fazendo upload para Cloudinary...', video.name)

    // Upload para Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'imoveis/videos',
          transformation: [
            { quality: 'auto' },
            { video_codec: 'h264' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    console.log('✅ Vídeo upload concluído:', uploadResult.secure_url)

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url
    })

  } catch (error) {
    console.error('❌ === ERRO NO UPLOAD DE VÍDEO ===')
    console.error('❌ Erro detalhado no upload do vídeo:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })

    // Tratamento específico para erros do Cloudinary
    if (error && typeof error === 'object' && 'http_code' in error) {
      console.error('☁️ Erro específico do Cloudinary:', {
        http_code: (error as any).http_code,
        message: (error as any).message
      })

      if ((error as any).http_code === 401) {
        return NextResponse.json({
          error: 'Erro de autenticação com Cloudinary',
          details: 'Verifique as credenciais do Cloudinary'
        }, { status: 500 })
      }
    }

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        type: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}