import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar propriedades
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        price: true,
        type: true,
        featured: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Buscar leads
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        propertyTitle: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular estatísticas
    const stats = {
      totalProperties: properties.length,
      saleProperties: properties.filter(p => p.type === 'venda').length,
      rentalProperties: properties.filter(p => p.type === 'aluguel').length,
      featuredProperties: properties.filter(p => p.featured).length,
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'novo').length,
      interestedLeads: leads.filter(l => l.status === 'interessado').length,
      convertedLeads: leads.filter(l => l.status === 'convertido').length
    }

    return NextResponse.json({
      stats,
      recentProperties: properties.slice(0, 5),
      recentLeads: leads.slice(0, 5)
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}