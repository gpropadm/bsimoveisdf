import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// URLs de imagens do Unsplash para diferentes tipos de imóveis
const apartmentImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
]

const houseImages = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
]

const farmImages = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1626178793926-22b28830aa30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
]

async function main() {
  // Limpar dados existentes
  await prisma.property.deleteMany({})

  const properties = [
    // APARTAMENTOS
    {
      title: 'Apartamento Luxo Vista Mar Copacabana',
      description: 'Magnífico apartamento com vista deslumbrante para o mar de Copacabana. Completamente reformado com acabamentos de primeira linha, piso em mármore, cozinha gourmet integrada e varanda ampla. Localizado em uma das quadras mais nobres do bairro.',
      price: 2800000,
      type: 'venda',
      category: 'apartamento',
      address: 'Avenida Atlântica, 1500',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      area: 180,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(apartmentImages.slice(0, 12))
    },
    {
      title: 'Penthouse Itaim Bibi São Paulo',
      description: 'Cobertura duplex no coração do Itaim Bibi com terraço gourmet de 100m². Projeto arquitetônico exclusivo, sistema de automação completo, piscina privativa e vista 360° da cidade. Prédio com portaria 24h e lazer completo.',
      price: 4500000,
      type: 'venda',
      category: 'apartamento',
      address: 'Rua Pedroso Alvarenga, 800',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      area: 320,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(apartmentImages)
    },
    {
      title: 'Apartamento Moderno Barra da Tijuca',
      description: 'Apartamento em condomínio resort com infraestrutura completa. Vista para a lagoa, 3 suítes, varanda gourmet, dependência completa. Condomínio com piscinas, quadras, spa, kids club e segurança 24h.',
      price: 12000,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Avenida das Américas, 3500',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      area: 150,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify(apartmentImages.slice(1, 11))
    },

    // CASAS
    {
      title: 'Casa de Condomínio Alphaville Residencial',
      description: 'Casa térrea em condomínio fechado de alto padrão. Projeto contemporâneo com 4 suítes, escritório, sala de cinema, cozinha gourmet, área de lazer completa com piscina, churrasqueira e forno de pizza. Jardim paisagístico de 800m².',
      price: 3200000,
      type: 'venda',
      category: 'casa',
      address: 'Alameda das Tipuanas, 150',
      city: 'Barueri',
      state: 'SP',
      bedrooms: 4,
      bathrooms: 5,
      parking: 4,
      area: 450,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(houseImages)
    },
    {
      title: 'Mansão Colonial Petrópolis',
      description: 'Majestosa casa colonial preservada no centro histórico de Petrópolis. Arquitetura original do século XIX restaurada com tecnologia moderna. 6 suítes, biblioteca, adega climatizada, jardins centenários. Ideal para eventos e turismo de luxo.',
      price: 5800000,
      type: 'venda',
      category: 'casa',
      address: 'Rua do Imperador, 890',
      city: 'Petrópolis',
      state: 'RJ',
      bedrooms: 6,
      bathrooms: 7,
      parking: 6,
      area: 680,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(houseImages.slice(0, 10))
    },
    {
      title: 'Casa Moderna Condomínio Quinta da Baroneza',
      description: 'Casa contemporânea com arquitetura arrojada. Planta aberta integrada, pé direito duplo, painéis de vidro, deck em madeira. Área gourmet com vista para o vale, piscina infinity, sistema de energia solar.',
      price: 25000,
      type: 'aluguel',
      category: 'casa',
      address: 'Estrada da Baroneza, 2500',
      city: 'Bragança Paulista',
      state: 'SP',
      bedrooms: 5,
      bathrooms: 4,
      parking: 4,
      area: 380,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify(houseImages.slice(2, 12))
    },

    // FAZENDAS
    {
      title: 'Fazenda Produtiva Vale do Paraíba',
      description: 'Fazenda de 850 hectares com excelente infraestrutura para pecuária e agricultura. Casa sede colonial restaurada, 3 casas de funcionários, curral moderno, estábulos, tulha, poços artesianos. Pastagens formadas, 180 cabeças de gado nelore. Potencial para agroturismo.',
      price: 8500000,
      type: 'venda',
      category: 'fazenda',
      address: 'Estrada Municipal do Sapé, Km 15',
      city: 'Queluz',
      state: 'SP',
      bedrooms: 8,
      bathrooms: 6,
      parking: 10,
      area: 8500000, // 850 hectares em m²
      totalArea: 850.0,
      cultivatedArea: 600.0,
      pastures: 450.0,
      areaUnit: 'hectares',
      buildings: JSON.stringify(['Casa sede', 'Curral moderno', 'Estábulos', '3 casas funcionários', 'Tulha', 'Oficina']),
      waterSources: 'Rio perene + 3 poços artesianos',
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(farmImages)
    },
    {
      title: 'Haras Completo Interior de Minas',
      description: 'Propriedade rural de 320 hectares especializada em criação de cavalos. Infraestrutura completa com picadeiro coberto, pistas de treinamento, baias individuais, veterinário, casa de caseiro. Casa principal de 500m² com vista panorâmica das montanhas.',
      price: 4200000,
      type: 'venda',
      category: 'fazenda',
      address: 'Fazenda Santa Helena, Estrada Real',
      city: 'Tiradentes',
      state: 'MG',
      bedrooms: 6,
      bathrooms: 4,
      parking: 8,
      area: 3200000, // 320 hectares
      totalArea: 320.0,
      cultivatedArea: 80.0,
      pastures: 280.0,
      areaUnit: 'hectares',
      buildings: JSON.stringify(['Casa sede', 'Picadeiro coberto', 'Estábulos', 'Veterinário', 'Casa caseiro']),
      waterSources: 'Córrego + açude + poço artesiano',
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(farmImages.slice(1, 11))
    },
    {
      title: 'Fazenda Café Especial Cerrado Mineiro',
      description: 'Fazenda cafeeira de 420 hectares no coração do Cerrado Mineiro. Produção de café especial certificado, terreiro suspenso, tulha climatizada, casa de máquinas moderna. Casa sede rústica de 400m², piscina natural, energia solar. Renda anual comprovada.',
      price: 12000000,
      type: 'venda',
      category: 'fazenda',
      address: 'Fazenda Boa Vista, Rodovia MG-050',
      city: 'Patrocínio',
      state: 'MG',
      bedrooms: 5,
      bathrooms: 3,
      parking: 6,
      area: 4200000, // 420 hectares
      totalArea: 420.0,
      cultivatedArea: 350.0,
      pastures: 50.0,
      areaUnit: 'hectares',
      buildings: JSON.stringify(['Casa sede', 'Terreiro suspenso', 'Tulha climatizada', 'Casa máquinas', 'Depósito']),
      waterSources: 'Nascente + represa + irrigação',
      featured: true,
      status: 'disponivel',
      images: JSON.stringify(farmImages.slice(0, 10))
    }
  ]

  console.log('🏗️  Criando imóveis com muitas fotos...')

  for (const propertyData of properties) {
    const slug = generateSlug(propertyData.title)
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        slug
      }
    })
    console.log(`✅ Criado: ${property.title} (${JSON.parse(property.images || '[]').length} fotos)`)
  }

  console.log(`\n🎉 Seed concluído! ${properties.length} imóveis criados.`)
  console.log('📊 Estatísticas:')
  console.log(`   • ${properties.filter(p => p.category === 'apartamento').length} Apartamentos`)
  console.log(`   • ${properties.filter(p => p.category === 'casa').length} Casas`)
  console.log(`   • ${properties.filter(p => p.category === 'fazenda').length} Fazendas`)
  console.log(`   • ${properties.filter(p => p.type === 'venda').length} Para Venda`)
  console.log(`   • ${properties.filter(p => p.type === 'aluguel').length} Para Aluguel`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })