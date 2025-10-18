import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Listar sessões ativas do bot
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '50')

    const sessions = await prisma.botSession.findMany({
      where: {
        status: status as any
      },
      include: {
        bot: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit
    })

    // Parsear dados JSON e calcular métricas
    const sessionsWithData = sessions.map(s => {
      const messages = s.messages ? JSON.parse(s.messages) : []
      const context = s.context ? JSON.parse(s.context) : {}

      return {
        ...s,
        messagesCount: messages.length,
        lastMessage: messages[messages.length - 1]?.content || '',
        userName: context.userName || 'Cliente',
        context,
        messages: messages.slice(-10) // Últimas 10 mensagens
      }
    })

    return NextResponse.json(sessionsWithData)
  } catch (error) {
    console.error('Erro ao buscar sessões:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    )
  }
}
