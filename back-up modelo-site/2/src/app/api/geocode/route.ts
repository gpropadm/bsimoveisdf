import { NextRequest, NextResponse } from 'next/server';
import { geocodeCEPWithCache, isValidBrazilianCoordinates } from '@/lib/geocoding';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { cep, propertyId } = await request.json();

    if (!cep) {
      return NextResponse.json({
        success: false,
        error: 'CEP é obrigatório'
      }, { status: 400 });
    }

    console.log(`🔍 Iniciando geocodificação para CEP: ${cep}`);

    // Fazer geocodificação
    const result = await geocodeCEPWithCache(cep);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível encontrar as coordenadas para este CEP'
      }, { status: 404 });
    }

    // Validar se as coordenadas são do Brasil
    if (!isValidBrazilianCoordinates(result.coordinates.latitude, result.coordinates.longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Coordenadas fora do território brasileiro'
      }, { status: 400 });
    }

    // Se foi fornecido um propertyId, atualizar o imóvel no banco
    if (propertyId) {
      try {
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            latitude: result.coordinates.latitude,
            longitude: result.coordinates.longitude,
            gpsAccuracy: 100, // Precisão estimada em metros para geocodificação por CEP
            cep: result.address.cep,
            // Atualizar também o endereço se necessário
            address: result.address.logradouro ?
              `${result.address.logradouro}, ${result.address.bairro}` :
              undefined,
            city: result.address.localidade,
            state: result.address.uf
          }
        });

        console.log(`✅ Coordenadas atualizadas para o imóvel ${propertyId}`);
      } catch (dbError) {
        console.error('Erro ao atualizar imóvel:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Erro ao atualizar as coordenadas no banco de dados'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        coordinates: {
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude
        },
        address: result.address,
        source: 'geocoding'
      }
    });

  } catch (error) {
    console.error('Erro na API de geocodificação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Endpoint para geocodificar múltiplos imóveis sem coordenadas
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Iniciando geocodificação em lote...');

    // Buscar imóveis sem coordenadas mas com CEP
    const propertiesWithoutCoords = await prisma.property.findMany({
      where: {
        AND: [
          { cep: { not: null } },
          { cep: { not: '' } },
          {
            OR: [
              { latitude: null },
              { longitude: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        cep: true,
        city: true,
        state: true
      }
    });

    if (propertiesWithoutCoords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum imóvel encontrado para geocodificar',
        processed: 0
      });
    }

    console.log(`📍 Encontrados ${propertiesWithoutCoords.length} imóveis para geocodificar`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Processar cada imóvel (com delay para não sobrecarregar as APIs)
    for (const property of propertiesWithoutCoords) {
      try {
        console.log(`🔍 Geocodificando: ${property.title} - CEP: ${property.cep}`);

        const result = await geocodeCEPWithCache(property.cep!);

        if (result && isValidBrazilianCoordinates(result.coordinates.latitude, result.coordinates.longitude)) {
          await prisma.property.update({
            where: { id: property.id },
            data: {
              latitude: result.coordinates.latitude,
              longitude: result.coordinates.longitude,
              gpsAccuracy: 100
            }
          });

          results.success++;
          console.log(`✅ ${property.title} geocodificado com sucesso`);
        } else {
          results.failed++;
          results.errors.push(`${property.title}: Coordenadas não encontradas`);
          console.log(`❌ ${property.title}: Falha na geocodificação`);
        }

        // Delay de 1 segundo entre requests para ser respeitoso com as APIs
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.failed++;
        results.errors.push(`${property.title}: ${error}`);
        console.error(`❌ Erro ao geocodificar ${property.title}:`, error);
      }
    }

    console.log(`🎉 Geocodificação concluída: ${results.success} sucessos, ${results.failed} falhas`);

    return NextResponse.json({
      success: true,
      message: `Geocodificação concluída`,
      processed: propertiesWithoutCoords.length,
      results
    });

  } catch (error) {
    console.error('Erro na geocodificação em lote:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}