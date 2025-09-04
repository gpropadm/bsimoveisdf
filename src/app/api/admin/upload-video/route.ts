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

    // Verificar tamanho (máximo 50MB)
    if (video.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Vídeo muito grande. Máximo 50MB' }, { status: 400 })
    }

    // Converter vídeo para Base64
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = video.type
    
    // Criar Data URL
    const dataUrl = `data:${mimeType};base64,${base64}`
    
    console.log('🎥 Vídeo convertido para Base64, tamanho:', base64.length)

    return NextResponse.json({
      success: true,
      url: dataUrl
    })

  } catch (error) {
    console.error('❌ Erro no upload do vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}