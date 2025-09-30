import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  let prisma: PrismaClient

  try {
    // Criar nova instância do Prisma
    prisma = new PrismaClient()
    await prisma.$connect()

    // Buscar configurações
    const settings = await prisma.settings.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    // Contar total de registros
    const totalSettings = await prisma.settings.count()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        url: process.env.DATABASE_URL?.substring(0, 50) + '...'
      },
      settings: {
        found: !!settings,
        total: totalSettings,
        data: settings ? {
          id: settings.id,
          headerImageUrl: settings.headerImageUrl,
          headerTitle: settings.headerTitle,
          headerSubtitle: settings.headerSubtitle,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        } : null
      }
    })

  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  } finally {
    if (prisma!) {
      await prisma.$disconnect()
    }
  }
}