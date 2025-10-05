import { notFound } from 'next/navigation'
import { Metadata } from 'next'

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
}

async function getProperty(slug: string): Promise<Property | null> {
  try {
    const response = await fetch(`https://modelo-site-imob.vercel.app/api/properties/${slug}`, {
      cache: 'no-store'
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

export default async function PropertyDetail({ params }: PropertyDetailProps) {
  const resolvedParams = await params
  const property = await getProperty(resolvedParams.slug)

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Site Imobiliário</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.type === 'venda' ? 'Venda' : 'Aluguel'}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {property.category}
            </span>
          </div>

          <p className="text-3xl font-bold text-green-600 mb-4">
            R$ {property.price.toLocaleString('pt-BR')}
          </p>

          <p className="text-gray-600 mb-4">{property.address}, {property.city} - {property.state}</p>

          {property.description && (
            <p className="text-gray-700 mb-6">{property.description}</p>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {property.bedrooms && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""}</div>
                <div className="text-sm text-gray-600">Quartos</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""}</div>
                <div className="text-sm text-gray-600">Banheiros</div>
              </div>
            )}
            {property.parking && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{property.parking && property.parking > 0 ? property.parking : ""}</div>
                <div className="text-sm text-gray-600">Vagas</div>
              </div>
            )}
            {property.area && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{property.area && property.area > 0 ? property.area : ""}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
            )}
          </div>

          {/* Image */}
          {property.images && (
            <div className="mb-6">
              <img
                src={property.images.split(',')[0]}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Contact Form */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interessado neste imóvel?</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Seu telefone"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <textarea
                  placeholder="Sua mensagem"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Enviar Interesse
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 Site Imobiliário. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}