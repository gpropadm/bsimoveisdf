import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { status: 'disponivel' }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        type: true,
        category: true,
        address: true,
        city: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        latitude: true,
        longitude: true,
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformar os dados para o formato esperado pelo mapa
    const mapProperties = properties.map(property => {
      let images: string[] = [];
      try {
        if (property.images) {
          images = JSON.parse(property.images);
        }
      } catch (e) {
        // Se não conseguir fazer parse, assume array vazio
      }

      return {
        id: property.id,
        title: property.title,
        slug: property.slug,
        price: property.price,
        type: property.type.toUpperCase(),
        category: property.category,
        address: property.address,
        city: property.city,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        coordinates: [property.longitude, property.latitude] as [number, number],
        image: images.length > 0 ? images[0] : null
      };
    });

    return NextResponse.json({
      success: true,
      data: mapProperties,
      total: mapProperties.length
    });

  } catch (error) {
    console.error('Erro ao buscar propriedades para o mapa:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar propriedades' },
      { status: 500 }
    );
  }
}