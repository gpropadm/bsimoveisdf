import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/test/', '/setup-admin/', '/test-login-direct/', '/test-appointments/', '/test-loft-carousel/'],
    },
    sitemap: `${process.env.NEXTAUTH_URL || 'https://faimoveis.com.br'}/sitemap.xml`,
  }
}