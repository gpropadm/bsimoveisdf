import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        type: 'aluguel'
      },
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        address: true,
        city: true,
        state: true,
        category: true,
        bedrooms: true,
        bathrooms: true,
        parking: true,
        area: true,
        images: true,
        slug: true,
        featured: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Erro ao buscar propriedades de aluguel:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}