import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SmartAnalytics {
  // Performance de imóveis
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

  // Análise de leads
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

  // Alertas inteligentes
  intelligentAlerts: Array<{
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    actionRequired: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Insights de mercado
  marketInsights: {
    averagePrice: number;
    pricePerM2: number;
    mostPopularCategory: string;
    bestPerformingCity: string;
    recommendations: string[];
  };

  // Métricas em tempo real
  realTimeMetrics: {
    activeVisitors: number;
    propertiesViewedToday: number;
    newLeadsToday: number;
    conversionToday: number;
  };
}

export async function GET() {
  try {
    // Buscar propriedades com análise simulada
    const properties = await prisma.property.findMany({
      where: { status: 'disponivel' },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Buscar leads para análise
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Análise de propriedades top
    const topPerformingProperties = properties
      .slice(0, 5)
      .map((property, index) => {
        // Simular views baseado em fatores como featured, preço, etc.
        const baseViews = Math.floor(Math.random() * 100) + 10;
        const featuredBoost = property.featured ? 50 : 0;
        const categoryBoost = property.category === 'apartamento' ? 20 : 0;

        const views = baseViews + featuredBoost + categoryBoost;
        const trend = index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable';
        const score = Math.min(100, views + (property.featured ? 20 : 0));

        return {
          id: property.id,
          title: property.title,
          slug: property.slug,
          price: property.price,
          type: property.type,
          city: property.city,
          views,
          trend: trend as 'up' | 'down' | 'stable',
          score
        };
      })
      .sort((a, b) => b.score - a.score);

    // Análise de leads
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'convertido').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const leadSources = leads.reduce((acc, lead) => {
      const source = lead.source || 'site';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadSourcesArray = Object.entries(leadSources).map(([source, count]) => ({
      source,
      count,
      percentage: (count / totalLeads) * 100
    }));

    const hotLeads = leads.filter(lead =>
      lead.status === 'interessado' ||
      (lead.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000))
    ).length;

    // Alertas inteligentes
    const intelligentAlerts = [];

    // Alerta de imóveis sem visualizações
    const lowPerformingProperties = properties.filter(p => !p.featured).length;
    if (lowPerformingProperties > 5) {
      intelligentAlerts.push({
        type: 'warning' as const,
        title: 'Imóveis com baixa performance',
        message: `${lowPerformingProperties} imóveis podem precisar de mais destaque ou ajuste de preço`,
        actionRequired: true,
        priority: 'medium' as const
      });
    }

    // Alerta de leads não respondidos
    const unrepliedLeads = leads.filter(lead =>
      lead.status === 'novo' &&
      lead.createdAt < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    ).length;

    if (unrepliedLeads > 0) {
      intelligentAlerts.push({
        type: 'danger' as const,
        title: 'Leads não respondidos',
        message: `${unrepliedLeads} leads aguardam resposta há mais de 2 dias`,
        actionRequired: true,
        priority: 'high' as const
      });
    }

    // Alerta de sucesso
    if (conversionRate > 15) {
      intelligentAlerts.push({
        type: 'success' as const,
        title: 'Alta taxa de conversão!',
        message: `Sua conversão está em ${conversionRate.toFixed(1)}% - muito acima da média do mercado`,
        actionRequired: false,
        priority: 'low' as const
      });
    }

    // Insights de mercado
    const avgPrice = properties.reduce((sum, p) => sum + p.price, 0) / properties.length;

    const propertiesWithArea = properties.filter(p => p.area && p.area > 0);
    const avgPricePerM2 = propertiesWithArea.length > 0
      ? propertiesWithArea.reduce((sum, p) => sum + (p.price / p.area!), 0) / propertiesWithArea.length
      : 0;

    const categoryCount = properties.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'apartamento';

    const cityCount = properties.reduce((acc, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bestPerformingCity = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'São Paulo';

    const recommendations = [
      `Focalize em ${mostPopularCategory}s para maximizar interesse`,
      `${bestPerformingCity} está com alta demanda - considere mais imóveis nesta região`,
      conversionRate < 10
        ? 'Implemente follow-up automático para melhorar conversão'
        : 'Sua conversão está boa - mantenha o processo atual',
      avgPrice > 1000000
        ? 'Considere adicionar opções de financiamento facilitado'
        : 'Explore imóveis de maior valor agregado'
    ];

    // Métricas em tempo real (simuladas)
    const realTimeMetrics = {
      activeVisitors: Math.floor(Math.random() * 50) + 5,
      propertiesViewedToday: Math.floor(Math.random() * 200) + 50,
      newLeadsToday: Math.floor(Math.random() * 10) + 1,
      conversionToday: Math.floor(Math.random() * 5) + 1
    };

    const analytics: SmartAnalytics = {
      topPerformingProperties,
      leadAnalytics: {
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averageResponseTime: 2.5, // horas (simulado)
        hotLeads,
        leadSources: leadSourcesArray
      },
      intelligentAlerts,
      marketInsights: {
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        pricePerM2: parseFloat(avgPricePerM2.toFixed(2)),
        mostPopularCategory,
        bestPerformingCity,
        recommendations
      },
      realTimeMetrics
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
      algorithm: 'SmartAnalytics v2.0'
    });

  } catch (error) {
    console.error('Erro na API Smart Analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor de analytics',
        data: null
      },
      { status: 500 }
    );
  }
}