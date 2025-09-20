'use client'

interface ServicesSectionProps {
  onCadastroClick: () => void
  onEncomendaClick: () => void
  onContatoClick: () => void
}

export default function ServicesSection({ onCadastroClick, onEncomendaClick, onContatoClick }: ServicesSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button onClick={onCadastroClick} className="group text-left">
            <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Cadastre seu imóvel</h3>
              <p className="text-gray-600 text-xs">Anuncie seu imóvel conosco e encontre o comprador ideal rapidamente</p>
            </div>
          </button>
          <button onClick={onEncomendaClick} className="group text-left">
            <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Encomende seu imóvel</h3>
              <p className="text-gray-600 text-xs">Não encontrou o que procura? Deixe-nos encontrar o imóvel perfeito para você</p>
            </div>
          </button>
          <button onClick={onContatoClick} className="group text-left">
            <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M8 9h8"/>
                  <path d="M8 13h6"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Entre em Contato</h3>
              <p className="text-gray-600 text-xs">Nossa equipe especializada está pronta para te atender e esclarecer todas as dúvidas</p>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}