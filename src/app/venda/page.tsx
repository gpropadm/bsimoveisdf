import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Imóveis para Venda - Casas e Apartamentos à Venda - ImobiNext',
  description: 'Encontre casas, apartamentos e coberturas para comprar. Imóveis para venda nos melhores bairros de São Paulo, Rio de Janeiro e todo o Brasil.',
}

// Força a página a ser dinâmica
export const dynamic = 'force-dynamic'

export default async function Venda() {
  let properties: any[] = []
  
  try {
    properties = await prisma.property.findMany({
      where: { type: 'venda' },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Erro ao buscar propriedades de venda:', error)
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
              <Link href="/venda" className="text-blue-600 font-medium">Venda</Link>
              <Link href="/aluguel" className="text-gray-600 hover:text-blue-600">Aluguel</Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600">Sobre</Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Imóveis para Venda</h1>
          <p className="text-gray-600 mb-6">
            {properties.length} imóveis disponíveis para compra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  <span className="text-gray-500">Foto do imóvel</span>
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                    Venda
                  </div>
                  {property.featured && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                      Destaque
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {property.address}, {property.city} - {property.state}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      R$ {property.price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {property.category}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    {property.bedrooms && <span>🛏️ {property.bedrooms} quartos</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms} banheiros</span>}
                    {property.area && <span>📐 {property.area}m²</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum imóvel para venda encontrado</h3>
            <p className="text-gray-600 mb-6">Novos imóveis são adicionados regularmente. Volte em breve!</p>
            <Link href="/imoveis" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Ver todos os imóveis
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}