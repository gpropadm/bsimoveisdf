import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id

    console.log('🚫 Processando opt-out para lead:', leadId)

    // Buscar o lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    const alreadyOptedOut = !lead.enableMatching

    // Desabilitar matching para este lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        enableMatching: false,
        agentStatus: 'opted_out',
        agentProcessedAt: new Date()
      }
    })

    console.log(`✅ Opt-out processado para ${lead.name} (${lead.phone})`)

    return NextResponse.json({
      success: true,
      message: alreadyOptedOut ? 'Lead já havia optado por não receber mensagens' : 'Opt-out realizado com sucesso',
      alreadyOptedOut,
      lead: {
        name: updatedLead.name,
        email: updatedLead.email
      }
    })

  } catch (error) {
    console.error('❌ Erro ao processar opt-out:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const leadId = params.id

    // Buscar informações do lead para exibir na página
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        name: true,
        email: true,
        enableMatching: true
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      lead: {
        name: lead.name,
        email: lead.email,
        enableMatching: lead.enableMatching
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}