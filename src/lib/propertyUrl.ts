/**
 * Utilitário para gerar URLs de imóveis no formato SEO-friendly
 * Formato: /imovel/[category]/[type]/[state]/[city]/[slug]
 * Exemplo: /imovel/apartamento/venda/df/santa-maria/apartamento-2-quartos
 */

interface PropertyUrlParams {
  category: string
  type: string
  state: string
  city: string
  slug: string
}

/**
 * Normaliza texto para URL (remove acentos, caracteres especiais, etc)
 */
export function normalizeForUrl(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .trim()
}

/**
 * Gera a URL completa do imóvel no formato SEO-friendly
 */
export function getPropertyUrl(params: PropertyUrlParams): string {
  const categorySlug = normalizeForUrl(params.category)
  const typeSlug = params.type.toLowerCase()
  const stateSlug = normalizeForUrl(params.state)
  const citySlug = normalizeForUrl(params.city)
  const propertySlug = params.slug

  return `/imovel/${categorySlug}/${typeSlug}/${stateSlug}/${citySlug}/${propertySlug}`
}
