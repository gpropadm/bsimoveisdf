const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Coordenadas aproximadas baseadas nos endereços das propriedades
const coordinatesData = [
  {
    title: "Apartamento Luxo Vista Mar Copacabana",
    latitude: -22.9711,
    longitude: -43.1822
  },
  {
    title: "Penthouse Itaim Bibi São Paulo",
    latitude: -23.5737,
    longitude: -46.6776
  },
  {
    title: "Apartamento Moderno Barra da Tijuca",
    latitude: -23.0045,
    longitude: -43.3186
  },
  {
    title: "Casa de Condomínio Alphaville Residencial",
    latitude: -23.5133,
    longitude: -46.8569
  },
  {
    title: "Mansão Colonial Petrópolis",
    latitude: -22.5058,
    longitude: -43.1792
  }
];

async function addCoordinates() {
  try {
    console.log('🗺️ Adicionando coordenadas GPS às propriedades...\n');

    for (const coord of coordinatesData) {
      const property = await prisma.property.findFirst({
        where: {
          title: coord.title
        }
      });

      if (property) {
        await prisma.property.update({
          where: {
            id: property.id
          },
          data: {
            latitude: coord.latitude,
            longitude: coord.longitude,
            gpsAccuracy: 50.0 // 50 metros de precisão
          }
        });

        console.log(`✅ ${coord.title}`);
        console.log(`   📍 Coords: ${coord.latitude}, ${coord.longitude}\n`);
      } else {
        console.log(`❌ Propriedade não encontrada: ${coord.title}\n`);
      }
    }

    // Verificar resultado
    const propertiesWithCoords = await prisma.property.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } }
        ]
      }
    });

    console.log(`🎉 Concluído! ${propertiesWithCoords} propriedades agora têm coordenadas GPS.`);

  } catch (error) {
    console.error('❌ Erro ao adicionar coordenadas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCoordinates();