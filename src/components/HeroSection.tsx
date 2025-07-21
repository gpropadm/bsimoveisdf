'use client'

import Image from 'next/image'
import SearchBar from './SearchBar'

export default function HeroSection() {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1593696140826-c58b021acf8b?auto=format&fit=crop&q=60&crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzUzMDUwNjc1fA&ixlib=rb-4.1.0"
          alt="Mesa e cadeiras de madeira preta e branca - ImobiNext"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Search Bar */}
        <SearchBar />
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l3 3 7-7"/>
          <path d="M12 17V3"/>
        </svg>
      </div>
    </section>
  )
}