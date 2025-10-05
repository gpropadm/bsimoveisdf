/**
 * Utility functions for input masks and formatting
 */

/**
 * Format currency (Brazilian Real)
 */
export function formatCurrency(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // Converte para número e divide por 100 para ter centavos
  const amount = parseInt(numbers) / 100

  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0

  // Remove tudo que não é dígito ou vírgula
  const numbers = value.replace(/[^\d,]/g, '')

  // Substitui vírgula por ponto e converte para número
  return parseFloat(numbers.replace(',', '.')) || 0
}

/**
 * Format phone number (Brazilian format)
 */
export function formatPhone(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // Aplica máscara conforme o tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

/**
 * Parse phone number to clean digits
 */
export function parsePhone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Format CEP (Brazilian postal code)
 */
export function formatCEP(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // Aplica máscara XXXXX-XXX
  if (numbers.length <= 5) {
    return numbers
  } else {
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }
}

/**
 * Parse CEP to clean digits
 */
export function parseCEP(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Format area (square meters with decimals)
 */
export function formatArea(value: string): string {
  // Remove tudo que não é dígito ou vírgula/ponto
  const numbers = value.replace(/[^\d.,]/g, '')

  if (!numbers) return ''

  // Substitui vírgula por ponto para padronizar
  const normalized = numbers.replace(',', '.')

  // Limita a 2 casas decimais
  const parts = normalized.split('.')
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`
  } else if (parts.length === 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`
  }

  return parts[0]
}

/**
 * Parse area to number
 */
export function parseArea(value: string): number {
  if (!value) return 0

  // Remove tudo que não é dígito, vírgula ou ponto
  const numbers = value.replace(/[^\d.,]/g, '')

  // Substitui vírgula por ponto e converte para número
  return parseFloat(numbers.replace(',', '.')) || 0
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // Adiciona separador de milhares
  return parseInt(numbers).toLocaleString('pt-BR')
}

/**
 * Parse formatted number to integer
 */
export function parseNumber(value: string): number {
  if (!value) return 0

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '')

  return parseInt(numbers) || 0
}

/**
 * Format percentage
 */
export function formatPercentage(value: string): string {
  // Remove tudo que não é dígito ou vírgula/ponto
  const numbers = value.replace(/[^\d.,]/g, '')

  if (!numbers) return ''

  // Substitui vírgula por ponto para padronizar
  const normalized = numbers.replace(',', '.')

  // Limita a 2 casas decimais
  const parts = normalized.split('.')
  if (parts.length > 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`
  } else if (parts.length === 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`
  }

  return parts[0]
}

/**
 * Parse percentage to number
 */
export function parsePercentage(value: string): number {
  if (!value) return 0

  // Remove tudo que não é dígito, vírgula ou ponto
  const numbers = value.replace(/[^\d.,]/g, '')

  // Substitui vírgula por ponto e converte para número
  return parseFloat(numbers.replace(',', '.')) || 0
}

/**
 * Format number value from database to currency string for input
 */
export function formatCurrencyFromNumber(value: number | null | undefined): string {
  if (!value || value === 0) return ''

  // Converte número para o formato brasileiro com vírgula
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Format area with m² symbol for display
 */
export function formatAreaDisplay(value: number | string | null | undefined): string {
  if (!value || value === 0 || value === '0') return ''

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue) || numValue <= 0) return ''

  // Formatar com vírgula para decimais em português brasileiro
  const formatted = numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

  return `${formatted}m²`
}

/**
 * Format area with hectares for large areas (farms)
 */
export function formatAreaHectares(value: number | string | null | undefined): string {
  if (!value || value === 0) return ''

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue) || numValue === 0) return ''

  // Formatar com vírgula para decimais em português brasileiro
  const formatted = numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

  return `${formatted} hectares`
}

/**
 * Format area intelligently based on property category
 */
export function formatAreaSmart(property: any): string {
  // Para fazendas, usa totalArea em hectares
  if (property.category === 'fazenda') {
    if (property.totalArea && property.totalArea > 0) {
      return formatAreaHectares(property.totalArea)
    }
    return ''
  }

  // Para casas, apartamentos, terrenos usa area em m²
  if (property.area && property.area > 0) {
    return formatAreaDisplay(property.area)
  }

  return ''
}