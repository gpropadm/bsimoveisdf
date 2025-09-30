const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProperties() {
  try {
    console.log('🔍 Verificando propriedades no banco...\n');

    const totalProperties = await prisma.property.count();
    console.log(`📊 Total de propriedades: ${totalProperties}`);

    const propertiesWithCoords = await prisma.property.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });
    console.log(`🗺️ Propriedades com coordenadas: ${propertiesWithCoords}`);

    const propertiesWithoutCoords = await prisma.property.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    console.log(`❌ Propriedades sem coordenadas: ${propertiesWithoutCoords}\n`);

    // Mostrar algumas propriedades para análise
    const sampleProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        latitude: true,
        longitude: true,
        type: true,
        price: true
      },
      take: 5
    });

    console.log('📋 Amostra de propriedades:');
    sampleProperties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   📍 ${prop.address}, ${prop.city}`);
      console.log(`   🗺️ Coords: ${prop.latitude ? `${prop.latitude}, ${prop.longitude}` : 'Não definidas'}`);
      console.log(`   💰 ${prop.type}: R$ ${prop.price.toLocaleString('pt-BR')}\n`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar propriedades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProperties();