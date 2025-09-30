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

async function main() {
  const properties = [
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
    },
    {
      title: 'Cobertura Duplex Vila Madalena',
      description: 'Cobertura com terraço gourmet e vista panorâmica da cidade.',
      price: 1800000,
      type: 'venda',
      category: 'cobertura',
      address: 'Rua Harmonia, 200',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      area: 180,
      featured: true,
    },
    {
      title: 'Chalé Aconchegante em Campos do Jordão',
      description: 'Chalé com lareira, perfeito para momentos de relaxamento na montanha.',
      price: 4500,
      type: 'aluguel',
      category: 'casa',
      address: 'Rua das Hortênsias, 50',
      city: 'Campos do Jordão',
      state: 'SP',
      bedrooms: 2,
      bathrooms: 1,
      parking: 0,
      area: 100,
      featured: false,
    },
    {
      title: 'Apartamento Novo em Ipanema',
      description: 'Apartamento novo com 2 quartos, próximo à praia e ao metrô.',
      price: 8500,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Rua Visconde de Pirajá, 300',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 85,
      featured: false,
    },
    {
      title: 'Casa Térrea em Santana de Parnaíba',
      description: 'Casa térrea com quintal amplo, ideal para famílias com crianças.',
      price: 650000,
      type: 'venda',
      category: 'casa',
      address: 'Rua das Palmeiras, 800',
      city: 'Santana de Parnaíba',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 200,
      featured: false,
    },
  ]

  for (const property of properties) {
    await prisma.property.create({
      data: {
        ...property,
        slug: generateSlug(property.title),
      },
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })