import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
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

    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar nome único para o arquivo
    const timestamp = Date.now()
    const fileExtension = path.extname(video.name)
    const fileName = `video_${timestamp}${fileExtension}`

    // Definir diretório de upload
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    
    // Criar diretório se não existir
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Diretório já existe
    }

    // Salvar arquivo
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // URL pública do vídeo
    const videoUrl = `/uploads/videos/${fileName}`

    console.log('✅ Vídeo salvo:', videoUrl)

    return NextResponse.json({
      success: true,
      url: videoUrl
    })

  } catch (error) {
    console.error('❌ Erro no upload do vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}