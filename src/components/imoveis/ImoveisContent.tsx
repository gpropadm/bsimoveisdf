'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MapaImoveis from './MapaImoveis'
import FavoriteButton from '@/components/FavoriteButton'
import { useMapContext } from '@/contexts/MapContext'
import LeadCaptureCard from '@/components/LeadCaptureCard'

interface Property {
  id: string
  title: string
  slug: string
  address?: string
  city: string
  state: string
  price: number
  type: string
  category?: string
  bedrooms?: number
  bathrooms?: number
  parking?: number
  area?: number
  totalArea?: number
  images?: string[] | string
  video?: string
  latitude?: number
  longitude?: number
  // Campos específicos para apartamentos
  suites?: number
  apartmentTotalArea?: number
  apartmentUsefulArea?: number
}


export default function ImoveisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [mapBounds, setMapBounds] = useState<any>(null)
  const { showMap } = useMapContext()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePropertyClick = (slug: string) => {
    router.push(`/imovel/${slug}`)
  }

  // Adaptar properties para o formato esperado pelo MapaImoveis
  const adaptPropertiesForMap = (properties: Property[]) => {
    return properties.map(property => ({
      id: parseInt(property.id) || 0,
      title: property.title,
      price: property.price,
      type: property.type,
      category: property.category || '',
      latitude: property.latitude,
      longitude: property.longitude,
      images: Array.isArray(property.images) ? JSON.stringify(property.images) : property.images,
      address: property.address,
      city: property.city,
      state: property.state,
      slug: property.slug
    }))
  }

  const fetchProperties = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      // Pegar parâmetros da URL
      const type = searchParams.get('type')
      const category = searchParams.get('category')
      const city = searchParams.get('city')
      const state = searchParams.get('state')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')

      if (type) params.append('type', type)
      if (category) params.append('category', category)
      if (city) params.append('city', city)
      if (state) params.append('state', state)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      params.append('limit', '50')

      const response = await fetch(`/api/properties?${params.toString()}`)
      const data = await response.json()

      setProperties(data)
      setFilteredProperties(data)
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error)
      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [searchParams])

  // Filtrar imóveis baseado nos bounds do mapa
  useEffect(() => {
    if (!mapBounds || properties.length === 0) {
      setFilteredProperties(properties)
      return
    }

    const filtered = properties.filter(property => {
      if (!property.latitude || !property.longitude) return false

      const lat = property.latitude
      const lng = property.longitude

      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      )
    })

    setFilteredProperties(filtered)
  }, [mapBounds, properties])

  const handleMapBoundsChange = (bounds: any) => {
    setMapBounds(bounds)
  }


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)]">
        <div className="w-1/2 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando imóveis...</p>
          </div>
        </div>
        <div className="w-1/2 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ArboCardStyleInjector />

      {/* CSS inline para esconder lista no mobile */}
      <style jsx>{`
        @media (max-width: 767px) {
          .lista-imoveis-mobile-hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex h-[calc(100vh-120px)]">
      {/* Lista de Imóveis - Lado Esquerdo */}
      <div className={`${showMap ? 'w-full md:w-1/2 lista-imoveis-mobile-hidden' : 'w-full'} overflow-y-auto bg-white transition-all duration-300`}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
              {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </h1>
          </div>

          {filteredProperties.length === 0 ? (
            <LeadCaptureCard
              searchParams={{
                type: searchParams.get('type') || undefined,
                category: searchParams.get('category') || undefined,
                city: searchParams.get('city') || undefined,
                state: searchParams.get('state') || undefined,
                priceMin: searchParams.get('minPrice') || undefined,
                priceMax: searchParams.get('maxPrice') || undefined
              }}
            />
          ) : (
            <div className={`grid gap-6 pb-20 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {filteredProperties.map((property) => (
                <ArboPropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handlePropertyClick}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mapa - Lado Direito - FULL WIDTH NO MOBILE */}
      {showMap && (
        <div className="w-full md:w-1/2 relative sticky top-0 h-[calc(100vh-120px)] bg-gray-200 transition-all duration-300">
          {properties.length > 0 ? (
            <MapaImoveis
              imoveis={adaptPropertiesForMap(properties)}
              selectedImovel={selectedProperty ? parseInt(selectedProperty) || 0 : null}
              onImovelSelect={(id: number) => setSelectedProperty(id.toString())}
              onBoundsChange={handleMapBoundsChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Carregando mapa...</div>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  )
}

// Componente ArboPropertyCard - copiado do PropertyStoriesSection
function ArboPropertyCard({ property, onViewDetails, formatPrice }: {
  property: Property
  onViewDetails: (slug: string) => void
  formatPrice: (price: number) => string
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getImages = (images: string[] | string | undefined): string[] => {
    if (!images) return ['/placeholder-house.jpg']

    if (Array.isArray(images)) {
      return images.length > 0 ? images : ['/placeholder-house.jpg']
    }

    try {
      const imageArray = JSON.parse(images)
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray : ['/placeholder-house.jpg']
    } catch {
      return ['/placeholder-house.jpg']
    }
  }

  const images = getImages(property.images)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }


  return (
    <li className="CarouselDefault_card__I_nK6">
      <div className="ImovelCard_card__2FVbS">
        <a
          href={`/imovel/${property.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
        >
          <div className="position-relative">
            <div style={{ width: '100%', height: '100%' }}>
              <picture>
                <div className="sc-jSUZER gvZxJM rec rec-carousel-wrapper">
                  <div className="sc-eDvSVe eTfUIS rec rec-carousel" style={{ height: '180px' }}>

                    {/* Left Arrow */}
                    {images.length > 1 && (
                      <div style={{ color: 'black' }}>
                        <div className="ImovelCard_leftArrow__SY2Vj">
                          <div
                            className="d-flex justify-content-center align-items-center c-pointer rounded-circle bg-white"
                            onClick={prevImage}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Slider Container */}
                    <div className="sc-dkrFOg itwfLR rec rec-slider-container">
                      <div
                        className="sc-hLBbgP gpusub rec rec-slider"
                        style={{
                          transition: '200ms ease',
                          display: 'flex',
                          transform: `translateX(-${currentImageIndex * 100}%)`
                        }}
                      >
                          {images.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="rec rec-carousel-item"
                              style={{
                                width: '100%',
                                flexShrink: 0,
                                height: '180px'
                              }}
                            >
                              <div
                                style={{ width: '100%', height: '180px', padding: '0px' }}
                                className="sc-gswNZR fUcWbd rec rec-item-wrapper"
                              >
                                <Image
                                  alt={`Foto do ${property.category || 'Imóvel'} - ${property.title}`}
                                  src={imageUrl}
                                  width={408}
                                  height={180}
                                  className="object-cover w-full h-full"
                                  loading="lazy"
                                  unoptimized
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-house.jpg'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Right Arrow */}
                    {images.length > 1 && (
                      <div style={{ color: 'black' }}>
                        <div className="ImovelCard_rightArrow__wzdqx">
                          <div
                            className="d-flex justify-content-center align-items-center c-pointer rounded-circle bg-white"
                            onClick={nextImage}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pagination Dots */}
                  {images.length > 1 && (
                    <div className="sc-iBYQkv gnDOZy rec rec-pagination">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => goToImage(index, e)}
                          className={`sc-gKPRtg ${
                            index === currentImageIndex ? 'goodpl rec rec-dot rec rec-dot_active' : 'hrBmXS rec rec-dot'
                          }`}
                          type="button"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </picture>
            </div>

            {/* Card Info */}
            <div className="ImovelCardInfo_info__QFwnz">
              <div className="ImovelCardInfo_paddingTopTypeOfPropertie__fiRBi">
                <div className="col-12 p-0">
                  <h2 className="col-12 p-0">
                    <div className="ImovelCardInfo_paddingBottomForTypeOfPropertie__XCT9C d-flex flex-row justify-content-between align-items-center">
                      <span className="ImovelCardInfo_colorOfTypePropertie__OWVB6 text-primitive-4">
                        {property.category || 'Casa'}
                      </span>
                      <FavoriteButton
                        propertyId={property.id}
                        size="small"
                        variant="card"
                      />
                    </div>
                    <span className="ImovelCardInfo_colorOfTitleCondominium__IfTu_ ImovelCardInfo_ellipsisOneLine__ryU_Q d-flex flex-row justify-content-start">
                      {property.title}
                    </span>
                  </h2>
                  <p className="ImovelCardInfo_colorOfLocalization__frnmZ mb-0">
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.address && `${property.address} - `}
                    </span>
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.city}
                    </span>
                    <br />
                    <span className="ImovelCardInfo_colorOfLocalization__frnmZ">
                      {property.city} - {property.state}
                    </span>
                  </p>
                </div>

                <div className="col-12 align-self-end p-0">
                  <div className="ImovelCardInfo_addLineBottom___ASjw">
                    <ul className="Icons_list__SlDEy">
                      {property.category === 'apartamento' ? (
                        <>
                          {/* Para apartamentos, mostrar área do apartamento */}
                          {(property.apartmentUsefulArea || property.area) && (
                            <li>
                              <span>{property.apartmentUsefulArea || property.area} m²</span>
                              <span></span>
                            </li>
                          )}
                          {property.bedrooms && (
                            <li>
                              <span>{property.bedrooms}</span>
                              <span>Quartos</span>
                            </li>
                          )}
                          {property.suites && (
                            <li>
                              <span>{property.suites}</span>
                              <span>Suítes</span>
                            </li>
                          )}
                          {property.bathrooms && (
                            <li>
                              <span>{property.bathrooms}</span>
                              <span>Banheiros</span>
                            </li>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Para casas e outros imóveis */}
                          {property.area && (
                            <li>
                              <span>{property.area} m²</span>
                              <span></span>
                            </li>
                          )}
                          {property.bedrooms && (
                            <li>
                              <span>{property.bedrooms}</span>
                              <span>Quartos</span>
                            </li>
                          )}
                          {property.bathrooms && (
                            <li>
                              <span>{property.bathrooms}</span>
                              <span>Banheiros</span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>

                  <h3 className="d-flex flex-row justify-content-start align-items-center">
                    <div className="ImovelCardInfo_prices__ArwZg ImovelCardInfo_widthSpace__o4SMY">
                      <div className="ImovelCardInfo_sizeOfPrices__SyQDF d-flex flex-column">
                        <div className="d-flex flex-row justify-content-between text-truncate">
                          <span className="property-type-label">{property.type === 'venda' ? 'Venda' : 'Aluguel'}</span>
                          <span className="ImovelCardInfo_sizeOfPriceSale__KE1ms d-flex flex-row text-truncate">
                            {formatPrice(property.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>

    </li>
  )
}

// Estilos CSS para o ArboPropertyCard
const arboCardStyles = `
  .CarouselDefault_card__I_nK6 {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ImovelCard_card__2FVbS {
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.3s ease;
  }


  .rec.rec-carousel-wrapper {
    position: relative;
    overflow: hidden;
  }

  .rec.rec-carousel {
    position: relative;
    overflow: hidden;
  }

  .ImovelCard_leftArrow__SY2Vj,
  .ImovelCard_rightArrow__wzdqx {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .ImovelCard_card__2FVbS:hover .ImovelCard_leftArrow__SY2Vj,
  .ImovelCard_card__2FVbS:hover .ImovelCard_rightArrow__wzdqx {
    opacity: 1;
  }

  .ImovelCard_leftArrow__SY2Vj {
    left: 10px;
  }

  .ImovelCard_rightArrow__wzdqx {
    right: 10px;
  }

  .ImovelCard_leftArrow__SY2Vj > div,
  .ImovelCard_rightArrow__wzdqx > div {
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: all 0.2s ease;
  }

  .ImovelCard_leftArrow__SY2Vj > div:hover,
  .ImovelCard_rightArrow__wzdqx > div:hover {
    background: white;
    transform: scale(1.1);
  }

  .rec.rec-slider-container {
    overflow: hidden;
    width: 100%;
  }

  .rec.rec-slider {
    display: flex;
    will-change: transform;
  }

  .rec.rec-carousel-item {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }

  .rec.rec-pagination {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    z-index: 10;
  }

  .rec.rec-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rec.rec-dot_active {
    background: white;
    transform: scale(1.2);
  }

  .ImovelCardInfo_info__QFwnz {
    padding: 16px;
  }

  .ImovelCardInfo_paddingTopTypeOfPropertie__fiRBi {
    padding-top: 8px;
  }

  .ImovelCardInfo_paddingBottomForTypeOfPropertie__XCT9C {
    padding-bottom: 8px;
  }

  .ImovelCardInfo_colorOfTypePropertie__OWVB6 {
    color: #666;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .ImovelCard_heartContent__U2wHd {
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .ImovelCard_heartContent__U2wHd:hover {
    color: #ff4757;
  }

  .ImovelCardInfo_colorOfTitleCondominium__IfTu_ {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
  }

  .ImovelCardInfo_ellipsisOneLine__ryU_Q {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ImovelCardInfo_colorOfLocalization__frnmZ {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }

  .ImovelCardInfo_addLineBottom___ASjw {
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }

  .Icons_list__SlDEy {
    display: flex;
    flex-direction: row;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
    justify-content: space-between;
  }

  .Icons_list__SlDEy li {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #666;
    flex: 1;
    text-align: center;
  }

  .Icons_list__SlDEy li span:first-child {
    font-size: 13px;
    font-weight: 400;
    color: #333;
    line-height: 1;
  }

  .Icons_list__SlDEy li span:last-child {
    font-size: 12px;
    font-weight: 400;
    color: #666;
    line-height: 1;
  }

  .ImovelCardInfo_prices__ArwZg {
    width: 100%;
  }

  .ImovelCardInfo_sizeOfPrices__SyQDF {
    width: 100%;
  }

  .ImovelCardInfo_sizeOfPriceSale__KE1ms {
    font-size: 16px;
    font-weight: 700;
    color: #555;
  }

  .property-type-label {
    color: #666;
  }

  .position-relative {
    position: relative;
  }

  .d-flex {
    display: flex;
  }

  .flex-row {
    flex-direction: row;
  }

  .flex-column {
    flex-direction: column;
  }

  .justify-content-center {
    justify-content: center;
  }

  .justify-content-between {
    justify-content: space-between;
  }

  .justify-content-start {
    justify-content: flex-start;
  }

  .align-items-center {
    align-items: center;
  }

  .align-self-end {
    align-self: flex-end;
  }

  .c-pointer {
    cursor: pointer;
  }

  .rounded-circle {
    border-radius: 50%;
  }

  .bg-white {
    background-color: white;
  }

  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-12 {
    width: 100%;
  }

  .p-0 {
    padding: 0;
  }

  .mb-0 {
    margin-bottom: 0;
  }

  .text-primitive-4 {
    color: #666;
  }

`;

// Componente para injetar os estilos
function ArboCardStyleInjector() {
  return (
    <style jsx global>
      {arboCardStyles}
    </style>
  );
}

// Adicionar o injetor de estilos ao componente principal
export { ArboCardStyleInjector }