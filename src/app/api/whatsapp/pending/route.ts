import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { to, message, source } = await request.json();

    if (!to || !message) {
      return NextResponse.json({
        success: false,
        error: 'Destinatário e mensagem são obrigatórios'
      }, { status: 400 });
    }

    // Salvar mensagem pendente
    const pendingMessage = await prisma.pendingWhatsApp.create({
      data: {
        to,
        message,
        source: source || 'Website',
        sent: false,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      id: pendingMessage.id,
      message: 'Mensagem salva para envio manual'
    });

  } catch (error) {
    console.error('Erro ao salvar mensagem WhatsApp:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await prisma.pendingWhatsApp.findMany({
      where: {
        sent: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}