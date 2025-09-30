'use client'

interface HeartIconProps {
  size?: number
  className?: string
  filled?: boolean
  color?: string
  strokeWidth?: number
}

export default function HeartIcon({
  size = 20,
  className = "",
  filled = false,
  color = "#ef4444",
  strokeWidth = 2.5
}: HeartIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={strokeWidth}
      className={className}
      style={{ display: 'inline-block' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}