import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        type: 'venda',
        category: 'fazenda'
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
        totalArea: true,
        cultivatedArea: true,
        pastures: true,
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
    console.error('Erro ao buscar fazendas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}