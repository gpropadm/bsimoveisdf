const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCoordinates() {
  try {
    const testLat = new Prisma.Decimal('-15.845376982473867');
    const testLng = new Prisma.Decimal('-47.89250481541082');

    console.log('\n🎯 Testando coordenadas com precisão completa\n');
    console.log('Valores originais:');
    console.log('Latitude:', testLat.toString());
    console.log('Longitude:', testLng.toString());
    console.log('');

    const property = await prisma.property.findFirst();

    if (!property) {
      console.log('❌ Nenhum imóvel encontrado');
      return;
    }

    console.log(`Atualizando imóvel: ${property.title}`);

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        latitude: testLat,
        longitude: testLng
      }
    });

    console.log('\n✅ Valores salvos no banco:');
    console.log('Latitude:', updated.latitude.toString());
    console.log('Longitude:', updated.longitude.toString());

    const latMatch = testLat.toString() === updated.latitude.toString();
    const lngMatch = testLng.toString() === updated.longitude.toString();

    console.log('\n📊 Resultado:');
    console.log('Latitude:', latMatch ? '✅ PERFEITO' : '⚠️ PERDA DE PRECISÃO');
    console.log('Longitude:', lngMatch ? '✅ PERFEITO' : '⚠️ PERDA DE PRECISÃO');

    if (latMatch && lngMatch) {
      console.log('\n🎉 SUCESSO! Coordenadas salvas com precisão total!\n');
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 Dica: Reinicie o servidor Next.js para limpar o cache do PostgreSQL\n');
  } finally {
    await prisma.$disconnect();
  }
}

testCoordinates();