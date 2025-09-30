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
  // Limpar dados existentes
  await prisma.property.deleteMany({})

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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg'
      ])
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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg'
      ])
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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg'
      ])
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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg'
      ])
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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg'
      ])
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
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752623251999-9bmds2rux3i.jpg',
        '/uploads/properties/1752628765689-3wfx9wx1zyd.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg'
      ])
    },
    {
      title: 'Loft Moderno no Centro',
      description: 'Loft com design contemporâneo no coração da cidade.',
      price: 550000,
      type: 'venda',
      category: 'apartamento',
      address: 'Rua XV de Novembro, 123',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      area: 65,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752628800073-8yt8o11ojo4.jpg',
        '/uploads/properties/1752628813773-fwy9w3m9mff.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg'
      ])
    },
    {
      title: 'Casa Colonial em Petrópolis',
      description: 'Casa histórica restaurada com todo charme preservado.',
      price: 7500,
      type: 'aluguel',
      category: 'casa',
      address: 'Rua do Imperador, 456',
      city: 'Petrópolis',
      state: 'RJ',
      bedrooms: 4,
      bathrooms: 2,
      parking: 2,
      area: 250,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752628867166-m0nvlz1ph4.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    // Novos imóveis para testar navegação
    {
      title: 'Apartamento Duplex em Leblon',
      description: 'Duplex com terraço privativo e vista deslumbrante.',
      price: 2200000,
      type: 'venda',
      category: 'apartamento',
      address: 'Rua Aristides Espínola, 85',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
      area: 200,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752501024944-0ua5zajn43m.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Casa de Condomínio em Barra da Tijuca',
      description: 'Casa ampla em condomínio com segurança 24h.',
      price: 12000,
      type: 'aluguel',
      category: 'casa',
      address: 'Estrada da Barra da Tijuca, 1200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      area: 400,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752501024944-0ua5zajn43m.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Studio em Moema',
      description: 'Studio moderno e funcional em localização privilegiada.',
      price: 3500,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Rua Pamplona, 1500',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      area: 45,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752363661665-9z6urnjtgjs.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Casa com Piscina em Granja Viana',
      description: 'Casa espaçosa com piscina e área gourmet.',
      price: 980000,
      type: 'venda',
      category: 'casa',
      address: 'Rua das Begônias, 300',
      city: 'Cotia',
      state: 'SP',
      bedrooms: 4,
      bathrooms: 3,
      parking: 4,
      area: 350,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752628780209-tcyh58brmf.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Apartamento em Higienópolis',
      description: 'Apartamento clássico em prédio histórico renovado.',
      price: 5800,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Rua da Consolação, 2000',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 90,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752363776024-u51iukouvbp.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Cobertura em Pinheiros',
      description: 'Cobertura com 360m² e vista panorâmica da cidade.',
      price: 3200000,
      type: 'venda',
      category: 'cobertura',
      address: 'Rua dos Pinheiros, 800',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 4,
      bathrooms: 4,
      parking: 3,
      area: 360,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752628780209-tcyh58brmf.jpg',
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg'
      ])
    },
    {
      title: 'Casa em Condomínio Fechado Guarulhos',
      description: 'Casa nova em condomínio com total segurança.',
      price: 750000,
      type: 'venda',
      category: 'casa',
      address: 'Rua das Acácias, 150',
      city: 'Guarulhos',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 180,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752622985966-yvqqy4magb8.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752628780209-tcyh58brmf.jpg'
      ])
    },
    {
      title: 'Apartamento Frente Mar em Santos',
      description: 'Apartamento com vista frontal para o mar.',
      price: 6500,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Av. Presidente Wilson, 1',
      city: 'Santos',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      area: 110,
      featured: true,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752623036107-b6z7g3z9yg5.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752628780209-tcyh58brmf.jpg'
      ])
    },
    {
      title: 'Casa de Campo em Atibaia',
      description: 'Casa rústica perfeita para fins de semana relaxantes.',
      price: 450000,
      type: 'venda',
      category: 'casa',
      address: 'Estrada Municipal, Km 5',
      city: 'Atibaia',
      state: 'SP',
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      area: 280,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752623251999-9bmds2rux3i.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752628780209-tcyh58brmf.jpg'
      ])
    },
    {
      title: 'Apartamento Garden em Brooklin',
      description: 'Garden com jardim privativo em área nobre.',
      price: 4200,
      type: 'aluguel',
      category: 'apartamento',
      address: 'Rua Funchal, 500',
      city: 'São Paulo',
      state: 'SP',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      area: 85,
      featured: false,
      status: 'disponivel',
      images: JSON.stringify([
        '/uploads/properties/1752628765689-3wfx9wx1zyd.jpg',
        '/uploads/properties/1752361064781-vru2u7kcgu.jpg',
        '/uploads/properties/1752363661670-vndhosjmhke.jpg',
        '/uploads/properties/1752363661672-iamru3cg1qj.jpg',
        '/uploads/properties/1752363661671-3udtmktfdeu.jpg',
        '/uploads/properties/1752363776029-qu6fowz8yh.jpg',
        '/uploads/properties/1752363776033-0gk7aimur58d.jpg',
        '/uploads/properties/1752622777684-l9obl8i84g9.jpg',
        '/uploads/properties/1752622872478-p8tg3cutgdg.jpg',
        '/uploads/properties/1752628780209-tcyh58brmf.jpg'
      ])
    }
  ]

  for (const property of properties) {
    await prisma.property.create({
      data: {
        ...property,
        slug: generateSlug(property.title),
      },
    })
  }

  console.log(`Seed data with ${properties.length} properties created successfully!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })