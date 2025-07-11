import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import PropertyGallery from '@/components/PropertyGallery'

interface PropertyDetailProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const properties = await prisma.property.findMany({
    select: { slug: true }
  })

  return properties.map((property) => ({
    slug: property.slug,
  }))
}

export async function generateMetadata({ params }: PropertyDetailProps): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({
    where: { slug }
  })

  if (!property) {
    return {
      title: 'Imóvel não encontrado',
    }
  }

  return {
    title: `${property.title} - ${property.city}, ${property.state}`,
    description: property.description || `${property.category} para ${property.type} em ${property.city}, ${property.state}. ${property.bedrooms} quartos, ${property.bathrooms} banheiros, ${property.area}m².`,
    openGraph: {
      title: `${property.title} - ${property.city}, ${property.state}`,
      description: property.description || `${property.category} para ${property.type} em ${property.city}, ${property.state}`,
      url: `/imovel/${property.slug}`,
      siteName: 'ImobiNext',
      type: 'website',
    },
  }
}

export default async function PropertyDetail({ params }: PropertyDetailProps) {
  const { slug } = await params
  const property = await prisma.property.findUnique({
    where: { slug }
  })

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ImobiNext
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <Link href="/imoveis" className="text-gray-600 hover:text-blue-600">Imóveis</Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600">Sobre</Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/imoveis" className="text-blue-600 hover:text-blue-800">
            ← Voltar para listagem
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <PropertyGallery propertyTitle={property.title} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <span className="font-medium">📍</span>
                <span>{property.address}, {property.city} - {property.state}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Quartos</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Banheiros</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{property.area}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 capitalize">{property.type}</div>
                  <div className="text-sm text-gray-600">Tipo</div>
                </div>
              </div>

              {property.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  R$ {property.price.toLocaleString('pt-BR')}
                </div>
                <div className="text-gray-600 capitalize">
                  {property.category} para {property.type}
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Entrar em Contato
                </button>
                
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  WhatsApp
                </button>

                <button className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
                  Agendar Visita
                </button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Características</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Tipo: {property.category}</li>
                  <li>• Finalidade: {property.type}</li>
                  {property.bedrooms && <li>• Quartos: {property.bedrooms}</li>}
                  {property.bathrooms && <li>• Banheiros: {property.bathrooms}</li>}
                  {property.area && <li>• Área: {property.area}m²</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}