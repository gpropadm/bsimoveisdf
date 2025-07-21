'use client'

import Link from 'next/link'

interface HeaderProps {
  settings: {
    contactPhone: string
    contactEmail: string
    contactWhatsapp: string
    city: string
    state: string
    socialFacebook: string
    socialInstagram: string
    siteName?: string
  }
}

export default function Header({ settings }: HeaderProps) {
  return (
    <>
      {/* Top Header with Contact and Social Media */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 text-sm">
            {/* Left side - Contact Info */}
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{settings.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{settings.city}, {settings.state}</span>
              </div>
            </div>

            {/* Right side - WhatsApp and Social Media */}
            <div className="flex items-center space-x-6">
              {/* WhatsApp Button */}
              <a href={`https://wa.me/${settings.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              
              {(settings.socialFacebook || settings.socialInstagram) && (
                <>
                  <span className="text-gray-600 text-sm">Siga-nos:</span>
                  <div className="flex space-x-2">
                    {settings.socialFacebook && (
                      <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {settings.socialInstagram && (
                      <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-black font-display">
              {settings.siteName || 'ImobiNext'}
            </Link>
            <nav className="flex space-x-6">
              <Link href="/" className="text-black font-medium">Home</Link>
              <Link href="/imoveis" className="text-gray-800 hover:text-black">Imóveis</Link>
              <Link href="/venda" className="text-gray-800 hover:text-black">Venda</Link>
              <Link href="/aluguel" className="text-gray-800 hover:text-black">Aluguel</Link>
              <Link href="/favoritos" className="text-gray-800 hover:text-black flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Favoritos
              </Link>
              <Link href="/sobre" className="text-gray-800 hover:text-black">Sobre</Link>
              <Link href="/contato" className="text-gray-800 hover:text-black">Contato</Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}