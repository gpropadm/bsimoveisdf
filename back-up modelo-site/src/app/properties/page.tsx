import Link from 'next/link'
import prisma from '@/lib/prisma'

// Força a página a ser dinâmica
export const dynamic = 'force-dynamic'

export default async function Properties() {
  let properties: any[] = []
  
  try {
    properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ImobiNext</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
              <Link href="/properties" className="text-gray-900 font-medium">Imóveis</Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">Sobre</Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-900">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Todos os Imóveis</h2>
          <div className="flex gap-4 mb-6">
            <Link 
              href="/properties" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Todos
            </Link>
            <Link 
              href="/properties?type=venda" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Venda
            </Link>
            <Link 
              href="/properties?type=aluguel" 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Aluguel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Imagem do imóvel</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h4>
                <p className="text-gray-600 mb-4">{property.address}, {property.city}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {property.price.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">{property.type}</span>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-500">
                  {property.bedrooms && <span>{property.bedrooms && property.bedrooms > 0 ? property.bedrooms : ""} quartos</span>}
                  {property.bathrooms && <span>{property.bathrooms && property.bathrooms > 0 ? property.bathrooms : ""} banheiros</span>}
                  {property.area && property.area > 0 && <span>{property.area && property.area > 0 ? property.area : ""}m²</span>}
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/properties/${property.id}`}
                    className="w-full border border-gray-400 hover:border-gray-600 text-gray-700 py-2 px-4 rounded-lg transition-colors text-center block bg-transparent cursor-pointer"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum imóvel encontrado.</p>
          </div>
        )}
      </main>
    </div>
  )
}