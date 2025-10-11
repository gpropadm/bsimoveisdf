import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import { parseImages, getFirstImage } from '@/lib/imageUtils'
import prisma from '@/lib/prisma'

interface PropertyDetailProps {
  params: Promise<{
    category: string
    type: string
    state: string
    city: string
    slug: string
  }>
}

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  previousPrice?: number | null
  priceReduced?: boolean
  priceReducedAt?: string | null
  type: string
  category: string
  address: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  area: number | null
  images: string | null
  video: string | null
  slug: string
  // Campos específicos para apartamentos
  amenities: string | null
  condoFee: number | null
  floor: number | null
  suites: number | null
  iptu: number | null
  apartmentTotalArea: number | null
  apartmentUsefulArea: number | null
  createdAt: string
  updatedAt: string
}

async function getProperty(slug: string, category: string, type: string, city: string): Promise<Property | null> {
  try {
    console.log(`🔍 [PAGE] Buscando propriedade - slug: ${slug}, category: ${category}, type: ${type}, city: ${city}`)

    const property = await prisma.property.findFirst({
      where: {
        slug,
        category: category.replace(/-/g, ' '),
        type,
        city: {
          contains: city.replace(/-/g, ' '),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        previousPrice: true,
        priceReduced: true,
        priceReducedAt: true,
        type: true,
        category: true,
        address: true,
        city: true,
        state: true,
        bedrooms: true,
        bathrooms: true,
        parking: true,
        area: true,
        images: true,
        video: true,
        slug: true,
        amenities: true,
        condoFee: true,
        floor: true,
        suites: true,
        iptu: true,
        apartmentTotalArea: true,
        apartmentUsefulArea: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!property) {
      console.log(`❌ [PAGE] Propriedade não encontrada`)
      return null
    }

    console.log(`✅ [PAGE] Propriedade encontrada: ${property.title}`)
    return {
      ...property,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
      priceReducedAt: property.priceReducedAt?.toISOString() || null
    }
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

export async function generateMetadata({ params }: PropertyDetailProps): Promise<Metadata> {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.slug, resolvedParams.category, resolvedParams.type, resolvedParams.city)

  if (!property) {
    return {
      title: 'Imóvel não encontrado',
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const firstImage = getFirstImage(property.images)

  const title = `${property.category} ${property.bedrooms ? `${property.bedrooms} quartos` : ''} ${property.type === 'venda' ? 'à venda' : 'para alugar'} ${property.city} - ${formatPrice(property.price)}`
  const description = property.description ||
    `${property.category} para ${property.type} em ${property.city}, ${property.state}. ${property.bedrooms ? `${property.bedrooms} quartos` : ''} ${property.bathrooms ? `${property.bathrooms} banheiros` : ''} ${property.area ? `${property.area}m²` : ''}. Confira na BS Imóveis DF.`

  return {
    title,
    description,
    keywords: [
      property.category,
      property.type,
      property.city,
      property.state,
      'imóvel brasília',
      'imóveis df',
      property.type === 'venda' ? 'venda brasília' : 'aluguel brasília',
      'bs imóveis'
    ],
    openGraph: {
      title,
      description,
      images: [
        {
          url: firstImage.startsWith('http') ? firstImage : `https://www.bsimoveisdf.com.br${firstImage}`,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'website',
      locale: 'pt_BR',
      siteName: 'BS Imóveis DF',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [firstImage.startsWith('http') ? firstImage : `https://www.bsimoveisdf.com.br${firstImage}`],
    },
    alternates: {
      canonical: `https://www.bsimoveisdf.com.br/imovel/${resolvedParams.category}/${resolvedParams.type}/${resolvedParams.state}/${resolvedParams.city}/${resolvedParams.slug}`,
    },
  }
}

export default async function PropertyDetail({ params }: PropertyDetailProps) {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.slug, resolvedParams.category, resolvedParams.type, resolvedParams.city)

  if (!property) {
    notFound()
  }

  return <PropertyDetailClient property={property} />
}
