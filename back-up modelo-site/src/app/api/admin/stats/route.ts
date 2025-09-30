import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { type: 'venda' } }),
      prisma.property.count({ where: { type: 'aluguel' } }),
      prisma.property.count({ where: { featured: true } }),
    ])

    const [totalProperties, saleProperties, rentalProperties, featuredProperties] = stats

    return NextResponse.json({
      totalProperties,
      saleProperties,
      rentalProperties,
      featuredProperties,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}