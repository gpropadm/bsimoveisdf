import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Busca todos os tipos únicos
    const typesResult = await prisma.property.findMany({
      select: { type: true },
      distinct: ['type']
    })

    // Busca todas as categorias únicas
    const categoriesResult = await prisma.property.findMany({
      select: { category: true },
      distinct: ['category'],
      where: {
        category: {
          not: null
        }
      }
    })

    // Formata tipos
    const types = typesResult
      .map(item => item.type)
      .filter(Boolean)
      .map(type => ({
        key: type,
        label: type === 'venda' ? 'Venda' :
               type === 'aluguel' ? 'Locação' :
               type === 'lancamento' ? 'Lançamento' :
               type === 'empreendimento' ? 'Empreendimento' :
               type.charAt(0).toUpperCase() + type.slice(1)
      }))

    // Formata categorias
    const categories = [
      { key: '', label: 'Todos' },
      ...categoriesResult
        .map(item => item.category)
        .filter(Boolean)
        .map(category => ({
          key: category!,
          label: category === 'casa' ? 'Casas' :
                 category === 'apartamento' ? 'Apartamentos' :
                 category === 'terreno' ? 'Terrenos' :
                 category === 'comercial' ? 'Comercial' :
                 category === 'rural' ? 'Rural' :
                 category!.charAt(0).toUpperCase() + category!.slice(1)
        }))
    ]

    return NextResponse.json({ types, categories })

  } catch (error) {
    console.error('Erro ao buscar filtros:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar filtros' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
