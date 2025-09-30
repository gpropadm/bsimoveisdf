import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Buscar todos os tipos únicos de propriedades
    const typesResult = await prisma.property.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    })

    // Buscar todas as categorias únicas de propriedades
    const categoriesResult = await prisma.property.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    })

    // Extrair valores únicos e ordenar
    const types = typesResult
      .map(item => item.type)
      .filter(Boolean)
      .sort()

    const categories = categoriesResult
      .map(item => item.category)
      .filter(Boolean)
      .sort()

    return NextResponse.json({
      types,
      categories
    })
  } catch (error) {
    console.error('Erro ao buscar filtros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}