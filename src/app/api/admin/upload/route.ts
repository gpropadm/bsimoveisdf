import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Criar diretório para uploads se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
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

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomId}.${fileExtension}`

      // Converter File para Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Salvar arquivo
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      // Adicionar URL ao resultado
      uploadedUrls.push(`/uploads/properties/${fileName}`)
    }

    return NextResponse.json({ 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} imagens enviadas com sucesso`
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}