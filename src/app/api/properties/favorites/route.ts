import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { favoriteIds } = await request.json()

    if (!favoriteIds || !Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return NextResponse.json({ properties: [] })
    }

    const properties = await prisma.property.findMany({
      where: {
        id: {
          in: favoriteIds
        }
      },
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        parking: true,
        area: true,
        images: true,
        slug: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Erro ao buscar propriedades favoritas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}