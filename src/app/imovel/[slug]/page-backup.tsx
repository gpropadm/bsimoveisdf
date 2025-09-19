import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PropertyDetailClient from '@/components/PropertyDetailClient'

interface PropertyDetailProps {
  params: Promise<{ slug: string }>
}

interface Property {
  id: string
  title: string
  description: string | null
  price: number
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
  createdAt: string
  updatedAt: string
}

async function getProperty(slug: string): Promise<Property | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/properties/${slug}`, {
      cache: 'no-store' // Always fetch fresh data for SEO
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
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

  const images = property.images ? JSON.parse(property.images) : []
  const firstImage = images[0] || '/placeholder-house.jpg'
  
  const title = `${property.title} - ${formatPrice(property.price)} - ${property.city}`
  const description = property.description || 
    `${property.category} para ${property.type} em ${property.city}. ${property.bedrooms ? `${property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""} quartos` : ''} ${property.bathrooms ? `${property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""} banheiros` : ''} ${property.area ? `${property.area && property.area > 0 ? property.area : ""}m²` : ''}.`

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

  // Structured Data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.category} para ${property.type} em ${property.city}`,
    url: `https://faimoveis.com.br/imovel/${property.slug}`,
    image: property.images ? JSON.parse(property.images) : ['/placeholder-house.jpg'],
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