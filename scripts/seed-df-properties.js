const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Coordenadas precisas do Distrito Federal
const dfLocations = {
  'Asa Norte': {
    coordinates: { lat: -15.7801, lng: -47.8825 },
    ceps: ['70710-100', '70720-200', '70730-300', '70740-400', '70750-500'],
    addresses: [
      'SQN 102 Bloco A',
      'SQN 204 Bloco B',
      'SQN 306 Bloco C',
      'SQN 408 Bloco D',
      'SQN 110 Bloco E'
    ]
  },
  'Asa Sul': {
    coordinates: { lat: -15.8267, lng: -47.9218 },
    ceps: ['70300-100', '70310-200', '70320-300', '70330-400', '70340-500'],
    addresses: [
      'SQS 103 Bloco A',
      'SQS 205 Bloco B',
      'SQS 307 Bloco C',
      'SQS 409 Bloco D',
      'SQS 111 Bloco E'
    ]
  },
  'Águas Claras': {
    coordinates: { lat: -15.8267, lng: -48.0264 },
    ceps: ['71900-100', '71910-200', '71920-300', '71930-400', '71940-500'],
    addresses: [
      'Rua das Pitangueiras, Lote 15',
      'Avenida das Araucárias, 1200',
      'Rua dos Eucaliptos, 800',
      'Avenida Pau Brasil, 450',
      'Rua das Palmeiras, 300'
    ]
  },
  'Taguatinga': {
    coordinates: { lat: -15.8328, lng: -48.0572 },
    ceps: ['72010-100', '72020-200', '72030-300', '72040-400'],
    addresses: [
      'QNM 15 Lote 20',
      'QNG 25 Casa 15',
      'QNH 10 Lote 8',
      'QNJ 30 Casa 25'
    ]
  },
  'Ceilândia': {
    coordinates: { lat: -15.8178, lng: -48.1072 },
    ceps: ['72220-100', '72230-200', '72240-300', '72250-400'],
    addresses: [
      'QNM 12 Casa 45',
      'QNN 18 Lote 30',
      'QNO 22 Casa 12',
      'QNP 08 Lote 50'
    ]
  },
  'Sobradinho': {
    coordinates: { lat: -15.6542, lng: -47.7867 },
    ceps: ['73010-100', '73020-200', '73030-300', '73040-400'],
    addresses: [
      'Quadra 15 Casa 20',
      'Quadra 25 Casa 35',
      'Quadra 18 Casa 12',
      'Quadra 30 Casa 8'
    ]
  }
}

// Fotos de apartamentos - 25 imagens profissionais
const apartmentImages = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1560449752-41549b973c32?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615529328191-8d4dd5508803?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800'
]

// Fotos de casas - 25 imagens profissionais
const houseImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1605276373954-0c4a0dac5cc0?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600563438938-a42d5a2ccb92?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600566753051-4b1b2c3b4c73?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800'
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomImages(imageArray, count = 25) {
  // Usar todas as imagens disponíveis para cada imóvel (mínimo 20)
  const shuffled = [...imageArray].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateVariation(baseCoord, maxVariation = 0.01) {
  return baseCoord + (Math.random() - 0.5) * maxVariation
}

async function seedDFProperties() {
  try {
    console.log('🧹 Limpando banco de dados (exceto usuários)...')

    // Limpar tabelas em ordem para respeitar foreign keys
    await prisma.whatsAppMessage.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.lead.deleteMany({})
    await prisma.property.deleteMany({})
    await prisma.propertySubmission.deleteMany({})
    await prisma.propertyRequest.deleteMany({})
    await prisma.contactMessage.deleteMany({})

    console.log('✅ Banco de dados limpo!')
    console.log('🏢 Cadastrando novos imóveis no Distrito Federal...')

    const properties = []

    // 10 imóveis variados no DF
    const dfProperties = [
      {
        title: 'Casa Moderna em Águas Claras',
        city: 'Águas Claras',
        category: 'casa',
        price: 1250000,
        bedrooms: 4,
        bathrooms: 4,
        parking: 3,
        area: 320,
        description: 'Lindíssima casa moderna em condomínio fechado. Área gourmet completa, piscina aquecida e vista panorâmica.'
      },
      {
        title: 'Apartamento de Luxo no Sudoeste',
        city: 'Asa Sul', // Usar coordenadas da Asa Sul
        displayCity: 'Sudoeste',
        category: 'apartamento',
        price: 890000,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        area: 145,
        description: 'Apartamento sofisticado com vista do Parque da Cidade. Móveis planejados e automação completa.'
      },
      {
        title: 'Casa Térrea em Vicente Pires',
        city: 'Águas Claras', // Vicente Pires próximo a Águas Claras
        displayCity: 'Vicente Pires',
        category: 'casa',
        price: 780000,
        bedrooms: 5,
        bathrooms: 3,
        parking: 4,
        area: 280,
        description: 'Casa ampla em terreno de 800m². Área de lazer completa com piscina e churrasqueira.'
      },
      {
        title: 'Apartamento Novo em Taguatinga',
        city: 'Taguatinga',
        category: 'apartamento',
        price: 420000,
        bedrooms: 2,
        bathrooms: 2,
        parking: 1,
        area: 65,
        description: 'Apartamento zero próximo ao metrô. Acabamentos modernos e cozinha americana.'
      },
      {
        title: 'Casa em Condomínio - Sobradinho',
        city: 'Sobradinho',
        category: 'casa',
        price: 650000,
        bedrooms: 3,
        bathrooms: 3,
        parking: 2,
        area: 180,
        description: 'Linda casa em condomínio fechado. Arquitetura colonial com varanda e jardim.'
      },
      {
        title: 'Cobertura Duplex no Guará',
        city: 'Taguatinga', // Guará próximo a Taguatinga
        displayCity: 'Guará',
        category: 'apartamento',
        price: 750000,
        bedrooms: 3,
        bathrooms: 4,
        parking: 2,
        area: 220,
        description: 'Cobertura exclusiva com terraço gourmet. Vista 360° e acabamentos importados.'
      },
      {
        title: 'Casa de Alto Padrão - Brasília',
        city: 'Asa Norte',
        displayCity: 'Brasília',
        category: 'casa',
        price: 1850000,
        bedrooms: 5,
        bathrooms: 6,
        parking: 4,
        area: 450,
        description: 'Casa de alto padrão com projeto arquitetônico assinado. Piscina com raia e spa.'
      },
      {
        title: 'Apartamento Moderno em Ceilândia',
        city: 'Ceilândia',
        category: 'apartamento',
        price: 295000,
        bedrooms: 3,
        bathrooms: 2,
        parking: 1,
        area: 75,
        description: 'Apartamento funcional com cozinha planejada. Condomínio novo com quadra.'
      },
      {
        title: 'Casa com Piscina em Planaltina',
        city: 'Sobradinho', // Planaltina próximo a Sobradinho
        displayCity: 'Planaltina',
        category: 'casa',
        price: 380000,
        bedrooms: 4,
        bathrooms: 3,
        parking: 3,
        area: 200,
        description: 'Casa espaçosa com piscina. Horta orgânica, pomar e energia solar.'
      },
      {
        title: 'Penthouse no Lago Sul',
        city: 'Asa Sul', // Lago Sul próximo à Asa Sul
        displayCity: 'Lago Sul',
        category: 'apartamento',
        price: 3200000,
        bedrooms: 4,
        bathrooms: 5,
        parking: 3,
        area: 380,
        description: 'Penthouse única com vista do Lago Paranoá. Piscina infinita e cinema particular.'
      }
    ]

    for (let i = 0; i < dfProperties.length; i++) {
      const propData = dfProperties[i]
      const location = dfLocations[propData.city]
      const images = getRandomImages(propData.category === 'casa' ? houseImages : apartmentImages)
      const displayCity = propData.displayCity || propData.city

      properties.push({
        title: propData.title,
        slug: `${propData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${i + 1}`,
        description: propData.description,
        price: propData.price,
        type: 'venda', // Todos para venda conforme solicitado
        category: propData.category,
        address: getRandomElement(location.addresses),
        city: displayCity,
        state: 'DF',
        cep: getRandomElement(location.ceps),
        bedrooms: propData.bedrooms,
        bathrooms: propData.bathrooms,
        parking: propData.parking,
        area: propData.area,
        latitude: generateVariation(location.coordinates.lat),
        longitude: generateVariation(location.coordinates.lng),
        gpsAccuracy: 50,
        images: JSON.stringify(images),
        featured: i < 5, // Primeiros 5 como destaque
        status: 'disponivel',
        condoFee: propData.category === 'apartamento' ? Math.floor(Math.random() * 800) + 200 : 0
      })
    }

    // Inserir todos os imóveis
    console.log(`📝 Inserindo ${properties.length} imóveis...`)

    const createdProperties = []
    for (const property of properties) {
      const created = await prisma.property.create({
        data: property
      })
      createdProperties.push(created)
      console.log(`✅ ${property.title} cadastrado - 25 fotos`)
    }

    // Criar leads de exemplo para testar funcionalidades IA
    console.log('👥 Criando leads de exemplo...')
    const leadNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Pereira']

    for (let i = 0; i < 5; i++) {
      const property = createdProperties[i]
      await prisma.lead.create({
        data: {
          name: leadNames[i],
          email: `${leadNames[i].toLowerCase().replace(' ', '.')}@email.com`,
          phone: `(61) 9999${1000 + i}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          message: `Tenho interesse no imóvel ${property.title}. Gostaria de mais informações e agendar visita.`,
          propertyId: property.id,
          propertyTitle: property.title,
          propertyPrice: property.price,
          propertyType: property.type,
          source: ['site', 'whatsapp', 'facebook', 'telefone'][i % 4],
          status: ['novo', 'contatado', 'interessado'][i % 3],
          preferredPriceMin: property.price * 0.8,
          preferredPriceMax: property.price * 1.2,
          preferredCategory: property.category,
          preferredCity: property.city,
          preferredState: property.state,
          preferredBedrooms: property.bedrooms,
          preferredType: property.type,
          enableMatching: true
        }
      })
      console.log(`✅ Lead ${leadNames[i]} criado`)
    }

    console.log('🎉 Processo concluído com sucesso!')
    console.log(`📊 Total: ${properties.length} imóveis do DF`)
    console.log('📍 Cidades: Águas Claras, Sudoeste, Vicente Pires, Taguatinga, Sobradinho, Guará, Brasília, Ceilândia, Planaltina, Lago Sul')
    console.log('👥 5 leads de exemplo criados')
    console.log('🖼️ Cada imóvel possui 25 fotos profissionais')
    console.log('🚀 Recursos IA prontos para testar!')

  } catch (error) {
    console.error('❌ Erro ao cadastrar imóveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDFProperties()