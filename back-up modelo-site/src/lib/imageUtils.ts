/**
 * Safely parses image data that can be either:
 * - A JSON array string: '["url1", "url2"]'
 * - A single URL string: "https://example.com/image.jpg"
 * - null/undefined
 */
export function parseImages(imageData: string | null | undefined): string[] {
  if (!imageData) return []

  try {
    if (imageData.startsWith('[')) {
      const parsed = JSON.parse(imageData)
      return Array.isArray(parsed) ? parsed : []
    } else {
      return [imageData]
    }
  } catch {
    return imageData ? [imageData] : []
  }
}

/**
 * Gets the first image from parsed image data, with fallback
 */
export function getFirstImage(imageData: string | null | undefined, fallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=50'): string {
  const images = parseImages(imageData)
  return images[0] || fallback
}