const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  console.log('🏠 Recuperando imóveis...')

  const properties = [
    {
      title: 'Casa á venda no Lago Norte, Setor de Mansões do Lago Norte',
      description: 'Lindíssima casa no Lago Norte com vista para o lago, 4 quartos, piscina, área gourmet completa.',
      price: 2500000,
      type: 'venda',
      category: 'casa',
      address: 'SMLN MI Trecho 03, Conjunto 15, Casa 45',
      city: 'Brasília',
      state: 'DF',
      bedrooms: 4,
      bathrooms: 4,
      parking: 4,
      area: 450,
      featured: true,
      images: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    },
    {
      title: 'Apartamento Moderno em Copacabana',
      description: 'Lindo apartamento com vista para o mar, totalmente renovado com acabamentos de primeira qualidade.',
      price: 850000,
      type: 'venda',
      category: 'apartamento',
      address: 'Rua Barata Ribeiro, 500',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 120,
      featured: true,
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    },
    {
      title: 'Casa Luxuosa em Alphaville',
      description: 'Casa em condomínio fechado com área de lazer completa, piscina e jardim.',
      price: 1200000,
      type: 'venda',
      category: 'casa',
      address: 'Alameda dos Jurupis, 1000',
      city: 'Barueri',
      state: 'SP',
      bedrooms: 4,
      bathrooms: 3,
      parking: 4,
      area: 300,
      featured: true,
      images: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800,https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    },
    {
      title: 'Cobertura Duplex Vila Madalena',
      description: 'Cobertura com terraço gourmet e vista panorâmica da cidade.',
      price: 950000,
      type: 'venda',
      category: 'apartamento',
      address: 'Rua Harmonia, 123',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      area: 180,
      featured: true,
      images: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    },
    {
      title: 'Apartamento para Aluguel em Ipanema',
      description: 'Apartamento mobiliado próximo à praia, perfeito para quem busca qualidade de vida.',
      price: 4500,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Rua Visconde de Pirajá, 200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 90,
      featured: false,
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    },
    {
      title: 'Casa em Condomínio - Barra da Tijuca',
      description: 'Casa espaçosa em condomínio com segurança 24h e área de lazer.',
      price: 6500,
      type: 'aluguel',
      category: 'casa',
      address: 'Estrada do Pontal, 5000',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      area: 250,
      featured: false,
      images: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    }
  ]

  for (const property of properties) {
    const slug = generateSlug(property.title)

    await prisma.property.create({
      data: {
        ...property,
        slug: slug
      }
    })

    console.log(`✅ Criado: ${property.title}`)
  }

  console.log('🎉 Todos os imóveis foram recuperados!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })