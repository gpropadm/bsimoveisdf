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
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
            </ul>
          </div>

          {/* Produtos */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Produtos</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
              <li>
                <span className="text-gray-500">*</span>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Contato</h5>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">*</span>
              </div>
              <div>
                <span className="text-gray-500">*</span>
              </div>
              <div>
                <span className="text-gray-500">*</span>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="mt-6">
              <h6 className="text-base font-semibold mb-3">Acompanhe nossas redes</h6>
              <div className="flex space-x-3">
                <span className="text-gray-500">*</span>
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
              <span>*</span>
              <span>·</span>
              <span>*</span>
              <span>·</span>
              <span>*</span>
              <span>·</span>
              <span>*</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}