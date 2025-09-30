const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const newProperties = [
  // LANÇAMENTOS
  {
    title: "Residencial Vista Bela - Apartamentos de 2 e 3 dormitórios",
    slug: "residencial-vista-bela-lancamento",
    description: "Novo empreendimento com apartamentos modernos, área de lazer completa e localização privilegiada no centro da cidade. Entrega prevista para dezembro de 2025.",
    price: 380000,
    type: "lancamento",
    category: "apartamento",
    address: "Rua das Palmeiras, 450",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    area: 65,
    featured: true,
    latitude: -27.5969,
    longitude: -48.5495,
    condoFee: 450,
    floor: 5,
    amenities: JSON.stringify(["Piscina", "Academia", "Salão de festas", "Playground"])
  },
  {
    title: "Condomínio Jardim das Flores - Casas em condomínio fechado",
    slug: "condominio-jardim-das-flores-lancamento",
    description: "Casas em condomínio fechado com 3 dormitórios, quintal privativo e área de lazer exclusiva. Entrega em 18 meses.",
    price: 620000,
    type: "lancamento",
    category: "casa",
    address: "Estrada Geral do Ingleses, 2500",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: 120,
    featured: true,
    latitude: -27.4208,
    longitude: -48.3975,
    houseType: "condomínio",
    yard: true,
    garage: "coberta"
  },

  // EMPREENDIMENTOS
  {
    title: "Shopping Center Beira Mar - Salas comerciais",
    slug: "shopping-center-beira-mar-empreendimento",
    description: "Empreendimento comercial de alto padrão na Beira Mar. Salas comerciais de 40m² a 200m² com infraestrutura completa.",
    price: 280000,
    type: "empreendimento",
    category: "comercial",
    address: "Avenida Beira Mar Norte, 1200",
    city: "Florianópolis",
    state: "SC",
    area: 45,
    featured: true,
    latitude: -27.5915,
    longitude: -48.5615,
    commercialType: "sala",
    floor_commercial: 3,
    businessCenter: "Shopping Center Beira Mar"
  },
  {
    title: "Condomínio Empresarial Tech Park",
    slug: "condominio-empresarial-tech-park",
    description: "Empreendimento empresarial com salas modernas, auditório, coworking e estacionamento amplo. Ideal para empresas de tecnologia.",
    price: 450000,
    type: "empreendimento",
    category: "comercial",
    address: "Rod. Admar Gonzaga, 1500",
    city: "Florianópolis",
    state: "SC",
    area: 80,
    latitude: -27.6727,
    longitude: -48.5066,
    commercialType: "sala",
    businessCenter: "Tech Park Floripa"
  },

  // COBERTURAS
  {
    title: "Cobertura Duplex com Vista Mar - 4 suítes",
    slug: "cobertura-duplex-vista-mar-4-suites",
    description: "Magnífica cobertura duplex com 4 suítes, terraço gourmet e vista panorâmica para o mar. Acabamento de luxo e localização nobre.",
    price: 1800000,
    type: "venda",
    category: "cobertura",
    address: "Avenida Atlântica, 800",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    area: 280,
    featured: true,
    latitude: -27.5707,
    longitude: -48.5664,
    floor: 18,
    condoFee: 1200,
    amenities: JSON.stringify(["Piscina infinity", "Academia", "Spa", "Heliponto", "Concierge"])
  },
  {
    title: "Cobertura Linear com Piscina Privativa",
    slug: "cobertura-linear-piscina-privativa",
    description: "Cobertura linear de 200m² com piscina privativa, churrasqueira gourmet e vista deslumbrante da cidade.",
    price: 950000,
    type: "venda",
    category: "cobertura",
    address: "Rua Bocaiúva, 550",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    area: 200,
    latitude: -27.5954,
    longitude: -48.5480,
    floor: 15,
    condoFee: 800
  },

  // KITNETS
  {
    title: "Kitnet Mobiliada Próxima UFSC",
    slug: "kitnet-mobiliada-proxima-ufsc",
    description: "Kitnet completamente mobiliada a 5 minutos da UFSC. Ideal para estudantes. Inclui móveis, eletrodomésticos e internet.",
    price: 1200,
    type: "aluguel",
    category: "kitnet",
    address: "Rua Engenheiro Agronômico Andrei Cristian Ferreira, 85",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    latitude: -27.6011,
    longitude: -48.5190
  },
  {
    title: "Kitnet Studio Centro da Cidade",
    slug: "kitnet-studio-centro-cidade",
    description: "Studio moderno no centro de Florianópolis. Ambiente integrado, varanda e infraestrutura completa do edifício.",
    price: 180000,
    type: "venda",
    category: "kitnet",
    address: "Rua Felipe Schmidt, 240",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 1,
    bathrooms: 1,
    area: 32,
    latitude: -27.5969,
    longitude: -48.5495,
    condoFee: 280
  },

  // LOFTS
  {
    title: "Loft Industrial Reformado - Conceito Aberto",
    slug: "loft-industrial-reformado-conceito-aberto",
    description: "Loft único com conceito industrial, pé-direito duplo, mezanino e acabamentos diferenciados. Ambiente criativo e moderno.",
    price: 650000,
    type: "venda",
    category: "loft",
    address: "Rua Conselheiro Mafra, 180",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 1,
    bathrooms: 2,
    parking: 1,
    area: 95,
    featured: true,
    latitude: -27.5984,
    longitude: -48.5509
  },
  {
    title: "Loft Artístico com Ateliê - Lagoa da Conceição",
    slug: "loft-artistico-atelie-lagoa-conceicao",
    description: "Loft diferenciado com espaço para ateliê, grande janela com vista para a lagoa e ambiente inspirador para artistas.",
    price: 480000,
    type: "venda",
    category: "loft",
    address: "Rua das Rendeiras, 95",
    city: "Florianópolis",
    state: "SC",
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    area: 75,
    latitude: -27.6109,
    longitude: -48.4776
  },

  // PROPRIEDADES RURAIS
  {
    title: "Fazenda Produtiva - 50 Hectares com Gado",
    slug: "fazenda-produtiva-50-hectares-gado",
    description: "Fazenda em plena produção com 50 hectares, casa sede, currais, açude e rebanho bovino. Excelente oportunidade de investimento.",
    price: 2500000,
    type: "venda",
    category: "rural",
    address: "Interior de São Pedro de Alcântara",
    city: "São Pedro de Alcântara",
    state: "SC",
    bedrooms: 4,
    bathrooms: 2,
    area: 200,
    totalArea: 500000, // 50 hectares em m²
    pastures: 400000,
    cultivatedArea: 80000,
    areaUnit: "hectares",
    buildings: JSON.stringify(["Casa sede", "Curral", "Galpão", "Casa do caseiro"]),
    waterSources: "Açude e nascente natural",
    latitude: -27.7833,
    longitude: -48.8167
  },

  // TERRENOS ESPECIAIS
  {
    title: "Terreno Comercial na BR-101",
    slug: "terreno-comercial-br-101",
    description: "Terreno comercial estratégico às margens da BR-101. Ideal para posto de combustível, restaurante ou comércio em geral.",
    price: 850000,
    type: "venda",
    category: "terreno",
    address: "BR-101, Km 210",
    city: "Palhoça",
    state: "SC",
    area: 3000,
    zoning: "comercial",
    slope: "plano",
    frontage: 45,
    latitude: -27.7833,
    longitude: -48.7000
  }
]

async function seedNewProperties() {
  console.log('🚀 Iniciando cadastro de novos imóveis...')

  try {
    for (const property of newProperties) {
      console.log(`📝 Cadastrando: ${property.title}`)

      await prisma.property.create({
        data: property
      })

      console.log(`✅ ${property.title} cadastrado com sucesso!`)
    }

    console.log('🎉 Todos os imóveis foram cadastrados com sucesso!')
    console.log(`📊 Total: ${newProperties.length} novos imóveis`)

    // Mostrar resumo por tipo e categoria
    const summary = {}
    newProperties.forEach(prop => {
      const key = `${prop.type} - ${prop.category}`
      summary[key] = (summary[key] || 0) + 1
    })

    console.log('\n📈 Resumo:')
    Object.entries(summary).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} imóvel(s)`)
    })

  } catch (error) {
    console.error('❌ Erro ao cadastrar imóveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
seedNewProperties()