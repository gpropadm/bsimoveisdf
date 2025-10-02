const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHouses() {
  try {
    const houses = await prisma.property.findMany({
      where: { category: 'casa' },
      select: {
        id: true,
        title: true,
        category: true,
        bedrooms: true,
        area: true,
        suites: true,
        bathrooms: true
      }
    });

    console.log('🏠 CASAS CADASTRADAS:', houses.length);
    houses.forEach(house => {
      console.log('\n📋', house.title);
      console.log('   Quartos:', house.bedrooms || 'não informado');
      console.log('   Área:', house.area || 'não informado', 'm²');
      console.log('   Suítes:', house.suites || 'não informado');
      console.log('   Banheiros:', house.bathrooms || 'não informado');
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHouses();
