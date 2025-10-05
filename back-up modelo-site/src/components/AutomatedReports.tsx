'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  period: string;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  averagePrice: number;
  bestPerformingProperties: Array<{
    id: string;
    title: string;
    price: number;
    views: number;
    leads: number;
    city: string;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  priceInsights: {
    averagePriceByCategory: Array<{
      category: string;
      avgPrice: number;
      count: number;
    }>;
    averagePriceByCity: Array<{
      city: string;
      avgPrice: number;
      count: number;
    }>;
  };
  marketTrends: {
    priceGrowth: number;
    demandTrend: string;
    topCategories: string[];
    recommendations: string[];
  };
}

export default function AutomatedReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedView, setSelectedView] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    generateReport();
  }, [selectedPeriod]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/generate?period=${selectedPeriod}&type=general`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const downloadReport = () => {
    if (!reportData) return;

    const csvContent = `
Relatório Imobiliário - ${reportData.period}
Gerado em: ${new Date().toLocaleString('pt-BR')}

VISÃO GERAL:
Total de Imóveis,${reportData.totalProperties}
Imóveis Ativos,${reportData.activeProperties}
Imóveis Vendidos,${reportData.soldProperties}
Total de Visualizações,${reportData.totalViews}
Total de Leads,${reportData.totalLeads}
Taxa de Conversão,${reportData.conversionRate}%
Preço Médio,${formatCurrency(reportData.averagePrice)}

MELHORES IMÓVEIS:
Título,Preço,Visualizações,Leads,Cidade
${reportData.bestPerformingProperties.map(prop =>
  `"${prop.title}",${formatCurrency(prop.price)},${prop.views},${prop.leads},${prop.city}`
).join('\n')}

ORIGEM DOS LEADS:
Fonte,Quantidade,Porcentagem
${reportData.leadsBySource.map(source =>
  `${source.source},${source.count},${source.percentage.toFixed(1)}%`
).join('\n')}

RECOMENDAÇÕES IA:
${reportData.marketTrends.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${selectedPeriod}-dias.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Relatórios Automáticos</h2>
            <p className="opacity-90">
              Análise inteligente dos últimos {reportData.period} com IA
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{reportData.totalLeads}</div>
            <div className="text-sm opacity-90">leads gerados</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white border-0 rounded px-3 py-1 text-sm"
            >
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>

            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="bg-white/20 text-white border-0 rounded px-3 py-1 text-sm"
            >
              <option value="overview">Visão Geral</option>
              <option value="sales">Vendas</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateReport}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              🔄 Atualizar
            </button>
            <button
              onClick={downloadReport}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              📥 Download CSV
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs opacity-75">
          Última atualização: {lastUpdate} • Powered by IA
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Imóveis Ativos</p>
              <p className="text-2xl font-bold text-blue-600">{reportData.activeProperties}</p>
            </div>
            <div className="text-2xl">🏠</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {reportData.totalProperties} total
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vendas</p>
              <p className="text-2xl font-bold text-green-600">{reportData.soldProperties}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Taxa: {reportData.conversionRate}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visualizações</p>
              <p className="text-2xl font-bold text-purple-600">{reportData.totalViews.toLocaleString()}</p>
            </div>
            <div className="text-2xl">👀</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {Math.round(reportData.totalViews / reportData.totalProperties)} por imóvel
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(reportData.averagePrice).replace('R$', 'R$').replace('.000', 'K')}
              </p>
            </div>
            <div className="text-2xl">💲</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Tendência: {reportData.marketTrends.priceGrowth > 0 ? '📈' : '📉'} {reportData.marketTrends.priceGrowth.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Melhores Imóveis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🏆 Melhores Imóveis
          </h3>

          <div className="space-y-3">
            {reportData.bestPerformingProperties.map((property, index) => (
              <div key={property.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{property.title}</p>
                  <p className="text-sm text-gray-600">
                    {property.city} • {formatCurrency(property.price)}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <div className="font-medium">{property.views} views</div>
                  <div className="text-gray-500">{property.leads} leads</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Origem dos Leads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Origem dos Leads
          </h3>

          <div className="space-y-4">
            {reportData.leadsBySource.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {source.source === 'site' ? '🌐' :
                     source.source === 'whatsapp' ? '📱' :
                     source.source === 'facebook' ? '📘' : '📞'}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{source.source}</div>
                    <div className="text-sm text-gray-600">{source.count} leads</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{source.percentage.toFixed(1)}%</div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights e Recomendações IA */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🤖 Insights e Recomendações IA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">📈 Análise de Mercado:</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Demanda atual:</span>
                <span className={`font-medium ${
                  reportData.marketTrends.demandTrend === 'Alta' ? 'text-green-600' :
                  reportData.marketTrends.demandTrend === 'Média' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {reportData.marketTrends.demandTrend}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Categorias top:</span>
                <span className="text-sm">{reportData.marketTrends.topCategories.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Variação preços:</span>
                <span className={`font-medium ${reportData.marketTrends.priceGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.marketTrends.priceGrowth > 0 ? '+' : ''}{reportData.marketTrends.priceGrowth}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">💡 Recomendações:</h4>
            <div className="space-y-2">
              {reportData.marketTrends.recommendations.slice(0, 4).map((rec, index) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preços por Categoria e Cidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">🏠 Preço Médio por Categoria</h3>
          <div className="space-y-3">
            {reportData.priceInsights.averagePriceByCategory.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.category}</span>
                  <span className="text-sm text-gray-600 ml-2">({item.count})</span>
                </div>
                <span className="font-bold">{formatCurrency(item.avgPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">📍 Preço Médio por Cidade</h3>
          <div className="space-y-3">
            {reportData.priceInsights.averagePriceByCity.slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.city}</span>
                  <span className="text-sm text-gray-600 ml-2">({item.count})</span>
                </div>
                <span className="font-bold">{formatCurrency(item.avgPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}