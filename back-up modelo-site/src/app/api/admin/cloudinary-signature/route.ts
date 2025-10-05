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
    console.log('🔐 Gerando assinatura Cloudinary para upload direto...')

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('❌ Assinatura bloqueada - sem sessão')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { resource_type = 'video' } = await request.json()

    // Parâmetros para o upload (apenas os necessários)
    const timestamp = Math.round(new Date().getTime() / 1000)
    const params = {
      timestamp,
      folder: resource_type === 'video' ? 'imoveis/videos' : 'imoveis'
    }

    console.log('🔐 Parâmetros para assinatura:', params)

    // Gerar assinatura
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

    console.log('✅ Assinatura gerada:', { signature: signature.substring(0, 10) + '...' })

    console.log('✅ Assinatura gerada para upload direto')

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      params
    })

  } catch (error) {
    console.error('❌ Erro ao gerar assinatura Cloudinary:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}