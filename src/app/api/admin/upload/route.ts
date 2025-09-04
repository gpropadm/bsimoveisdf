import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
    
    // Extrair todos os arquivos do FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image-') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Validar tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: `Arquivo ${file.name} é muito grande. Máximo 5MB.` 
        }, { status: 400 })
      }

      // Converter File para Base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = file.type
      
      // Criar Data URL
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      console.log('💾 Imagem convertida para Base64, tamanho:', base64.length)
      uploadedUrls.push(dataUrl)
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