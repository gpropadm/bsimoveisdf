'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecommendedProperty {
  id: string;
  title: string;
  slug: string;
  price: number;
  type: 'venda' | 'aluguel';
  category: string;
  address: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string | null;
  aiScore: number;
  reasons: string[];
}

interface AIRecommendationsProps {
  currentPropertyId?: string;
}

export default function AIRecommendations({ currentPropertyId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams();
        if (currentPropertyId) {
          params.append('propertyId', currentPropertyId);
        }

        const response = await fetch(`/api/ai/recommendations?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setRecommendations(data.data);
          setAlgorithm(data.algorithm);
        }
      } catch (error) {
        console.error('Erro ao buscar recomendações IA:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentPropertyId]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#3c4858] mb-4">
              🤖 Recomendações Inteligentes
            </h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="animate-pulse">🤖</span>
            <span className="text-sm font-medium text-[#3c4858]">
              {algorithm} • IA Imobiliária
            </span>
          </div>

          <h2 className="text-3xl font-bold text-[#3c4858] mb-4">
            {currentPropertyId
              ? '✨ Imóveis Similares Recomendados'
              : '🎯 Imóveis Perfeitos Para Você'
            }
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentPropertyId
              ? 'Nossa IA analisou este imóvel e selecionou opções similares que podem te interessar'
              : 'Baseado em análise inteligente de mercado e preferências dos usuários'
            }
          </p>
        </div>

        {/* Grid de Recomendações */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((property) => {
            // Parse images
            let images: string[] = [];
            try {
              images = property.images ? JSON.parse(property.images) : [];
            } catch (e) {
              images = [];
            }
            const mainImage = images[0] || '/placeholder-property.jpg';

            return (
              <div key={property.id} className="group relative">
                {/* Score Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    🎯 {property.aiScore}% match
                  </div>
                </div>

                {/* Property Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={mainImage}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        property.type === 'venda'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}>
                        {property.type === 'venda' ? 'VENDA' : 'ALUGUEL'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* AI Reasons */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {property.reasons.map((reason, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-[#3c4858] mb-2 line-clamp-2">
                      {property.title}
                    </h3>

                    {/* Location */}
                    <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                      📍 {property.address}, {property.city}
                    </p>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          🛏️ {property.bedrooms}q
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          🚿 {property.bathrooms}b
                        </span>
                      )}
                      {property.area && (
                        <span className="flex items-center gap-1">
                          📏 {property.area}m²
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-2xl font-bold ${
                          property.type === 'venda' ? 'text-[#01AFAD]' : 'text-[#FF9702]'
                        }`}>
                          R$ {property.price.toLocaleString('pt-BR')}
                          {property.type === 'aluguel' && (
                            <span className="text-sm font-normal text-gray-600">/mês</span>
                          )}
                        </p>
                      </div>

                      <Link
                        href={`/imovel/${property.slug}`}
                        className="bg-gradient-to-r from-[#3c4858] to-gray-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="animate-pulse">🧠</span>
            <span>IA analisou {recommendations.length} propriedades para você</span>
          </div>
        </div>
      </div>
    </section>
  );
}