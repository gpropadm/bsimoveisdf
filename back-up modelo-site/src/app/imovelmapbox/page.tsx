'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Header from '@/components/Header';
import FavoriteButton from '@/components/FavoriteButton';

// Token público do Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhc2lsaWFzaXRlIiwiYSI6ImNtZnlmejBtdjBkMHAybnBya3M4emxnYngifQ.el_VwlHFplJE5ODL9irNvQ';

interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  type: string;
  category: string;
  address?: string;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  latitude?: number;
  longitude?: number;
  images?: string[] | string;
}

export default function ImovelMapboxPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark' | '3d'>('streets');
  const [viewMode, setViewMode] = useState<'normal' | 'cluster' | 'heatmap'>('normal');
  const [showControls, setShowControls] = useState(false);
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000000 });
  const [searchRadius, setSearchRadius] = useState(2000);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);

  // Buscar propriedades
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties?limit=50');
        const result = await response.json();
        if (result) {
          setProperties(result);
          setFilteredProperties(result);
        }
      } catch (error) {
        console.error('Erro ao buscar propriedades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Função para obter imagens
  const getImages = (images: string[] | string | undefined): string[] => {
    if (!images) return ['/placeholder-house.jpg'];
    if (Array.isArray(images)) {
      return images.length > 0 ? images : ['/placeholder-house.jpg'];
    }
    try {
      const imageArray = JSON.parse(images);
      return Array.isArray(imageArray) && imageArray.length > 0 ? imageArray : ['/placeholder-house.jpg'];
    } catch {
      return ['/placeholder-house.jpg'];
    }
  };

  // Filtrar propriedades com coordenadas válidas
  const propertiesWithCoordinates = filteredProperties.filter(property =>
    property.latitude &&
    property.longitude &&
    !isNaN(property.latitude) &&
    !isNaN(property.longitude)
  );

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || loading || !showMap) return;

    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      '3d': 'mapbox://styles/mapbox/streets-v12'
    };

    // Centro no Brasil
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styles[mapStyle],
      center: [-46.6333, -23.5505],
      zoom: 6,
      pitch: mapStyle === '3d' ? 45 : 0,
      bearing: mapStyle === '3d' ? -17.6 : 0,
      antialias: true
    });

    // Controles básicos
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: false
    }), 'top-right');

    // Event listeners para busca por raio
    map.current.on('click', (e) => {
      if (viewMode === 'normal') {
        setSearchCenter([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    // Adicionar 3D buildings se for modo 3D
    if (mapStyle === '3d') {
      map.current.on('style.load', () => {
        if (!map.current!.getSource('composite')) return;

        map.current!.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [loading, showMap, mapStyle]);

  // Adicionar marcadores/camadas ao mapa baseado no modo
  useEffect(() => {
    if (!map.current || loading) return;

    // Limpar marcadores e layers existentes
    const markers = document.querySelectorAll('.mapbox-marker');
    markers.forEach(marker => marker.remove());

    // Remover layers existentes
    try {
      if (map.current.getLayer('properties-clusters')) map.current.removeLayer('properties-clusters');
      if (map.current.getLayer('properties-cluster-count')) map.current.removeLayer('properties-cluster-count');
      if (map.current.getLayer('properties-unclustered')) map.current.removeLayer('properties-unclustered');
      if (map.current.getLayer('properties-heatmap')) map.current.removeLayer('properties-heatmap');
      if (map.current.getLayer('search-radius-fill')) map.current.removeLayer('search-radius-fill');
      if (map.current.getLayer('search-radius-line')) map.current.removeLayer('search-radius-line');
      if (map.current.getSource('properties')) map.current.removeSource('properties');
      if (map.current.getSource('search-radius')) map.current.removeSource('search-radius');
    } catch (error) {
      // Ignore errors
    }

    // Filtrar propriedades por preço
    const filteredByPrice = propertiesWithCoordinates.filter(property =>
      property.price >= priceFilter.min && property.price <= priceFilter.max
    );

    // Filtrar por raio se houver centro de busca
    let finalProperties = filteredByPrice;
    if (searchCenter) {
      finalProperties = filteredByPrice.filter(property => {
        const distance = getDistance(searchCenter, [property.longitude!, property.latitude!]);
        return distance <= searchRadius;
      });
    }

    if (viewMode === 'normal') {
      // Modo normal - marcadores customizados
      finalProperties.forEach((property) => {
        const el = document.createElement('div');
        el.className = 'mapbox-marker';
        el.style.backgroundImage = 'url(/map-icons/perímetro-virtual.gif)';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        const images = getImages(property.images);
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 12px; min-width: 280px;">
            <p style="margin: 0 0 2px 0; font-size: 11px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
              ${property.category || 'Imóvel'}
            </p>
            <div style="display: flex; gap: 12px;">
              <div style="width: 120px; height: 80px; border-radius: 6px; overflow: hidden; flex-shrink: 0;">
                <img src="${images[0]}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #333; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${property.title}
                </h4>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.3;">
                  ${property.city} - ${property.state}
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #2563eb;">
                  ${formatPrice(property.price)}
                </p>
              </div>
            </div>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([property.longitude!, property.latitude!])
          .setPopup(popup)
          .addTo(map.current!);
      });
    } else {
      // Modos cluster/heatmap - usar GeoJSON
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: finalProperties.map(property => ({
          type: 'Feature' as const,
          properties: {
            id: property.id,
            title: property.title,
            price: property.price,
            type: property.type,
            category: property.category,
            city: property.city,
            state: property.state,
            slug: property.slug
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [property.longitude!, property.latitude!]
          }
        }))
      };

      map.current.addSource('properties', {
        type: 'geojson',
        data: geojsonData,
        cluster: viewMode === 'cluster',
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      if (viewMode === 'heatmap') {
        // Mapa de Calor
        map.current.addLayer({
          id: 'properties-heatmap',
          type: 'heatmap',
          source: 'properties',
          maxzoom: 15,
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'price'],
              0, 0,
              1000000, 0.5,
              10000000, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              15, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              15, 20
            ]
          }
        });
      } else if (viewMode === 'cluster') {
        // Clustering
        map.current.addLayer({
          id: 'properties-clusters',
          type: 'circle',
          source: 'properties',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10, '#f1f075',
              30, '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, 10,
              30, 30,
              50, 40
            ]
          }
        });

        map.current.addLayer({
          id: 'properties-cluster-count',
          type: 'symbol',
          source: 'properties',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        map.current.addLayer({
          id: 'properties-unclustered',
          type: 'circle',
          source: 'properties',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#4f2de8',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });

        // Click em clusters
        map.current.on('click', 'properties-clusters', (e) => {
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['properties-clusters']
          });
          const clusterId = features[0].properties!.cluster_id;
          (map.current!.getSource('properties') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (!err) {
                map.current!.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom: zoom || 10
                });
              }
            }
          );
        });
      }
    }

    // Adicionar círculo de raio se houver centro de busca
    if (searchCenter) {
      const circle = createRadiusCircle(searchCenter, searchRadius);

      map.current.addSource('search-radius', {
        type: 'geojson',
        data: circle
      });

      map.current.addLayer({
        id: 'search-radius-fill',
        type: 'fill',
        source: 'search-radius',
        paint: {
          'fill-color': '#4f2de8',
          'fill-opacity': 0.1
        }
      });

      map.current.addLayer({
        id: 'search-radius-line',
        type: 'line',
        source: 'search-radius',
        paint: {
          'line-color': '#4f2de8',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });
    }

    // Atualizar lista de propriedades filtradas
    setFilteredProperties(finalProperties);

  }, [propertiesWithCoordinates, loading, viewMode, priceFilter, searchCenter, searchRadius]);

  // Função para calcular distância entre dois pontos (em metros)
  const getDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371e3; // raio da Terra em metros
    const φ1 = point1[1] * Math.PI / 180;
    const φ2 = point2[1] * Math.PI / 180;
    const Δφ = (point2[1] - point1[1]) * Math.PI / 180;
    const Δλ = (point2[0] - point1[0]) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Função para criar círculo de raio
  const createRadiusCircle = (center: [number, number], radius: number) => {
    const options = { steps: 64 };
    const radiusKm = radius / 1000;

    const coordinates = [];
    for (let i = 0; i < options.steps; i++) {
      const angle = (i / options.steps) * 2 * Math.PI;
      const dx = radiusKm * Math.cos(angle);
      const dy = radiusKm * Math.sin(angle);
      coordinates.push([
        center[0] + dx / (111.32 * Math.cos(center[1] * Math.PI / 180)),
        center[1] + dy / 110.54
      ]);
    }
    coordinates.push(coordinates[0]); // Fechar o polígono

    return {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Polygon' as const,
          coordinates: [coordinates]
        }
      }]
    };
  };

  // Componente PropertyCard
  function PropertyCard({ property }: { property: Property }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = getImages(property.images);

    const nextImage = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <a
          href={`/imovel/${property.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {/* Imagem */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Navegação de imagens */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </>
            )}

            {/* Tipo e favorito */}
            <div className="absolute top-3 left-3">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                {property.type}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {property.title}
              </h3>
            </div>

            <p className="text-gray-600 text-sm mb-3">
              {property.city} - {property.state}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{property.category}</span>
              {property.bedrooms && property.bathrooms && (
                <span>{property.bedrooms}q • {property.bathrooms}b</span>
              )}
              {property.area && <span>{property.area}m²</span>}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24">
        <div className="flex h-[calc(100vh-120px)]">
          {/* Lista de Imóveis - Lado Esquerdo */}
          <div className={`${showMap ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white transition-all duration-300`}>
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                  <span className="text-sm text-blue-600 ml-2">(Mapbox)</span>
                </h1>

                {/* Controles */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowControls(!showControls)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                  >
                    ⚙️ Controles Avançados
                  </button>

                  <span className="text-sm text-gray-600 whitespace-nowrap">Mapa</span>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      showMap
                        ? 'border-gray-300 shadow-lg'
                        : 'bg-gradient-to-r from-gray-200 to-gray-300 border-gray-300'
                    }`}
                    style={showMap ? { backgroundColor: '#4f2de8' } : {}}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ring-0 ${
                        showMap ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Painel de Controles Avançados */}
              {showControls && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Recursos Exclusivos Mapbox</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Estilos de Mapa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🎨 Estilo do Mapa</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'streets', label: '🗺️ Ruas' },
                          { key: 'satellite', label: '🛰️ Satélite' },
                          { key: 'dark', label: '🌙 Escuro' },
                          { key: '3d', label: '🏢 3D' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setMapStyle(key as any)}
                            className={`p-2 text-xs rounded border-2 transition-colors ${
                              mapStyle === key
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Modo de Visualização */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📊 Visualização</label>
                      <div className="space-y-2">
                        {[
                          { key: 'normal', label: '📍 Normal', desc: 'Marcadores individuais' },
                          { key: 'cluster', label: '🎯 Cluster', desc: 'Agrupamento inteligente' },
                          { key: 'heatmap', label: '🌡️ Heatmap', desc: 'Mapa de calor por preço' }
                        ].map(({ key, label, desc }) => (
                          <button
                            key={key}
                            onClick={() => setViewMode(key as any)}
                            className={`w-full text-left p-2 rounded border transition-colors ${
                              viewMode === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="font-medium text-sm">{label}</div>
                            <div className="text-xs text-gray-600">{desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtros Avançados */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💰 Filtro de Preço: R$ {(priceFilter.min / 1000).toFixed(0)}k - R$ {(priceFilter.max / 1000).toFixed(0)}k
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="100000"
                          value={priceFilter.min}
                          onChange={(e) => setPriceFilter(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <input
                          type="range"
                          min="0"
                          max="10000000"
                          step="100000"
                          value={priceFilter.max}
                          onChange={(e) => setPriceFilter(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>

                      {/* Busca por Raio */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📍 Raio de Busca: {(searchRadius / 1000).toFixed(1)} km
                        </label>
                        <input
                          type="range"
                          min="500"
                          max="10000"
                          step="500"
                          value={searchRadius}
                          onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-600">
                            {searchCenter ? '✅ Centro definido' : '❌ Clique no mapa'}
                          </p>
                          {searchCenter && (
                            <button
                              onClick={() => setSearchCenter(null)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              🗑️ Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{properties.length}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{propertiesWithCoordinates.length}</div>
                        <div className="text-xs text-gray-600">Com GPS</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{filteredProperties.length}</div>
                        <div className="text-xs text-gray-600">Filtrados</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-600">{mapStyle}</div>
                        <div className="text-xs text-gray-600">Estilo</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 8h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2v6z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum imóvel encontrado</h3>
                  <p className="text-gray-500">
                    Mova ou aproxime o mapa para ver mais imóveis
                  </p>
                </div>
              ) : (
                <div className={`grid gap-6 pb-20 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mapa Mapbox - Lado Direito */}
          {showMap && (
            <div className="w-1/2 relative sticky top-0 h-[calc(100vh-120px)] bg-gray-200 transition-all duration-300">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando Mapbox...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div ref={mapContainer} className="w-full h-full" />

                  {/* Indicador Avançado */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-10 border border-gray-200">
                    <div className="text-sm font-medium text-gray-800 mb-2">
                      🗺️ Mapbox GL JS
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Modo:</span>
                        <span className="font-medium text-blue-600">
                          {viewMode === 'normal' && '📍 Normal'}
                          {viewMode === 'cluster' && '🎯 Cluster'}
                          {viewMode === 'heatmap' && '🌡️ Heatmap'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Estilo:</span>
                        <span className="font-medium text-purple-600">
                          {mapStyle === 'streets' && '🗺️ Ruas'}
                          {mapStyle === 'satellite' && '🛰️ Satélite'}
                          {mapStyle === 'dark' && '🌙 Escuro'}
                          {mapStyle === '3d' && '🏢 3D'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Visíveis:</span>
                        <span className="font-medium text-green-600">{filteredProperties.length}</span>
                      </div>
                      {searchCenter && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Raio:</span>
                          <span className="font-medium text-orange-600">{(searchRadius / 1000).toFixed(1)}km</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}