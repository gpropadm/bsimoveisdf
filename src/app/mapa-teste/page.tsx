'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token público do Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhc2lsaWFzaXRlIiwiYSI6ImNtZnlmejBtdjBkMHAybnBya3M4emxnYngifQ.el_VwlHFplJE5ODL9irNvQ';

interface Property {
  id: string;
  title: string;
  slug: string;
  price: number;
  type: 'VENDA' | 'ALUGUEL';
  category: string;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  coordinates: [number, number]; // [longitude, latitude]
  image: string | null;
}

export default function MapaTestePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedType, setSelectedType] = useState<'ALL' | 'VENDA' | 'ALUGUEL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar propriedades da API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties/map');
        const result = await response.json();

        if (result.success) {
          setProperties(result.data);
        } else {
          console.error('Erro ao buscar propriedades:', result.error);
        }
      } catch (error) {
        console.error('Erro ao buscar propriedades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || loading) return;

    // Determinar centro do mapa
    let center: [number, number] = [-46.6333, -23.5505]; // São Paulo (centro do Brasil)
    let zoom = 5; // Zoom mais amplo

    if (properties.length > 0) {
      // Calcular centro baseado em todas as propriedades
      const lats = properties.map(p => p.coordinates[1]);
      const lngs = properties.map(p => p.coordinates[0]);
      center = [
        lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length,
        lats.reduce((sum, lat) => sum + lat, 0) / lats.length
      ];
      zoom = 6; // Zoom médio para ver múltiplas propriedades
    }

    console.log(`🗺️ Initializing map at center:`, center, `zoom:`, zoom);

    // Inicializar o mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom
    });

    // Adicionar controles de navegação
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [loading, properties]);

  useEffect(() => {
    if (!map.current || loading) return;

    // Filtrar propriedades
    const filteredProperties = properties.filter(property => {
      const typeMatch = selectedType === 'ALL' || property.type === selectedType;
      const cityMatch = selectedCity === 'ALL' || property.city === selectedCity;

      // Debug logs
      console.log(`Property: ${property.title}`);
      console.log(`Type: "${property.type}" vs Selected: "${selectedType}" = ${typeMatch}`);
      console.log(`City: "${property.city}" vs Selected: "${selectedCity}" = ${cityMatch}`);
      console.log(`Match: ${typeMatch && cityMatch}\n`);

      return typeMatch && cityMatch;
    });

    // Remover marcadores existentes
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    console.log(`🗺️ Total filtered properties: ${filteredProperties.length}`);

    // Adicionar novos marcadores
    filteredProperties.forEach((property, index) => {
      console.log(`📍 Adding marker ${index + 1}:`, property.title, property.coordinates);
      // Criar elemento customizado para o marcador
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = property.type === 'VENDA' ? '#01AFAD' : '#FF9702';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      // Criar popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 12px; min-width: 220px;">
          ${property.image ? `<img src="${property.image}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">` : ''}
          <h3 style="margin: 0 0 8px 0; color: #3c4858; font-size: 16px; font-weight: 600;">
            ${property.title}
          </h3>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>📍</strong> ${property.address}, ${property.city}
          </p>
          <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
            <strong>🏠</strong> ${property.category} ${property.bedrooms ? `• ${property.bedrooms} quartos` : ''} ${property.bathrooms ? `• ${property.bathrooms} banheiros` : ''}
          </p>
          ${property.area ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;"><strong>📏</strong> ${property.area}m²</p>` : ''}
          <p style="margin: 0 0 8px 0; color: ${property.type === 'VENDA' ? '#01AFAD' : '#FF9702'}; font-size: 18px; font-weight: 700;">
            R$ ${property.price.toLocaleString('pt-BR')} ${property.type === 'ALUGUEL' ? '/mês' : ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="
              background: ${property.type === 'VENDA' ? '#01AFAD' : '#FF9702'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">
              ${property.type}
            </span>
            <a href="/imovel/${property.slug}" target="_blank" style="
              background: #3c4858;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              text-decoration: none;
              font-weight: 600;
            ">
              Ver detalhes
            </a>
          </div>
        </div>
      `);

      // Adicionar marcador ao mapa
      new mapboxgl.Marker(el)
        .setLngLat(property.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [selectedType, selectedCity, properties, loading]);

  const cities = ['ALL', ...Array.from(new Set(properties.map(p => p.city)))];
  const filteredPropertiesCount = properties.filter(p => {
    const typeMatch = selectedType === 'ALL' || p.type === selectedType;
    const cityMatch = selectedCity === 'ALL' || p.city === selectedCity;
    return typeMatch && cityMatch;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#3c4858]">
            🗺️ Teste Mapbox - Imóveis no Mapa
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize propriedades no mapa com filtros interativos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Negócio
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01AFAD] focus:border-[#01AFAD]"
              >
                <option value="ALL">Todos</option>
                <option value="VENDA">Venda</option>
                <option value="ALUGUEL">Aluguel</option>
              </select>
            </div>

            {/* Filtro por cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#01AFAD] focus:border-[#01AFAD]"
                disabled={loading}
              >
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city === 'ALL' ? 'Todas as cidades' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Contador */}
            <div className="flex items-end">
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-600">
                  {loading ? 'Carregando...' : `${filteredPropertiesCount} propriedades encontradas`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01AFAD] mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando propriedades...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-lg">📍 Nenhuma propriedade encontrada com coordenadas GPS</p>
              <p className="text-gray-500 mt-2">Adicione coordenadas às propriedades para vê-las no mapa</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </div>

      {/* Instruções */}
      <div className="bg-green-50 border-t border-green-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-sm text-green-800">
            <strong>✅ Mapa ativo!</strong> Token Mapbox configurado. Clique nos marcadores para ver detalhes das propriedades.
            <span className="ml-4 text-green-600">
              🔵 Azul = Venda | 🟠 Laranja = Aluguel
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}