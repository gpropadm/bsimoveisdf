'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SmartAnalytics {
  topPerformingProperties: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    type: string;
    city: string;
    views: number;
    trend: 'up' | 'down' | 'stable';
    score: number;
  }>;
  leadAnalytics: {
    conversionRate: number;
    averageResponseTime: number;
    hotLeads: number;
    leadSources: Array<{
      source: string;
      count: number;
      percentage: number;
    }>;
  };
  intelligentAlerts: Array<{
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    actionRequired: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
  marketInsights: {
    averagePrice: number;
    pricePerM2: number;
    mostPopularCategory: string;
    bestPerformingCity: string;
    recommendations: string[];
  };
  realTimeMetrics: {
    activeVisitors: number;
    propertiesViewedToday: number;
    newLeadsToday: number;
    conversionToday: number;
  };
}

export default function SmartDashboard() {
  const [analytics, setAnalytics] = useState<SmartAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchSmartAnalytics();

    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchSmartAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSmartAnalytics = async () => {
    try {
      const response = await fetch('/api/dashboard/smart-analytics');
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
        setLastUpdate(new Date(data.timestamp).toLocaleTimeString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Inteligente */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🧠 Dashboard Inteligente</h2>
            <p className="opacity-90">IA analisando performance em tempo real</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{analytics.realTimeMetrics.activeVisitors}</div>
            <div className="text-sm opacity-90">visitantes online agora</div>
          </div>
        </div>

        <div className="mt-4 text-xs opacity-75">
          Última atualização: {lastUpdate} • SmartAnalytics v2.0
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visualizações Hoje</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.realTimeMetrics.propertiesViewedToday}
              </p>
            </div>
            <div className="text-2xl">👀</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Novos Leads Hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.realTimeMetrics.newLeadsToday}
              </p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.leadAnalytics.conversionRate}%
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leads Quentes</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.leadAnalytics.hotLeads}
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {analytics.intelligentAlerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🚨 Alertas Inteligentes
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              {analytics.intelligentAlerts.filter(a => a.actionRequired).length} requerem ação
            </span>
          </h3>

          <div className="space-y-3">
            {analytics.intelligentAlerts.map((alert, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{alert.title}</h4>
                    <p className="text-sm opacity-90">{alert.message}</p>
                    {alert.actionRequired && (
                      <div className="mt-2">
                        <span className="text-xs bg-white/50 px-2 py-1 rounded">
                          ⚡ Ação necessária
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs opacity-75 uppercase">
                    {alert.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🏆 Imóveis Mais Visualizados
          </h3>

          <div className="space-y-3">
            {analytics.topPerformingProperties.map((property, index) => (
              <div key={property.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/imovel/${property.slug}`} className="hover:underline">
                    <p className="font-medium text-gray-900 truncate">{property.title}</p>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {property.city} • R$ {property.price.toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <span>{getTrendIcon(property.trend)}</span>
                    <span className="font-medium">{property.views}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Score: {property.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💡 Insights de Mercado
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {Math.round(analytics.marketInsights.averagePrice / 1000)}K
                </div>
                <div className="text-xs text-blue-800">Preço Médio</div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  R$ {Math.round(analytics.marketInsights.pricePerM2)}
                </div>
                <div className="text-xs text-green-800">Por m²</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">🏠 Categoria top:</span> {analytics.marketInsights.mostPopularCategory}
              </p>
              <p className="text-sm">
                <span className="font-medium">📍 Cidade destaque:</span> {analytics.marketInsights.bestPerformingCity}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">🎯 Recomendações da IA:</h4>
              <div className="space-y-1">
                {analytics.marketInsights.recommendations.slice(0, 3).map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Origem dos Leads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.leadAnalytics.leadSources.map((source, index) => (
            <div key={index} className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">
                {source.source === 'site' ? '🌐' :
                 source.source === 'whatsapp' ? '📱' :
                 source.source === 'facebook' ? '📘' : '📞'}
              </div>
              <div className="font-bold text-xl">{source.count}</div>
              <div className="text-sm text-gray-600 capitalize">{source.source}</div>
              <div className="text-xs text-gray-500">{source.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}