import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const evolutionUrl = 'https://evolution-api.onrender.com';
    const evolutionKey = 'B6D711FCDE4D4FD5936544120E713976';
    const instanceName = 'site-imobiliaria-' + Date.now(); // Nome único

    console.log('🔧 Criando instância Evolution para site imobiliário...');
    console.log('Instance:', instanceName);

    // Criar nova instância
    const createResponse = await fetch(`${evolutionUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': evolutionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });

    const createResult = await createResponse.json();

    if (!createResponse.ok) {
      console.error('Erro ao criar instância:', createResult);
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar instância Evolution',
        details: createResult
      });
    }

    console.log('✅ Instância criada:', createResult);

    // Aguardar um pouco e obter QR Code
    await new Promise(resolve => setTimeout(resolve, 2000));

    const qrResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
      headers: {
        'apikey': evolutionKey,
      }
    });

    const qrResult = await qrResponse.json();

    return NextResponse.json({
      success: true,
      instance: {
        name: instanceName,
        url: evolutionUrl,
        key: evolutionKey
      },
      qrCode: qrResult.code || createResult.qrcode?.code,
      message: 'Instância criada! Escaneie o QR Code com seu WhatsApp',
      nextSteps: [
        '1. Escaneie o QR Code com WhatsApp',
        '2. Atualize as variáveis de ambiente na Vercel',
        '3. Teste o sistema'
      ]
    });

  } catch (error) {
    console.error('Erro ao configurar Evolution:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}