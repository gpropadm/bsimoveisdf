import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import { parseImages, getFirstImage } from '@/lib/imageUtils'
import prisma from '@/lib/prisma'

interface PropertyDetailProps {
  params: Promise<{ slug: string }>
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

async function getProperty(slug: string): Promise<Property | null> {
  try {
    console.log(`🔍 [PAGE] Buscando propriedade com slug: ${slug}`)

    const property = await prisma.property.findUnique({
      where: { slug },
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
      console.log(`❌ [PAGE] Propriedade não encontrada: ${slug}`)
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
  const property = await getProperty(resolvedParams.slug)
  
  if (!property) {
    return {
      title: 'Imóvel não encontrado - Faimoveis',
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

  const images = parseImages(property.images)
  const firstImage = getFirstImage(property.images)
  
  const title = `${property.title} - ${formatPrice(property.price)} - ${property.city}`
  const description = property.description || 
    `${property.category} para ${property.type} em ${property.city}. ${property.bedrooms ? `${property.bedrooms} quartos` : ''} ${property.bathrooms ? `${property.bathrooms} banheiros` : ''} ${property.area ? `${property.area}m²` : ''}.`

  return {
    title,
    description,
    keywords: [
      property.category,
      property.type,
      property.city,
      property.state,
      'imóvel',
      'casa',
      'apartamento',
      'faimoveis'
    ],
    openGraph: {
      title,
      description,
      images: [
        {
          url: firstImage.startsWith('http') ? firstImage : `https://faimoveis.com.br${firstImage}`,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Faimoveis',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [firstImage.startsWith('http') ? firstImage : `https://faimoveis.com.br${firstImage}`],
    },
    alternates: {
      canonical: `https://faimoveis.com.br/imovel/${property.slug}`,
    },
  }
}

export default async function PropertyDetail({ params }: PropertyDetailProps) {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.slug)

  if (!property) {
    notFound()
  }

  // Parse images safely
  const propertyImages = parseImages(property.images)

  // If no images, use placeholder
  const finalImages = propertyImages.length > 0 ? propertyImages : ['/placeholder-house.jpg']

  // Structured Data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.category} para ${property.type} em ${property.city}`,
    url: `https://faimoveis.com.br/imovel/${property.slug}`,
    image: finalImages,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: 'BR',
    },
    floorSize: property.area ? {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK'
    } : undefined,
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PropertyDetailClient property={property} />
    </>
  )
}