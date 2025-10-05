import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Busca todas as propriedades
    const properties = await prisma.property.findMany({
      select: {
        type: true,
        category: true
      }
    })

    // Extrai tipos únicos
    const uniqueTypes = [...new Set(properties.map(p => p.type).filter(Boolean))]

    // Extrai categorias únicas
    const uniqueCategories = [...new Set(properties.map(p => p.category).filter(Boolean))]

    // Formata tipos
    const types = uniqueTypes.map(type => ({
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
      ...uniqueCategories.map(category => ({
        key: category,
        label: category === 'casa' ? 'Casas' :
               category === 'apartamento' ? 'Apartamentos' :
               category === 'terreno' ? 'Terrenos' :
               category === 'comercial' ? 'Comercial' :
               category === 'rural' ? 'Rural' :
               category.charAt(0).toUpperCase() + category.slice(1)
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
