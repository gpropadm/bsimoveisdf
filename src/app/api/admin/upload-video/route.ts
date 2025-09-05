import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🎥 Verificando sessão para upload de vídeo...')
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('👤 Sessão encontrada:', session ? 'SIM' : 'NÃO')
    if (!session) {
      console.log('❌ Upload de vídeo bloqueado - sem sessão')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const video: File | null = data.get('video') as unknown as File

    if (!video) {
      return NextResponse.json({ error: 'Nenhum vídeo enviado' }, { status: 400 })
    }

    // Verificar se é um arquivo de vídeo
    if (!video.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Arquivo deve ser um vídeo' }, { status: 400 })
    }

    // Verificar tamanho (máximo 10MB para Base64)
    if (video.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Vídeo muito grande. Máximo 10MB' }, { status: 400 })
    }

    console.log('🎥 Iniciando conversão do vídeo para Base64...')
    
    // Converter vídeo para Base64
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    console.log('🔄 Buffer criado, convertendo para Base64...')
    const base64 = buffer.toString('base64')
    const mimeType = video.type
    
    // Verificar se Base64 não é muito grande (limite adicional de segurança)
    if (base64.length > 15 * 1024 * 1024) { // ~15MB em Base64
      return NextResponse.json({ error: 'Vídeo resultante muito grande após conversão' }, { status: 400 })
    }
    
    // Criar Data URL
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('✅ Vídeo convertido para Base64, tamanho:', base64.length)

    return NextResponse.json({
      success: true,
      url: dataUrl
    })

  } catch (error) {
    console.error('❌ Erro detalhado no upload do vídeo:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}