import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams

    // Incrementa o contador de visualizações
    const property = await prisma.property.update({
      where: { slug },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        id: true,
        views: true
      }
    })

    return NextResponse.json({
      success: true,
      views: property.views
    })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar visualização' },
      { status: 500 }
    )
  }
}
