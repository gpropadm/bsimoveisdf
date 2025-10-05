import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const { slug } = resolvedParams

    console.log(`🔍 [API] Buscando propriedade com slug: ${slug}`)

    const property = await prisma.property.findUnique({
      where: {
        slug: slug
      }
    })

    if (!property) {
      console.log(`❌ [API] Propriedade não encontrada: ${slug}`)
      return NextResponse.json(
        { error: 'Propriedade não encontrada' },
        { status: 404 }
      )
    }

    console.log(`✅ [API] Propriedade encontrada: ${property.title}`)

    return NextResponse.json(property)
  } catch (error) {
    console.error('Erro ao buscar propriedade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}