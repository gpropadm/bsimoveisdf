import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api.onrender.com';
    const evolutionKey = process.env.EVOLUTION_API_KEY || 'B6D711FCDE4D4FD5936544120E713976';
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'site-imobiliaria';

    console.log('🔍 Verificando status da instância:', instanceName);

    // Primeiro verificar se instância existe
    const statusResponse = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
      headers: {
        'apikey': evolutionKey,
      }
    });

    if (!statusResponse.ok) {
      console.log('❌ Instância não existe, criando nova...');

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
        return NextResponse.json({
          success: false,
          error: 'Erro ao criar instância',
          details: createResult
        });
      }

      return NextResponse.json({
        success: true,
        qrCode: createResult.qrcode?.code,
        instance: instanceName,
        status: 'nova_instancia_criada',
        message: 'Nova instância criada! Escaneie o QR Code com seu WhatsApp.'
      });
    }

    // Se instância existe, verificar status
    const statusResult = await statusResponse.json();
    console.log('📱 Status atual:', statusResult);

    if (statusResult.instance?.status === 'open') {
      return NextResponse.json({
        success: true,
        status: 'conectado',
        message: 'WhatsApp já está conectado e funcionando! ✅',
        instance: instanceName
      });
    }

    // Se não está conectado, obter QR Code
    console.log('📱 Obtendo QR Code...');
    const qrResponse = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
      headers: {
        'apikey': evolutionKey,
      }
    });

    const qrResult = await qrResponse.json();

    return NextResponse.json({
      success: true,
      qrCode: qrResult.code,
      instance: instanceName,
      status: 'aguardando_conexao',
      message: 'Escaneie o QR Code com seu WhatsApp para conectar!'
    });

  } catch (error) {
    console.error('Erro ao obter QR Code:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}