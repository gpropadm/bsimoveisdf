const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMapCoordinates() {
  try {
    console.log('\n🗺️ Testando coordenadas para exibição no mapa\n');

    const testLat = new Prisma.Decimal('-15.845376982473867');
    const testLng = new Prisma.Decimal('-47.89250481541082');

    const property = await prisma.property.findFirst();

    if (!property) {
      console.log('❌ Nenhum imóvel encontrado');
      return;
    }

    console.log(`📍 Atualizando coordenadas do imóvel: ${property.title}`);
    console.log(`Latitude: ${testLat}`);
    console.log(`Longitude: ${testLng}\n`);

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        latitude: testLat,
        longitude: testLng
      }
    });

    console.log('✅ Coordenadas salvas no banco:');
    console.log(`Latitude: ${updated.latitude}`);
    console.log(`Longitude: ${updated.longitude}\n`);

    // Testar conversão para número (como a API faz)
    const latNumber = Number(updated.latitude);
    const lngNumber = Number(updated.longitude);

    console.log('🔢 Valores convertidos para número (como a API retorna):');
    console.log(`Latitude: ${latNumber}`);
    console.log(`Longitude: ${lngNumber}\n`);

    console.log('📊 Validação:');
    console.log(`✅ Latitude é número válido: ${!isNaN(latNumber)}`);
    console.log(`✅ Longitude é número válido: ${!isNaN(lngNumber)}`);
    console.log(`✅ Latitude preserva precisão: ${latNumber.toString().length >= 17}`);
    console.log(`✅ Longitude preserva precisão: ${lngNumber.toString().length >= 17}\n`);

    console.log('🎉 Coordenadas configuradas com sucesso!');
    console.log('💡 Agora reinicie o servidor Next.js para limpar o cache\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMapCoordinates();