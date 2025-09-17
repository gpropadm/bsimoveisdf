const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 CRIANDO IMÓVEIS RAPIDAMENTE!')

  // Deletar todos os imóveis primeiro
  await prisma.property.deleteMany({})
  console.log('🗑️ Imóveis existentes removidos')

  const properties = [
    {
      title: 'Casa á venda no Lago Norte, Setor de Mansões do Lago Norte',
      slug: 'casa-venda-lago-norte-mansoes-1',
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
      images: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    },
    {
      title: 'Apartamento Moderno em Copacabana',
      slug: 'apartamento-moderno-copacabana-2',
      description: 'Lindo apartamento com vista para o mar, totalmente renovado.',
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
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    },
    {
      title: 'Casa Luxuosa em Alphaville',
      slug: 'casa-luxuosa-alphaville-3',
      description: 'Casa em condomínio fechado com área de lazer completa.',
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
      images: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    },
    {
      title: 'Apartamento para Aluguel em Ipanema',
      slug: 'apartamento-aluguel-ipanema-4',
      description: 'Apartamento mobiliado próximo à praia.',
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
    }
  ]

  for (const property of properties) {
    await prisma.property.create({ data: property })
    console.log(`✅ Criado: ${property.title}`)
  }

  console.log('🎉 IMÓVEIS RECUPERADOS!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())