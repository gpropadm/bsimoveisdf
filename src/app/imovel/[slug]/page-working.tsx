import { notFound } from 'next/navigation'

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleSubmit = async (formData: FormData) => {
    'use server'

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string

    try {
      await fetch('https://modelo-site-imob.vercel.app/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          propertyTitle: property.title,
          propertyPrice: formatPrice(property.price),
          propertyType: property.type
        })
      })
    } catch (error) {
      console.error('Error submitting lead:', error)
    }
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>{property.title} - Site Imobiliário</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">🏠 Site Imobiliário</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-8">

            {/* Property Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.type === 'venda' ? '🏷️ Venda' : '🏠 Aluguel'}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.category}
                </span>
              </div>

              <p className="text-4xl font-bold text-green-600 mb-4">
                {formatPrice(property.price)}
              </p>

              <p className="text-gray-600 mb-6">📍 {property.address}, {property.city} - {property.state}</p>

              {property.description && (
                <p className="text-gray-700 mb-6 leading-relaxed">{property.description}</p>
              )}

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🛏️</div>
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""}</div>
                    <div className="text-sm text-gray-600">Quartos</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🚿</div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""}</div>
                    <div className="text-sm text-gray-600">Banheiros</div>
                  </div>
                )}
                {property.parking && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="text-2xl font-bold text-gray-900">{property.parking && property.parking > 0 ? property.parking : ""}</div>
                    <div className="text-sm text-gray-600">Vagas</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">📐</div>
                    <div className="text-2xl font-bold text-gray-900">{property.area && property.area > 0 ? property.area : ""}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                )}
              </div>

              {/* Image */}
              {property.images && (
                <div className="mb-8">
                  <img
                    src={property.images.split(',')[0]}
                    alt={property.title}
                    className="w-full h-80 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Contact Form */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">💬 Interessado neste imóvel?</h3>
                <p className="text-gray-600 mb-6">Preencha o formulário e receba mais informações!</p>

                <form action={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="👤 Seu nome completo"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="📧 Seu email"
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="📱 Seu telefone (com DDD)"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    name="message"
                    placeholder="💭 Sua mensagem (opcional)"
                    rows={3}
                    defaultValue={`Olá! Tenho interesse no imóvel "${property.title}". Gostaria de mais informações.`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    ✉️ Enviar Interesse
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    📱 Você receberá uma resposta via WhatsApp em poucos minutos!
                  </p>
                </form>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-lg">🏠 Site Imobiliário - Encontre seu imóvel ideal!</p>
              <p className="text-gray-400 mt-2">&copy; 2025 Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}