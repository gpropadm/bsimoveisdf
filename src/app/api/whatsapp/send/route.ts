import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Dynamic import para evitar erros durante build
    const WhatsAppService = (await import('@/lib/whatsapp')).default;

    const { recipients, message, provider } = await request.json();

    if (!recipients || !message) {
      return NextResponse.json({
        success: false,
        error: 'Recipients and message are required'
      }, { status: 400 });
    }

    // Parse recipients (pode ser string com quebras de linha ou array)
    let phoneNumbers: string[] = [];
    if (typeof recipients === 'string') {
      phoneNumbers = recipients.split('\n').map(phone => phone.trim()).filter(Boolean);
    } else if (Array.isArray(recipients)) {
      phoneNumbers = recipients;
    } else {
      phoneNumbers = [recipients];
    }

    const results = [];

    for (const phone of phoneNumbers) {
      // Validar e formatar número
      if (!WhatsAppService.validatePhoneNumber(phone)) {
        results.push({
          phone,
          success: false,
          error: 'Invalid phone number format'
        });
        continue;
      }

      const formattedPhone = WhatsAppService.formatPhoneNumber(phone);

      // Enviar mensagem
      const result = await WhatsAppService.sendMessage({
        to: formattedPhone,
        text: message,
        provider: provider || 'auto'
      });

      results.push({
        phone: formattedPhone,
        ...result
      });
    }

    // Calcular estatísticas
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: successful > 0,
      sent: successful,
      failed: failed,
      results: results
    });

  } catch (error: any) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}