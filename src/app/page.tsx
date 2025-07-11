import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'ImobiNext - Imóveis para Venda e Aluguel',
  description: 'Encontre casas, apartamentos e coberturas para venda e aluguel. A melhor seleção de imóveis em São Paulo, Rio de Janeiro e todo o Brasil.',
  openGraph: {
    title: 'ImobiNext - Imóveis para Venda e Aluguel',
    description: 'Encontre casas, apartamentos e coberturas para venda e aluguel.',
    url: '/',
    siteName: 'ImobiNext',
    type: 'website',
  },
}

export default async function Home() {
  const properties = await prisma.property.findMany({
    take: 6,
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
              <Link href="/" className="text-blue-600 font-medium">Home</Link>
              <Link href="/imoveis" className="text-gray-600 hover:text-blue-600">Imóveis</Link>
              <Link href="/venda" className="text-gray-600 hover:text-blue-600">Venda</Link>
              <Link href="/aluguel" className="text-gray-600 hover:text-blue-600">Aluguel</Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600">Sobre</Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop&q=80"
              alt="Casa moderna - ImobiNext"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>

          {/* Content */}
          <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Mais de 1000 imóveis para venda e aluguel nos melhores bairros
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <select className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Comprar</option>
                    <option value="venda">Comprar</option>
                    <option value="aluguel">Alugar</option>
                  </select>
                </div>
                <div>
                  <select className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Tipo de Imóvel</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="cobertura">Cobertura</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cidade ou Bairro"
                    className="w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <button className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Encontrar Imóvel
                  </button>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/venda" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Ver Imóveis à Venda
              </Link>
              <Link href="/aluguel" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Ver Imóveis para Aluguel
              </Link>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l3 3 7-7"/>
              <path d="M12 17V3"/>
            </svg>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Imóveis em Destaque</h2>
              <p className="text-gray-600">Selecionamos os melhores imóveis para você</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link key={property.id} href={`/imovel/${property.slug}`} className="group">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      <span className="text-gray-500">Foto do imóvel</span>
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium capitalize">
                        {property.type}
                      </div>
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
            
            <div className="text-center mt-12">
              <Link href="/imoveis" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Ver Todos os Imóveis
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mais de 1000 Imóveis</h3>
                <p className="text-gray-600">Grande variedade de casas, apartamentos e coberturas</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Melhores Localizações</h3>
                <p className="text-gray-600">Imóveis nos bairros mais valorizados das principais cidades</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Atendimento Especializado</h3>
                <p className="text-gray-600">Equipe de corretores especializados para te ajudar</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-4">ImobiNext</h3>
              <p className="text-gray-400 mb-4">Sua imobiliária de confiança há mais de 10 anos no mercado.</p>
              <div className="flex space-x-4">
                <span className="text-2xl">📘</span>
                <span className="text-2xl">📸</span>
                <span className="text-2xl">🐦</span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Imóveis</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/venda" className="hover:text-white">Venda</Link></li>
                <li><Link href="/aluguel" className="hover:text-white">Aluguel</Link></li>
                <li><Link href="/lancamentos" className="hover:text-white">Lançamentos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 (11) 9999-9999</li>
                <li>📧 contato@imobinext.com</li>
                <li>📍 Rua dos Imóveis, 123</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Segunda a Sexta: 8h às 18h</li>
                <li>Sábado: 8h às 12h</li>
                <li>Domingo: Fechado</li>
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
