'use client'

import { useSettings } from '@/hooks/useSettings'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SellRentPropertySection from '@/components/SellRentPropertySection'

export default function AnunciarPage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header settings={settings} />
      
      <main className="pt-20">
        <SellRentPropertySection />
      </main>

      <Footer />
    </div>
  )
}