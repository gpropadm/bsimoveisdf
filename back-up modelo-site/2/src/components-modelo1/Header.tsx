'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

interface HeaderProps {
  settings?: {
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
  // Fallback para valores padrão
  const safeSettings = settings || {
    contactPhone: '(48) 99864-5864',
    contactEmail: 'contato@faimoveis.com.br',
    contactWhatsapp: '5548998645864',
    city: 'Florianópolis',
    state: 'SC',
    socialFacebook: 'https://facebook.com',
    socialInstagram: 'https://instagram.com',
    siteName: 'FA IMÓVEIS'
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { favoritesCount } = useFavorites()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo + Menu Desktop */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"/>
                  <path d="M9 21V12H15V21"/>
                  <path d="M12 3V7"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-black font-display leading-none">
                  FA IMÓVEIS
                </span>
                <span className="text-xs text-gray-500 font-medium leading-none" style={{letterSpacing: '0.3em'}}>
                  imobiliária
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex space-x-6">
              <Link href="/" className="text-black font-medium hover:text-orange-500 transition-colors">Home</Link>
              <Link href="/imoveis" className="text-gray-800 hover:text-orange-500 transition-colors">Imóveis</Link>
              <Link href="/venda" className="text-gray-800 hover:text-orange-500 transition-colors">Venda</Link>
              <Link href="/aluguel" className="text-gray-800 hover:text-orange-500 transition-colors">Aluguel</Link>
              <Link href="/favoritos" className="text-gray-800 hover:text-orange-500 transition-colors flex items-center gap-1">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={favoritesCount > 0 ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={favoritesCount > 0 ? "text-red-500" : ""}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Favoritos
              </Link>
              <Link href="/contato" className="text-gray-800 hover:text-orange-500 transition-colors">Contato</Link>
            </nav>
          </div>
          
          {/* Right Side - WhatsApp + Hamburger */}
          <div className="flex items-center space-x-4">
            {/* WhatsApp Button */}
            <a href={`https://wa.me/${safeSettings.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
              </svg>
              <span className="text-sm font-medium">WhatsApp</span>
            </a>

            {/* Social Media Icons */}
            <div className="hidden sm:flex items-center space-x-2">
              {/* Instagram */}
              {safeSettings.socialInstagram && (
                <a href={safeSettings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-pink-500 transition-colors duration-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {safeSettings.socialFacebook && (
                <a href={safeSettings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-black hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/imoveis" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Imóveis</Link>
              <Link href="/venda" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Venda</Link>
              <Link href="/aluguel" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Aluguel</Link>
              <Link href="/favoritos" className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={favoritesCount > 0 ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={favoritesCount > 0 ? "text-red-500" : ""}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Favoritos
              </Link>
              <Link href="/contato" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Contato</Link>
              
              {/* Mobile WhatsApp Button */}
              <a href={`https://wa.me/${safeSettings.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 mx-3 mt-4 rounded-full transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.24c-.23.64-1.15 1.18-1.79 1.32-.43.09-.99.16-2.89-.63-2.29-.96-3.74-3.27-3.86-3.42-.11-.15-.95-1.26-.95-2.41s.59-1.71.8-1.94c.2-.23.44-.29.59-.29.15 0 .29 0 .42.01.13.01.31-.05.48.37.18.44.61 1.49.66 1.6.05.11.08.23.02.38-.06.15-.09.25-.18.38-.09.13-.19.29-.27.39-.09.1-.18.21-.08.41.1.2.45.74.96 1.2.66.6 1.21.79 1.39.88.18.09.29.08.39-.05.1-.13.43-.5.54-.68.11-.18.23-.15.38-.09.15.06.96.45 1.12.53.16.08.27.12.31.19.04.07.04.39-.19 1.03z"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>

              {/* Mobile Social Media Icons */}
              <div className="flex items-center justify-center space-x-6 mx-3 mt-4">
                {/* Instagram */}
                {safeSettings.socialInstagram && (
                  <a href={safeSettings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-pink-500 transition-colors duration-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}

                {/* Facebook */}
                {safeSettings.socialFacebook && (
                  <a href={safeSettings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}