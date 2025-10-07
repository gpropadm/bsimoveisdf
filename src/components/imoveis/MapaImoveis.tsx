'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useTheme } from '@/contexts/ThemeContext'

// Importação dinâmica para evitar problemas de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
// Hook será importado diretamente no componente MapEventHandler

// Configuração dos ícones personalizados do Leaflet
const createCustomIcons = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet')

    const createPropertyIcon = (type: string, color: string, price: number) => {
      return L.icon({
        iconUrl: '/map-icons/perímetro-virtual.gif',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      })
    }

    return { createPropertyIcon }
  }
  return { createPropertyIcon: () => null }
}

interface Imovel {
  id: number
  title: string
  price: number
  type: string
  category: string
  latitude?: number
  longitude?: number
  images?: string
  address?: string
  city?: string
  state?: string
  slug?: string
}
interface MapaImoveisProps {
  imoveis: Imovel[]
  selectedImovel?: number | null
  onImovelSelect?: (id: number) => void
  onBoundsChange?: (bounds: any) => void
}

// Componente dinâmico para eventos do mapa
const MapEventHandler = dynamic(() =>
  import('react-leaflet').then(mod => {
    const { useMapEvents } = mod

    const Component = ({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) => {
      const map = useMapEvents({
        moveend: () => {
          if (onBoundsChange) {
            const bounds = map.getBounds()
            const boundsObj = {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            }
            onBoundsChange(boundsObj)
          }
        },
        zoomend: () => {
          if (onBoundsChange) {
            const bounds = map.getBounds()
            const boundsObj = {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            }
            onBoundsChange(boundsObj)
          }
        }
      })

      return null
    }

    Component.displayName = 'MapEventHandler'
    return Component
  }),
  { ssr: false }
)

export default function MapaImoveis({ imoveis, selectedImovel, onImovelSelect, onBoundsChange }: MapaImoveisProps) {
  const { primaryColor } = useTheme()
  const [isClient, setIsClient] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const [shouldUpdateMap, setShouldUpdateMap] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewProperty, setPreviewProperty] = useState<Imovel | null>(null)
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })
  const prevImoveisRef = useRef<Imovel[]>([])
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Atualizar mapa quando imóveis mudarem
  useEffect(() => {
    if (JSON.stringify(prevImoveisRef.current) !== JSON.stringify(imoveis)) {
      prevImoveisRef.current = imoveis
      setShouldUpdateMap(true)

      // Reset flag após um breve delay
      const timer = setTimeout(() => {
        setShouldUpdateMap(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [imoveis])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-600 mb-2">🗺️</div>
          <div className="text-blue-800">Carregando mapa...</div>
        </div>
      </div>
    )
  }

  // Fallback se houver erro nos imports dinâmicos
  if (!MapContainer || !TileLayer || !Marker) {
    return (
      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-600 mb-2">🗺️</div>
          <div className="text-blue-800">Mapa temporariamente indisponível</div>
        </div>
      </div>
    )
  }

  // Filtrar imóveis com coordenadas válidas
  const imoveisComCoordenadas = imoveis.filter(imovel =>
    imovel.latitude &&
    imovel.longitude &&
    !isNaN(imovel.latitude) &&
    !isNaN(imovel.longitude)
  )

  // Configuração do mapa
  const mapConfig = {
    center: imoveisComCoordenadas.length > 0
      ? [imoveisComCoordenadas[0].latitude!, imoveisComCoordenadas[0].longitude!]
      : [-23.5505, -46.6333], // São Paulo como fallback
    zoom: 12
  }

  const MapUpdater = ({ imoveis, shouldUpdate }: { imoveis: Imovel[], shouldUpdate: boolean }) => {
    return null
  }

  // Funções para o preview
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const getPropertyImage = (images: string | undefined): string => {
    console.log('Raw images data:', images)

    if (!images) {
      console.log('No images, using placeholder')
      return '/placeholder-house.jpg'
    }

    // Se já é uma string de URL válida
    if (typeof images === 'string' && (images.startsWith('http') || images.startsWith('/'))) {
      console.log('Direct image URL:', images)
      return images
    }

    try {
      const imageArray = JSON.parse(images)
      console.log('Parsed image array:', imageArray)
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray[0] : '/placeholder-house.jpg'
    } catch (error) {
      console.log('Parse error:', error, 'for images:', images)
      return '/placeholder-house.jpg'
    }
  }

  const handleMarkerMouseEnter = (imovel: Imovel, event: any) => {
    // Cancela qualquer timeout pendente
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    const containerPoint = event.target.getElement()
    const rect = containerPoint.getBoundingClientRect()

    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setPreviewProperty(imovel)
    setShowPreview(true)
  }

  const handleMarkerMouseLeave = () => {
    // Delay antes de fechar para permitir mover mouse para o tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setShowPreview(false)
      setPreviewProperty(null)
    }, 300)
  }

  const handlePreviewMouseEnter = () => {
    // Cancela o fechamento quando mouse entra no preview
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handlePreviewMouseLeave = () => {
    // Fecha imediatamente quando mouse sai do preview
    setShowPreview(false)
    setPreviewProperty(null)
  }

  return (
    <div className="w-full h-full relative">
      {/* Link para CSS do Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <MapContainer
        key={mapKey}
        center={mapConfig.center as [number, number]}
        zoom={mapConfig.zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventHandler onBoundsChange={onBoundsChange} />
        <MapUpdater imoveis={imoveisComCoordenadas} shouldUpdate={shouldUpdateMap} />

        {/* Marcadores dos imóveis */}
        {imoveisComCoordenadas.map((imovel) => {
          const customIcon = createCustomIcons().createPropertyIcon(
            imovel.type || 'venda',
            '#4f2de8',
            imovel.price || 0
          )

          return (
            <Marker
              key={`${imovel.id}-${mapKey}`}
              position={[imovel.latitude!, imovel.longitude!]}
              icon={customIcon}
              eventHandlers={{
                mouseover: (event) => {
                  handleMarkerMouseEnter(imovel, event)
                },
                mouseout: () => {
                  handleMarkerMouseLeave()
                }
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 max-w-xs">
                  <div className="font-semibold text-sm mb-1">{imovel.title}</div>
                  <div className="text-xs text-gray-600 mb-2">
                    {imovel.city} - {imovel.category}
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    R$ {imovel.price?.toLocaleString('pt-BR')}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Indicador de imóveis */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm z-10">
        <div className="text-sm font-medium text-gray-700">
          {imoveisComCoordenadas.length} {imoveisComCoordenadas.length === 1 ? 'imóvel' : 'imóveis'} no mapa
        </div>
      </div>

      {/* Preview Tooltip */}
      {showPreview && previewProperty && typeof window !== 'undefined' && createPortal(
        <div
          className="map-preview-tooltip"
          style={{
            position: 'fixed',
            left: previewPosition.x,
            top: previewPosition.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        >
          <div className="preview-content">
            <div className="preview-image">
              <Image
                src={getPropertyImage(previewProperty.images)}
                alt={previewProperty.title}
                width={120}
                height={80}
                className="object-cover w-full h-full rounded"
                unoptimized
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/placeholder-house.jpg'
                }}
              />
            </div>
            <div className="preview-info">
              <p className="preview-category">{previewProperty.category || 'Imóvel'}</p>
              <h4 className="preview-title">{previewProperty.title}</h4>
              <p className="preview-location">{previewProperty.city} - {previewProperty.state}</p>
              <p className="preview-price">{formatPrice(previewProperty.price)}</p>
              <a
                href={`/imovel/${previewProperty.slug || previewProperty.id}`}
                className="preview-button"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Ver detalhes
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        .map-preview-tooltip {
          animation: fadeIn 0.2s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -100%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }

        .preview-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          padding: 12px;
          display: flex;
          gap: 12px;
          min-width: 280px;
          border: 1px solid #e1e1e1;
          position: relative;
        }

        .preview-content::before {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
        }

        .preview-image {
          width: 120px;
          height: 80px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .preview-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .preview-category {
          font-size: 11px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          letter-spacing: 0.5px;
        }

        .preview-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .preview-location {
          font-size: 12px;
          color: #666;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .preview-price {
          font-size: 14px;
          font-weight: 700;
          color: #2563eb;
          margin: 0 0 8px 0;
        }

        .preview-button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          background: ${primaryColor};
          color: white;
          text-align: center;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .preview-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}