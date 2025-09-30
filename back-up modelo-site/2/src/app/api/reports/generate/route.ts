import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // 30, 90, 365 days
    const reportType = url.searchParams.get('type') || 'general'; // general, sales, marketing

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Buscar dados das propriedades
    const properties = await prisma.property.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Buscar dados dos leads
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        property: true
      }
    });

    // Calcular estatísticas básicas
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'ativo').length;
    const soldProperties = properties.filter(p => p.status === 'vendido').length;
    const totalLeads = leads.length;

    // Simular visualizações (em produção viria de analytics reais)
    const totalViews = totalProperties * Math.floor(Math.random() * 50) + 100;
    const conversionRate = totalLeads > 0 ? (soldProperties / totalLeads) * 100 : 0;

    // Calcular preço médio
    const averagePrice = properties.length > 0
      ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length
      : 0;

    // Top 5 propriedades (simulado)
    const bestPerformingProperties = properties
      .slice(0, 5)
      .map(prop => ({
        id: prop.id,
        title: prop.title,
        price: prop.price,
        views: Math.floor(Math.random() * 200) + 50,
        leads: leads.filter(l => l.propertyId === prop.id).length,
        city: prop.city
      }))
      .sort((a, b) => b.views - a.views);

    // Vendas por mês (últimos 12 meses)
    const salesByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      const monthlySales = Math.floor(Math.random() * 10) + 1;
      const monthlyRevenue = monthlySales * (averagePrice * 0.8); // Simulated

      salesByMonth.push({
        month: monthName,
        sales: monthlySales,
        revenue: monthlyRevenue
      });
    }

    // Origem dos leads
    const leadSources = [
      { source: 'site', count: Math.floor(totalLeads * 0.6) },
      { source: 'whatsapp', count: Math.floor(totalLeads * 0.25) },
      { source: 'facebook', count: Math.floor(totalLeads * 0.15) }
    ];

    const leadsBySource = leadSources.map(source => ({
      ...source,
      percentage: totalLeads > 0 ? (source.count / totalLeads) * 100 : 0
    }));

    // Insights de preço por categoria
    const categories = [...new Set(properties.map(p => p.category))];
    const averagePriceByCategory = categories.map(category => {
      const categoryProperties = properties.filter(p => p.category === category);
      return {
        category,
        avgPrice: categoryProperties.length > 0
          ? categoryProperties.reduce((sum, p) => sum + p.price, 0) / categoryProperties.length
          : 0,
        count: categoryProperties.length
      };
    });

    // Insights de preço por cidade
    const cities = [...new Set(properties.map(p => p.city))];
    const averagePriceByCity = cities.map(city => {
      const cityProperties = properties.filter(p => p.city === city);
      return {
        city,
        avgPrice: cityProperties.length > 0
          ? cityProperties.reduce((sum, p) => sum + p.price, 0) / cityProperties.length
          : 0,
        count: cityProperties.length
      };
    }).sort((a, b) => b.avgPrice - a.avgPrice);

    // Tendências de mercado e recomendações IA
    const priceGrowth = Math.random() * 10 - 5; // -5% a +5%
    const demandTrend = totalLeads > (totalProperties * 2) ? 'Alta' :
                       totalLeads > totalProperties ? 'Média' : 'Baixa';

    const topCategories = averagePriceByCategory
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(c => c.category);

    const recommendations = [];

    if (conversionRate < 2) {
      recommendations.push('📈 Taxa de conversão baixa. Considere melhorar a qualificação dos leads.');
    }
    if (averagePrice > 800000) {
      recommendations.push('💰 Portfólio com preços altos. Considere adicionar opções mais acessíveis.');
    }
    if (totalLeads < totalProperties) {
      recommendations.push('🎯 Poucos leads por imóvel. Intensifique o marketing digital.');
    }
    recommendations.push('🤖 Use a automação WhatsApp para nutrir leads mais rapidamente.');
    recommendations.push('📊 Monitore métricas semanalmente para otimizar resultados.');

    const reportData: ReportData = {
      period: `${period} dias`,
      totalProperties,
      activeProperties,
      soldProperties,
      totalViews,
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averagePrice: Math.round(averagePrice),
      bestPerformingProperties,
      salesByMonth,
      leadsBySource,
      priceInsights: {
        averagePriceByCategory,
        averagePriceByCity
      },
      marketTrends: {
        priceGrowth: Math.round(priceGrowth * 100) / 100,
        demandTrend,
        topCategories,
        recommendations
      }
    };

    return NextResponse.json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString(),
      reportType,
      period: parseInt(period)
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}