import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://faimoveis.com.br'

  // Static pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/venda`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/aluguel`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/anunciar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Dynamic property pages - only fetch in production or if server is running
  let propertyRoutes: MetadataRoute.Sitemap = []
  
  // Skip API calls during build to avoid connection errors
  if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/properties`, {
        // Add timeout to prevent hanging during build
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        const properties = await response.json()
        propertyRoutes = properties.map((property: any) => ({
          url: `${baseUrl}/imovel/${property.slug}`,
          lastModified: new Date(property.updatedAt || property.createdAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    } catch (error) {
      console.error('Error fetching properties for sitemap:', error)
      // Fail silently during build - properties can be added later via dynamic generation
    }
  }

  return [...staticRoutes, ...propertyRoutes]
}