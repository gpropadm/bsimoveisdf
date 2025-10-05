import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Estatísticas de hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await prisma.chatbotStats.aggregate({
      where: {
        createdAt: { gte: today }
      },
      _sum: {
        messagesCount: true,
        tokensInput: true,
        tokensOutput: true,
        costEstimated: true
      },
      _count: {
        id: true
      }
    })

    const leadsToday = await prisma.chatbotStats.count({
      where: {
        createdAt: { gte: today },
        leadCaptured: true
      }
    })

    // Estatísticas do mês
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthStats = await prisma.chatbotStats.aggregate({
      where: {
        createdAt: { gte: firstDayOfMonth }
      },
      _sum: {
        messagesCount: true,
        tokensInput: true,
        tokensOutput: true,
        costEstimated: true
      },
      _count: {
        id: true
      }
    })

    const leadsMonth = await prisma.chatbotStats.count({
      where: {
        createdAt: { gte: firstDayOfMonth },
        leadCaptured: true
      }
    })

    // Estatísticas totais
    const totalStats = await prisma.chatbotStats.aggregate({
      _sum: {
        messagesCount: true,
        tokensInput: true,
        tokensOutput: true,
        costEstimated: true
      },
      _count: {
        id: true
      }
    })

    const leadsTotal = await prisma.chatbotStats.count({
      where: {
        leadCaptured: true
      }
    })

    return NextResponse.json({
      today: {
        conversations: todayStats._count.id || 0,
        messages: todayStats._sum.messagesCount || 0,
        tokensInput: todayStats._sum.tokensInput || 0,
        tokensOutput: todayStats._sum.tokensOutput || 0,
        cost: todayStats._sum.costEstimated || 0,
        leads: leadsToday
      },
      month: {
        conversations: monthStats._count.id || 0,
        messages: monthStats._sum.messagesCount || 0,
        tokensInput: monthStats._sum.tokensInput || 0,
        tokensOutput: monthStats._sum.tokensOutput || 0,
        cost: monthStats._sum.costEstimated || 0,
        leads: leadsMonth
      },
      total: {
        conversations: totalStats._count.id || 0,
        messages: totalStats._sum.messagesCount || 0,
        tokensInput: totalStats._sum.tokensInput || 0,
        tokensOutput: totalStats._sum.tokensOutput || 0,
        cost: totalStats._sum.costEstimated || 0,
        leads: leadsTotal
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
