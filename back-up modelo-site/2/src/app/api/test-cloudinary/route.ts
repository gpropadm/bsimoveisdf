import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function GET() {
  try {
    console.log('🧪 Testando Cloudinary...')
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Definido' : 'Não definido')
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Definido' : 'Não definido')
    
    // Teste de ping
    const pingResult = await cloudinary.api.ping()
    console.log('✅ Ping resultado:', pingResult)
    
    return NextResponse.json({
      success: true,
      cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key_defined: !!process.env.CLOUDINARY_API_KEY,
        api_secret_defined: !!process.env.CLOUDINARY_API_SECRET,
        ping: pingResult
      }
    })
  } catch (error) {
    console.error('❌ Erro teste Cloudinary:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key_defined: !!process.env.CLOUDINARY_API_KEY,
        api_secret_defined: !!process.env.CLOUDINARY_API_SECRET,
      }
    }, { status: 500 })
  }
}