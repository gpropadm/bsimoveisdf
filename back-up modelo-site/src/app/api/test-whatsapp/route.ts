import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Iniciando teste de WhatsApp...');

    // 1. Verificar variáveis de ambiente
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const evolutionInstance = process.env.EVOLUTION_INSTANCE_NAME;

    console.log('🔧 [TEST] Variáveis:', {
      url: evolutionUrl,
      key: evolutionKey ? '***configured***' : 'NOT SET',
      instance: evolutionInstance
    });

    // 2. Buscar configurações do WhatsApp
    const settingsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://modelo-site-imob.vercel.app'}/api/admin/settings`);
    const settingsData = await settingsResponse.json();
    const whatsappNumber = settingsData.site?.contactWhatsapp;

    console.log('📱 [TEST] WhatsApp configurado:', whatsappNumber);

    // 3. Testar import do WhatsApp service
    let whatsappService;
    try {
      whatsappService = (await import('@/lib/whatsapp')).default;
      console.log('✅ [TEST] WhatsApp service importado com sucesso');
    } catch (importError) {
      console.error('❌ [TEST] Erro ao importar WhatsApp service:', importError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao importar WhatsApp service',
        details: importError instanceof Error ? importError.message : 'Erro desconhecido'
      });
    }

    // 4. Testar envio
    const testMessage = `🧪 TESTE DE WHATSAPP - Site Imobiliário

Esta é uma mensagem de teste enviada em: ${new Date().toLocaleString('pt-BR')}

Se você recebeu esta mensagem, o sistema está funcionando! ✅`;

    console.log('📤 [TEST] Enviando mensagem teste...');

    const result = await whatsappService.sendMessage({
      to: whatsappNumber || '5548998645864',
      text: testMessage,
      provider: 'auto'
    });

    console.log('📊 [TEST] Resultado:', result);

    return NextResponse.json({
      success: true,
      message: 'Teste de WhatsApp executado',
      config: {
        evolutionConfigured: !!(evolutionUrl && evolutionKey),
        whatsappNumber: whatsappNumber,
        instance: evolutionInstance
      },
      result: result
    });

  } catch (error) {
    console.error('💥 [TEST] Erro geral:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro no teste de WhatsApp',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}