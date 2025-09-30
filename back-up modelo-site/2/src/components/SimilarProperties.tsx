'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'

interface Property {
  id: string
  title: string
  slug: string
  city: string
  state: string
  price: number
  type: string
  images?: string[] | string
  category?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  totalArea?: number
  parking?: number
  video?: string
}

interface SimilarPropertiesProps {
  currentPropertyId: string
  city: string
  state: string
  address?: string
  price: number
  type: string
  category?: string
  bedrooms?: number
  showAsSlider?: boolean
  limit?: number
  showTitle?: boolean
}

export default function SimilarProperties({
  currentPropertyId,
  city,
  state,
  address,
  price,
  type,
  category,
  bedrooms,
  limit = 4
}: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        const params = new URLSearchParams({
          city: city,
          state: state,
          price: price.toString(),
          type: type,
          exclude: currentPropertyId
        })

        if (address) params.append('address', address)
        if (category) params.append('category', category)
        if (bedrooms !== undefined && bedrooms > 0) params.append('bedrooms', bedrooms.toString())

        const response = await fetch(`/api/properties/similar?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          setProperties(data.slice(0, limit))
        }
      } catch (error) {
        console.error('Erro ao buscar imóveis similares:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProperties()
  }, [currentPropertyId, city, state, address, price, type, category, bedrooms, limit])

  const SkeletonCards = () => (
    <div>
      <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-0.5"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-0.5"></div>
              <div className="flex justify-between items-center mb-0.5">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-1.5"></div>
              <div className="flex space-x-4 mb-4">
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-14 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <SkeletonCards />
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return null
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePropertyClick = (slug: string) => {
    window.location.href = `/imovel/${slug}`
  }

  return (
    <div className="pt-2 pb-8 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-2 text-left">Você poderá gostar dessas opções!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <ArboPropertyCard key={property.id} property={property} onViewDetails={handlePropertyClick} formatPrice={formatPrice} />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Arbo Property Card Styles */
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

        .ImovelCard_card__2FVbS:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transform: translateY(-2px);
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
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .Icons_list__SlDEy li span:last-child {
          font-size: 13px;
          font-weight: 400;
          color: #666;
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
      `}</style>
    </div>
  )
}

// Componente ArboPropertyCard - fiel ao código da Arbo
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
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onViewDetails(property.slug)
          }}
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
                      {property.area && (
                        <li>
                          <span>{property.area} m²</span>
                          <span>Útil</span>
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