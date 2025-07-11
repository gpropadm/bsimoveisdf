import Link from 'next/link'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Imóveis para Venda e Aluguel - ImobiNext',
  description: 'Encontre casas, apartamentos e coberturas para venda e aluguel. Imóveis nos melhores bairros de São Paulo, Rio de Janeiro e todo o Brasil.',
}

interface SearchParams {
  type?: string
  category?: string
  city?: string
}

export default async function Properties({ searchParams }: { searchParams: SearchParams }) {
  const { type, category, city } = searchParams

  const properties = await prisma.property.findMany({
    where: {
      ...(type && { type }),
      ...(category && { category }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
    },
    orderBy: { createdAt: 'desc' }
  })

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
              <Link href="/imoveis" className="text-blue-600 font-medium">Imóveis</Link>
              <Link href="/venda" className="text-gray-600 hover:text-blue-600">Venda</Link>
              <Link href="/aluguel" className="text-gray-600 hover:text-blue-600">Aluguel</Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600">Sobre</Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {type ? `Imóveis para ${type}` : 'Todos os Imóveis'}
          </h1>
          <p className="text-gray-600 mb-6">
            {properties.length} imóveis encontrados
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">Todos</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">Todos</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="cobertura">Cobertura</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">Todas</option>
                  <option value="São Paulo">São Paulo</option>
                  <option value="Rio de Janeiro">Rio de Janeiro</option>
                  <option value="Barueri">Barueri</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Filtrar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  <span className="text-gray-500">Foto do imóvel</span>
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium capitalize">
                    {property.type}
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
                    <span className="text-2xl font-bold text-blue-600">
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou remover algumas opções de busca.</p>
            <Link href="/imoveis" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Ver todos os imóveis
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">ImobiNext</h3>
              <p className="text-gray-400 mb-4">Sua imobiliária de confiança há mais de 10 anos no mercado.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Imóveis</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/venda" className="hover:text-white">Venda</Link></li>
                <li><Link href="/aluguel" className="hover:text-white">Aluguel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 (11) 9999-9999</li>
                <li>📧 contato@imobinext.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ImobiNext. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}