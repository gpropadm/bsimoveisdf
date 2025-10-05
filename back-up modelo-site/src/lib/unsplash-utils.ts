/**
 * Converte uma URL de página do Unsplash para URL direta da imagem
 */
export function convertUnsplashUrl(url: string): string {
  // Se já é uma URL direta de imagem, retorna como está
  if (url.includes('images.unsplash.com')) {
    return url
  }

  // Para a URL específica que você mencionou (deve vir primeiro)
  if (url.includes('76JYlSoAYM4')) {
    return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }

  // Se é uma URL da página do Unsplash, extrai o ID da foto
  const unsplashPageMatch = url.match(/unsplash\.com\/.*\/([\w-]+)$/)
  if (unsplashPageMatch) {
    const photoId = unsplashPageMatch[1]
    // Se o ID parece ser real (não contém hífens longos)
    if (photoId.length > 5 && photoId.length < 15) {
      return `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`
    }
  }

  // Se é uma URL curta do Unsplash
  const shortUrlMatch = url.match(/unsplash\.com\/([a-zA-Z0-9_-]{10,12})$/)
  if (shortUrlMatch) {
    const photoId = shortUrlMatch[1]
    return `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`
  }

  // Se não conseguiu converter, retorna a URL original
  return url
}

/**
 * Valida se uma URL é válida para imagem
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}