import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Algoritmo de IA simples para recomendações baseado em:
// 1. Histórico de visualizações (futuro)
// 2. Preço similar
// 3. Categoria similar
// 4. Localização próxima
// 5. Score de popularidade

interface PropertyRecommendation {
  property: any;
  score: number;
  reasons: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentPropertyId = searchParams.get('propertyId');
    const userPreferences = searchParams.get('preferences'); // JSON string futuro

    // Buscar todas as propriedades disponíveis
    const allProperties = await prisma.property.findMany({
      where: {
        status: 'disponivel',
        ...(currentPropertyId && { id: { not: currentPropertyId } })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (allProperties.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Nenhuma propriedade disponível para recomendação'
      });
    }

    // Propriedade de referência (se fornecida)
    const referenceProperty = currentPropertyId
      ? await prisma.property.findUnique({ where: { id: currentPropertyId } })
      : null;

    // Algoritmo de recomendação inteligente
    const recommendations: PropertyRecommendation[] = allProperties.map(property => {
      const reasons: string[] = [];
      let score = 0;

      // Score base por popularidade simulada (baseado na data)
      const daysSinceCreated = Math.floor((Date.now() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const popularityScore = Math.max(0, 10 - daysSinceCreated * 0.1);
      score += popularityScore;

      if (referenceProperty) {
        // 1. Preço similar (+20 pontos se até 30% de diferença)
        const priceDiff = Math.abs(property.price - referenceProperty.price) / referenceProperty.price;
        if (priceDiff <= 0.3) {
          score += 20;
          reasons.push('💰 Preço similar ao que você visualizou');
        }

        // 2. Mesma categoria (+15 pontos)
        if (property.category === referenceProperty.category) {
          score += 15;
          reasons.push(`🏠 Mesmo tipo: ${property.category}`);
        }

        // 3. Mesma cidade (+10 pontos)
        if (property.city === referenceProperty.city) {
          score += 10;
          reasons.push(`📍 Mesma região: ${property.city}`);
        }

        // 4. Quartos similares (+8 pontos)
        if (property.bedrooms === referenceProperty.bedrooms) {
          score += 8;
          reasons.push(`🛏️ ${property.bedrooms} quartos`);
        }

        // 5. Tipo de negócio igual (+12 pontos)
        if (property.type === referenceProperty.type) {
          score += 12;
          reasons.push(`📋 ${property.type.toLowerCase()}`);
        }
      } else {
        // Sem referência - usar algoritmo padrão

        // Propriedades em destaque
        if (property.featured) {
          score += 25;
          reasons.push('⭐ Imóvel em destaque');
        }

        // Preço atrativo (abaixo da média)
        const avgPrice = allProperties.reduce((sum, p) => sum + p.price, 0) / allProperties.length;
        if (property.price < avgPrice * 0.8) {
          score += 15;
          reasons.push('🔥 Preço muito atrativo');
        }

        // Imóveis novos
        if (daysSinceCreated < 7) {
          score += 10;
          reasons.push('✨ Recém chegou ao mercado');
        }

        // Área boa
        if (property.area && property.area > 80) {
          score += 8;
          reasons.push('📏 Área generosa');
        }
      }

      // Boost para propriedades com mais informações
      if (property.images) {
        try {
          const images = JSON.parse(property.images);
          if (images.length >= 5) {
            score += 5;
            reasons.push('📸 Muitas fotos disponíveis');
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Boost para propriedades completas
      if (property.bedrooms && property.bathrooms && property.area) {
        score += 3;
        reasons.push('📋 Informações completas');
      }

      // Adicionar razão padrão se não tiver nenhuma específica
      if (reasons.length === 0) {
        reasons.push('🎯 Baseado no seu perfil');
      }

      return {
        property,
        score,
        reasons
      };
    });

    // Ordenar por score e pegar os top 6
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(rec => ({
        ...rec.property,
        aiScore: Math.min(99, Math.max(60, Math.round(rec.score))), // Score entre 60-99%
        reasons: rec.reasons.slice(0, 2) // Máximo 2 razões principais
      }));

    return NextResponse.json({
      success: true,
      data: topRecommendations,
      algorithm: 'SmartRecommendation v1.0',
      basedOn: referenceProperty
        ? `Propriedade: ${referenceProperty.title}`
        : 'Preferências gerais do usuário'
    });

  } catch (error) {
    console.error('Erro na API de recomendações IA:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor de IA',
        data: []
      },
      { status: 500 }
    );
  }
}