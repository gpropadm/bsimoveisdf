import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache estático para desenvolvimento
let cachedData: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function GET() {
  try {
    // Retornar cache se ainda válido
    if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedData)
    }

    // Buscar categorias únicas do banco de dados
    const categories = await prisma.property.findMany({
      where: {
        status: 'disponivel'
      },
      select: {
        category: true,
        type: true
      },
      distinct: ['category']
    })

    // Extrair categorias únicas
    const uniqueCategories = [...new Set(categories.map(p => p.category).filter(Boolean))]
    const uniqueTypes = [...new Set(categories.map(p => p.type).filter(Boolean))]

    // Organizar por tipo
    const categoriesByType: Record<string, string[]> = {}
    uniqueTypes.forEach(type => {
      categoriesByType[type] = uniqueCategories
    })

    const result = {
      types: uniqueTypes,
      categoriesByType
    }

    // Atualizar cache
    cachedData = result
    cacheTimestamp = Date.now()

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro ao buscar filtros:', error)

    // Fallback com dados básicos
    return NextResponse.json({
      types: ['venda', 'aluguel'],
      categoriesByType: {
        'venda': ['apartamento', 'casa', 'terreno', 'cobertura'],
        'aluguel': ['apartamento', 'casa', 'terreno', 'cobertura']
      }
    })
  }
}