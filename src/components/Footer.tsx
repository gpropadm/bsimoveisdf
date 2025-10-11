'use client'

export default function Footer() {
  return (
    <footer className="text-gray-800 border-t border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* Logo */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">BS Imóveis</h3>
            <p className="text-sm text-gray-600 flex items-start">
              <i className="fas fa-map-marker-alt mr-2 mt-1" style={{ fontSize: '14px' }}></i>
              <span>
                QR 218 Conj. O Lote 30<br />
                Brasília - DF
              </span>
            </p>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Contato</h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <i className="fab fa-whatsapp mr-2 text-gray-500" style={{ fontSize: '14px' }}></i>
                <span className="text-gray-500 cursor-default">(61) 9999-9999</span>
              </div>
              <div>
                <span className="text-gray-500 cursor-default">Fale Conosco</span>
              </div>
              <div>
                <span className="text-gray-500 cursor-default">Central de Ajuda</span>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="mt-6">
              <h6 className="text-base font-semibold mb-3">Acompanhe nossas redes</h6>
              <div className="flex space-x-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center cursor-default" style={{ backgroundColor: '#e0e0e0' }}>
                  <i className="fa-brands fa-facebook-f text-white" style={{ fontSize: '16px' }}></i>
                </span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center cursor-default" style={{ backgroundColor: '#e0e0e0' }}>
                  <i className="fa-brands fa-instagram text-white" style={{ fontSize: '16px' }}></i>
                </span>
                <span className="w-8 h-8 rounded-full flex items-center justify-center cursor-default" style={{ backgroundColor: '#e0e0e0' }}>
                  <i className="fa-brands fa-linkedin-in text-white" style={{ fontSize: '16px' }}></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="text-sm text-center">
            <span className="font-bold">© BS Imóveis.</span>
            <span className="ml-2">Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}