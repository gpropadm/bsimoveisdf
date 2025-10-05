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

export async function GET(request: NextRequest) {
  try {
    console.log('☁️ Checking Cloudinary usage...')

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter estatísticas de uso do Cloudinary
    const usage = await cloudinary.api.usage()

    // Calcular estatísticas úteis
    const stats = {
      // Largura de banda (bytes para GB)
      bandwidth: {
        used: Math.round((usage.bandwidth?.usage || 0) / (1024 * 1024 * 1024) * 100) / 100,
        limit: Math.round((usage.bandwidth?.limit || 25 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024) * 100) / 100,
        percentage: Math.round(((usage.bandwidth?.usage || 0) / (usage.bandwidth?.limit || 25 * 1024 * 1024 * 1024)) * 100)
      },
      // Armazenamento (bytes para GB)
      storage: {
        used: Math.round((usage.storage?.usage || 0) / (1024 * 1024 * 1024) * 100) / 100,
        limit: Math.round((usage.storage?.limit || 25 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024) * 100) / 100,
        percentage: Math.round(((usage.storage?.usage || 0) / (usage.storage?.limit || 25 * 1024 * 1024 * 1024)) * 100)
      },
      // Transformações (créditos)
      transformations: {
        used: usage.transformations?.usage || 0,
        limit: usage.transformations?.limit || 25000,
        percentage: Math.round(((usage.transformations?.usage || 0) / (usage.transformations?.limit || 25000)) * 100)
      },
      // Recursos (quantidade de arquivos)
      resources: {
        images: usage.resources?.image || 0,
        videos: usage.resources?.video || 0,
        total: (usage.resources?.image || 0) + (usage.resources?.video || 0)
      },
      // Data da consulta
      lastUpdated: new Date().toISOString(),
      planType: usage.plan || 'Free'
    }

    console.log('✅ Cloudinary usage stats:', {
      bandwidth: `${stats.bandwidth.used}GB / ${stats.bandwidth.limit}GB (${stats.bandwidth.percentage}%)`,
      storage: `${stats.storage.used}GB / ${stats.storage.limit}GB (${stats.storage.percentage}%)`,
      transformations: `${stats.transformations.used} / ${stats.transformations.limit} (${stats.transformations.percentage}%)`,
      resources: `${stats.resources.total} arquivos (${stats.resources.images} imagens, ${stats.resources.videos} vídeos)`
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do Cloudinary:', error)
    return NextResponse.json(
      {
        error: 'Erro ao obter estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}