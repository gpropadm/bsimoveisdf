'use client'

import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'

export default function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">{settings.siteName}</h3>
            <p className="text-gray-400 mb-4">{settings.siteDescription}</p>
            <div className="flex space-x-4">
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400">📘</a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-pink-400">📸</a>
              )}
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
              <li>📞 {settings.contactPhone}</li>
              <li>📧 {settings.contactEmail}</li>
              <li>📍 {settings.address}</li>
              <li>{settings.city}, {settings.state}</li>
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
          <p>&copy; 2024 {settings.siteName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}