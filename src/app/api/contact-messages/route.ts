import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validação básica
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Criar mensagem no banco
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        source: 'site',
        referrer: request.headers.get('referer') || null,
        status: 'novo'
      }
    })

    console.log('💬 Nova mensagem de contato:', {
      id: contactMessage.id,
      nome: contactMessage.name,
      assunto: contactMessage.subject,
      email: contactMessage.email
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      messageId: contactMessage.id 
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erro ao criar mensagem de contato:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}