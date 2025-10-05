interface PriceReducedBadgeProps {
  priceReduced: boolean
  previousPrice?: number
  currentPrice: number
  size?: 'sm' | 'md' | 'lg'
}

export default function PriceReducedBadge({
  priceReduced,
  previousPrice,
  currentPrice,
  size = 'md'
}: PriceReducedBadgeProps) {
  if (!priceReduced || !previousPrice) return null

  const savings = previousPrice - currentPrice
  const savingsPercentage = Math.round((savings / previousPrice) * 100)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-green-100 text-green-800 rounded-full font-medium ${sizeClasses[size]}`}>
      <svg
        className={`${iconSizes[size]} animate-bounce`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
      Preço Reduzido {savingsPercentage}%
    </div>
  )
}