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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(isScrolled || isOnPageWithoutHero) ? 'bg-white' : 'bg-transparent'}`}>
      <nav className={`container mx-auto px-4 transition-all duration-300 ${isScrolled ? 'py-6' : 'py-6'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 143" className="h-8 w-auto">
              <path d="M41.257 37.516c-7.546 0-23.694 1.359-30.184 1.963l-.15 21.297c8.753-.906 22.788-1.51 34.56-1.51 11.922 0 18.41 7.703 18.41 17.822v.756H43.672C18.771 77.844.51 86.15.51 109.26v1.511c0 21.146 15.243 31.718 35.315 31.718 5.885 0 11.62-.906 15.997-2.869 3.169-1.36 5.584-3.021 7.244-4.532 1.66-1.661 3.47-3.776 4.829-6.192v9.817H88.04V77.391c-.15-27.641-17.355-39.876-46.784-39.876zm22.486 66.458c-.755 11.328-7.697 19.182-20.525 19.182-11.318 0-18.26-6.344-18.26-15.255 0-9.365 8.15-15.255 18.26-15.255h20.827l-.302 11.328zm47.689-27.339v62.229h24.298V76.182c0-12.234 6.942-17.219 17.808-17.219 3.773 0 9.055.151 14.186.605V37.364h-10.715c-29.731 0-45.577 12.084-45.577 39.271zm244.786-39.12c-31.844 0-54.179 20.844-54.179 52.412 0 32.474 21.128 52.562 53.575 52.562 31.994 0 54.028-20.239 54.028-52.109-.151-32.172-21.883-52.864-53.424-52.864zm-.604 83.678c-17.204 0-28.07-12.688-28.07-31.266 0-18.578 11.62-31.266 28.07-31.266 17.204 0 28.825 13.443 28.825 31.266 0 18.125-10.413 31.266-28.825 31.266zM245.295 37.516c-16.601 0-28.523 7.25-35.013 19.786V.51h-24.901v138.354h24.448v-12.989c7.093 10.271 18.714 16.614 33.655 16.614 28.674 0 46.633-22.505 46.633-53.015 0-29.906-17.808-51.959-44.822-51.959zm-7.999 83.677c-15.242 0-27.467-11.329-27.467-27.339v-7.099c0-17.068 12.526-28.094 27.92-28.094 17.204 0 27.014 12.235 27.014 30.813s-11.319 31.719-27.467 31.719z" fill={(isScrolled || isOnPageWithoutHero) ? "#7162f0" : "white"}></path>
            </svg>
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
              href="/login"
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
              <Link href="/" className="text-blue-600 font-medium py-2">
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