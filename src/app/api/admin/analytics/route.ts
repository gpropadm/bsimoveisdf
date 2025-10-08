import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar estatísticas gerais
    const totalProperties = await prisma.property.count()

    const viewsSum = await prisma.property.aggregate({
      _sum: {
        views: true
      }
    })

    const totalViews = viewsSum._sum.views || 0
    const averageViews = totalProperties > 0 ? totalViews / totalProperties : 0

    // Buscar top 20 imóveis mais visualizados
    const topProperties = await prisma.property.findMany({
      orderBy: {
        views: 'desc'
      },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        type: true,
        category: true,
        city: true,
        price: true
      }
    })

    return NextResponse.json({
      totalViews,
      totalProperties,
      averageViews,
      topProperties
    })
  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar analytics' },
      { status: 500 }
    )
  }
}
