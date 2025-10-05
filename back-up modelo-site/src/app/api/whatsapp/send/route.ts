import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppInstance } from '@/lib/whatsapp-baileys';

export async function POST(request: NextRequest) {
  try {
    const { to, message, source, lead_id } = await request.json();

    // Production security check
    const authToken = request.headers.get('Authorization');
    const expectedToken = `Bearer ${process.env.AGENT_AUTH_TOKEN}`;

    if (process.env.NODE_ENV === 'production' && authToken !== expectedToken) {
      console.log('❌ [WhatsApp API] Token de autenticação inválido');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log(`📱 [WhatsApp API] Enviando mensagem via ${source || 'unknown'} para ${to}`);

    // Get WhatsApp instance
    const whatsapp = getWhatsAppInstance();

    // Check if connected
    if (!whatsapp.isConnected()) {
      console.log('❌ [WhatsApp API] WhatsApp não conectado, tentando conectar...');

      // Try to initialize if not connected
      await whatsapp.initialize();

      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!whatsapp.isConnected()) {
        return NextResponse.json(
          {
            success: false,
            error: 'WhatsApp não conectado. Verifique o QR Code no terminal.'
          },
          { status: 503 }
        );
      }
    }

    // Send message
    const success = await whatsapp.sendMessage(to, message);

    if (success) {
      console.log(`✅ [WhatsApp API] Mensagem enviada com sucesso para ${to}${lead_id ? ` (Lead: ${lead_id})` : ''}`);
      return NextResponse.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        timestamp: new Date().toISOString(),
        recipient: to,
        lead_id: lead_id || null,
        source: source || 'unknown'
      });
    } else {
      console.log(`❌ [WhatsApp API] Falha ao enviar mensagem para ${to}${lead_id ? ` (Lead: ${lead_id})` : ''}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao enviar mensagem',
          lead_id: lead_id || null
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 [WhatsApp API] Erro geral:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}