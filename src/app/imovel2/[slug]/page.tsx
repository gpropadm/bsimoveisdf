import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import PropertyGallery2 from '@/components/PropertyGallery2'

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
      url: `/imovel2/${property.slug}`,
      siteName: 'ImobiNext',
      type: 'website',
    },
  }
}

export default async function PropertyDetail2({ params }: PropertyDetailProps) {
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
            <Link href="/" className="text-2xl font-bold text-black font-display">
              ImobiNext
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-800 hover:text-black">Home</Link>
              <Link href="/imoveis" className="text-gray-800 hover:text-black">Imóveis</Link>
              <Link href="/sobre" className="text-gray-800 hover:text-black">Sobre</Link>
              <Link href="/contato" className="text-gray-800 hover:text-black">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Full Width Image Slider */}
      <div className="mt-6">
        <PropertyGallery2 propertyTitle={property.title} />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/imoveis" className="text-teal-600 hover:text-teal-800">
            ← Voltar para listagem
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-display">{property.title}</h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{property.address}, {property.city} - {property.state}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M22 19H2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>
                        <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Quartos</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1 0l-1 1a1.5 1.5 0 0 0 0 1L6.5 9Z"/>
                        <path d="M12 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4"/>
                        <path d="M16 10h.01"/>
                        <path d="M19 10h.01"/>
                        <path d="M19 14h.01"/>
                        <path d="M16 14h.01"/>
                        <path d="M14 4h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Banheiros</div>
                  </div>
                )}
                {property.parking && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10H5.6L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                        <circle cx="7" cy="17" r="2"/>
                        <path d="M9 17h6"/>
                        <circle cx="17" cy="17" r="2"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.parking}</div>
                    <div className="text-sm text-gray-600">Vagas</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{property.area}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-bold capitalize ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>{property.type}</div>
                  <div className="text-sm text-gray-600">Tipo</div>
                </div>
              </div>

              {property.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 font-display">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold mb-2 ${property.type === 'venda' ? 'text-teal-500' : 'text-orange-500'}`}>
                  R$ {property.price.toLocaleString('pt-BR')}
                </div>
                <div className="text-gray-600 capitalize">
                  {property.category} para {property.type}
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors font-semibold">
                  Entrar em Contato
                </button>
                
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                  WhatsApp
                </button>

                <button className="w-full border-2 border-teal-500 text-teal-500 py-3 px-4 rounded-lg hover:bg-teal-50 transition-colors font-semibold">
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
                  {property.parking && <li>• Vagas: {property.parking}</li>}
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