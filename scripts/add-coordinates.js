const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Coordenadas de exemplo para diferentes cidades
const cityCoordinates = {
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Salvador': { lat: -12.9714, lng: -38.5014 },
  'Brasília': { lat: -15.8267, lng: -47.9218 },
  'Fortaleza': { lat: -3.7319, lng: -38.5267 },
  'Curitiba': { lat: -25.4284, lng: -49.2733 },
  'Recife': { lat: -8.0476, lng: -34.8770 },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
  'Goiânia': { lat: -16.6869, lng: -49.2648 }
}

async function addCoordinatesToProperties() {
  try {
    console.log('🔍 Buscando imóveis sem coordenadas...')

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        city: true,
        address: true
      }
    })

    console.log(`📍 Encontrados ${properties.length} imóveis sem coordenadas`)

    for (const property of properties) {
      let latitude = null
      let longitude = null

      // Verificar se a cidade tem coordenadas pré-definidas
      const cityName = property.city
      if (cityName && cityCoordinates[cityName]) {
        const baseCoords = cityCoordinates[cityName]

        // Adicionar variação aleatória para simular endereços diferentes
        latitude = baseCoords.lat + (Math.random() - 0.5) * 0.1  // ~5km de variação
        longitude = baseCoords.lng + (Math.random() - 0.5) * 0.1
      } else {
        // Coordenadas padrão para São Paulo com variação
        latitude = -23.5505 + (Math.random() - 0.5) * 0.2
        longitude = -46.6333 + (Math.random() - 0.5) * 0.2
      }

      // Atualizar o imóvel com as coordenadas
      await prisma.property.update({
        where: { id: property.id },
        data: {
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          gpsAccuracy: 100 // 100 metros de precisão
        }
      })

      console.log(`✅ Imóvel ID ${property.id} em ${property.city} atualizado`)
    }

    console.log('🎉 Todas as coordenadas foram adicionadas com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao adicionar coordenadas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCoordinatesToProperties()