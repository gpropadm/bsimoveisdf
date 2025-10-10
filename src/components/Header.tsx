'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useFavorites } from '@/hooks/useFavorites'
import { useTheme } from '@/contexts/ThemeContext'
import AnunciarImovelModal from './AnunciarImovelModal'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBorderAnimation, setShowBorderAnimation] = useState(false)
  const [showAnunciarModal, setShowAnunciarModal] = useState(false)
  const pathname = usePathname()
  const { favoritesCount } = useFavorites()
  const { primaryColor } = useTheme()

  // Determinar se estamos numa página que não tem hero section (fundo escuro)
  const isOnPageWithoutHero = pathname !== '/'

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50
      setIsScrolled(scrolled)

      // Ativar animação sempre que rolar
      if (scrolled) {
        setShowBorderAnimation(true)
        setTimeout(() => setShowBorderAnimation(false), 700)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(isScrolled || isOnPageWithoutHero) ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <nav className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span
              className={`text-3xl font-bold transition-colors ${(isScrolled || isOnPageWithoutHero) ? '' : 'text-white'}`}
              style={{ color: (isScrolled || isOnPageWithoutHero) ? primaryColor : '' }}
            >
              BS Imóveis
            </span>
          </Link>


          {/* Botões do lado direito */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => setShowAnunciarModal(true)}
              className="px-6 py-2.5 border rounded-full font-semibold text-sm transition-all duration-300 hover:bg-opacity-20 cursor-pointer"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? primaryColor : 'white',
                borderColor: (isScrolled || isOnPageWithoutHero) ? primaryColor : 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = (isScrolled || isOnPageWithoutHero) ? primaryColor : 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = (isScrolled || isOnPageWithoutHero) ? 'white' : 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = (isScrolled || isOnPageWithoutHero) ? primaryColor : 'white'
              }}
            >
              Anuncie seu Imóvel
            </button>

            {/* Botão de Favoritos */}
            <Link
              href="/meus-favoritos"
              className="relative font-medium transition-colors flex items-center space-x-1"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? primaryColor : 'white'
              }}
              onMouseEnter={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = primaryColor
              }}
              onMouseLeave={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = primaryColor
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
              href="https://www.bsimoveisdf.com.br/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors"
              style={{
                color: (isScrolled || isOnPageWithoutHero) ? primaryColor : 'white'
              }}
              onMouseEnter={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = primaryColor
              }}
              onMouseLeave={(e) => {
                if (isScrolled || isOnPageWithoutHero) e.currentTarget.style.color = primaryColor
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
            <span className={`block h-0.5 w-6 transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} style={{ backgroundColor: (isScrolled || isOnPageWithoutHero) ? '#e0e0e0' : 'white' }}></span>
            <span className={`block h-0.5 w-6 my-1 transition-all duration-200 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} style={{ backgroundColor: isScrolled ? '#e0e0e0' : 'white' }}></span>
            <span className={`block h-0.5 w-6 transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ backgroundColor: (isScrolled || isOnPageWithoutHero) ? '#e0e0e0' : 'white' }}></span>
          </div>

          {/* Mobile Navigation */}
          <div className={`fixed top-0 left-0 w-full h-full bg-white lg:hidden transition-transform duration-300 z-40 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col pt-16 px-6 space-y-4">
              <Link href="/" className="text-blue-600 font-medium py-2">
                Início
              </Link>
              <Link href="/meus-favoritos" className="text-blue-600 font-medium py-2">
                Meus Favoritos
              </Link>
              <button
                onClick={() => {
                  setShowAnunciarModal(true)
                  setIsMenuOpen(false)
                }}
                className="mt-4 px-6 py-3 border-2 rounded-full font-semibold text-lg text-center transition-all duration-300 w-full cursor-pointer"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = primaryColor
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = primaryColor
                }}
              >
                Anuncie seu Imóvel
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated bottom border - só aparece quando rola */}
      {showBorderAnimation && (
        <div
          className="fixed left-0 right-0 h-1 bottom-border-slide"
          style={{
            top: isScrolled ? '72px' : '88px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}, ${primaryColor}, transparent)`,
            height: '2px',
            zIndex: 49
          }}
        />
      )}

      {/* Modal de Anunciar Imóvel */}
      <AnunciarImovelModal
        isOpen={showAnunciarModal}
        onClose={() => setShowAnunciarModal(false)}
      />
    </header>
    </>
  )
}