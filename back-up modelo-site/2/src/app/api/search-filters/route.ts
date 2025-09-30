import { NextResponse } from 'next/server'

// Cache estático para desenvolvimento - muito mais rápido
let cachedData: any = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function GET() {
  try {
    // Retornar cache se ainda válido
    if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedData)
    }

    // Para desenvolvimento, usar dados estáticos baseados nos imóveis existentes
    const result = {
      types: ['venda'],
      categoriesByType: {
        'venda': ['apartamento']
      }
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
        'venda': ['apartamento', 'casa'],
        'aluguel': ['apartamento', 'casa']
      }
    })
  }
}