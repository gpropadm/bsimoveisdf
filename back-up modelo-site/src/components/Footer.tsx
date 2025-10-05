'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="text-gray-800 border-t border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-8">

          {/* Logo */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800">All</h3>
          </div>

          {/* Conheça */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Conheça</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-500 cursor-default">Sobre Nós</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Blog</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Trabalhe Conosco</span>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Produtos</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-500 cursor-default">CRM Imobiliário</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Site Imobiliário</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Gestão de Imóveis</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Portal do Cliente</span>
              </li>
              <li>
                <span className="text-gray-500 cursor-default">Financiamento</span>
              </li>
            </ul>
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
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center">
            <div className="text-sm mb-4 xl:mb-0">
              <span className="font-bold">© All Imóveis.</span>
              <span className="ml-2">Todos os direitos reservados.</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400">
              <span className="cursor-default">Termos de Uso</span>
              <span>·</span>
              <span className="cursor-default">Política de Privacidade</span>
              <span>·</span>
              <span className="cursor-default">Código de Conduta</span>
              <span>·</span>
              <span className="cursor-default">Canal de Denúncia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}