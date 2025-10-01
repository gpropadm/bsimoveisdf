'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useFavorites } from '@/hooks/useFavorites'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { favoritesCount } = useFavorites()

  // Determinar se estamos numa página que não tem hero section (fundo escuro)
  const isOnPageWithoutHero = pathname !== '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(isScrolled || isOnPageWithoutHero) ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <nav className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className={`text-3xl font-bold transition-colors ${(isScrolled || isOnPageWithoutHero) ? 'text-[#7162f0]' : 'text-white'}`}>
              All
            </span>
          </Link>

          {/* Desktop Navigation - Horizontal Menu - Centralizado */}
          <div
            className="hidden lg:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'transparent'
            }}
          >
            <Link
              href="/financiamento-imobiliario"
              className={`transition-colors font-medium ${(isScrolled || isOnPageWithoutHero) ? '' : 'text-white hover:text-gray-200'}`}
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : ''
              }}
              onMouseEnter={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#5240f7'
              }}
              onMouseLeave={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#7162f0'
              }}
            >
              Financiamento imobiliário
            </Link>
            <div className="relative group">
              <button
                className={`transition-colors font-medium flex items-center ${(isScrolled || isOnPageWithoutHero) ? '' : 'text-white hover:text-gray-200'}`}
                style={{
                  color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : ''
                }}
                onMouseEnter={(e) => {
                  if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#5f4fea'
                }}
                onMouseLeave={(e) => {
                  if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#7162f0'
                }}
              >
                Ajuda
                <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
            </div>
            <div className="relative group">
              <button
                className={`transition-colors font-medium flex items-center ${(isScrolled || isOnPageWithoutHero) ? '' : 'text-white hover:text-gray-200'}`}
                style={{
                  color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : ''
                }}
                onMouseEnter={(e) => {
                  if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#5f4fea'
                }}
                onMouseLeave={(e) => {
                  if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#7162f0'
                }}
              >
                Mais
                <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
            </div>
          </div>

          {/* Botões do lado direito */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/anunciar"
              className="px-6 py-2.5 border rounded-full font-semibold text-sm transition-all duration-300 hover:bg-opacity-20"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'white',
                borderColor: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = (isScrolled || isOnPageWithoutHero) ? 'white' : 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'white'
              }}
            >
              Anuncie seu Imóvel
            </Link>

            {/* Botão de Favoritos */}
            <Link
              href="/meus-favoritos"
              className="relative font-medium transition-colors flex items-center space-x-1"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'white'
              }}
              onMouseEnter={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#5f4fea'
              }}
              onMouseLeave={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#7162f0'
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              href="https://imobiliaria-six-tau.vercel.app/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? '#7162f0' : 'white'
              }}
              onMouseEnter={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#5f4fea'
              }}
              onMouseLeave={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = '#7162f0'
              }}
            >
              Entrar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div
            className="lg:hidden flex flex-col justify-center items-center w-6 h-6 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`block h-0.5 w-6 transition-all duration-200 ${(isScrolled || isOnPageWithoutHero) ? 'bg-gray-700' : 'bg-white'} ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block h-0.5 w-6 my-1 transition-all duration-200 ${isScrolled ? 'bg-gray-700' : 'bg-white'} ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block h-0.5 w-6 transition-all duration-200 ${(isScrolled || isOnPageWithoutHero) ? 'bg-gray-700' : 'bg-white'} ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </div>

          {/* Mobile Navigation */}
          <div className={`fixed top-0 left-0 w-full h-full bg-white lg:hidden transition-transform duration-300 z-40 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col pt-16 px-6 space-y-4">
              <Link href="https://imobiliaria-six-tau.vercel.app/" className="text-blue-600 font-medium py-2">
                Início
              </Link>
              <Link href="/meus-favoritos" className="text-blue-600 font-medium py-2">
                Meus Favoritos
              </Link>
              <Link href="/financiamento-imobiliario" className="text-blue-600 font-medium py-2">
                Financiamento imobiliário
              </Link>
              <button className="text-blue-600 font-medium py-2 text-left">
                Ajuda
              </button>
              <button className="text-blue-600 font-medium py-2 text-left">
                Mais
              </button>
              <Link
                href="/anunciar"
                className="mt-4 px-6 py-3 border-2 border-[#7162f0] text-[#7162f0] rounded-full font-semibold text-lg text-center transition-all duration-300 hover:bg-[#7162f0] hover:text-white"
              >
                Anuncie seu Imóvel
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}