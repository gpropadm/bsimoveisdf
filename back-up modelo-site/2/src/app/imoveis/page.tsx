'use client'

import { Suspense } from 'react'
import Header from '@/components/Header'
import FilterBar from '@/components/imoveis/FilterBar'
import ImoveisContent from '@/components/imoveis/ImoveisContent'
import { MapProvider } from '@/contexts/MapContext'

export default function ImoveisPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <Suspense fallback={<div className="p-4 pt-20">Carregando...</div>}>
          <MapProvider>
            <div className="pt-24">
              <FilterBar />
            </div>
            <ImoveisContent />
          </MapProvider>
        </Suspense>
      </main>
    </div>
  )
}