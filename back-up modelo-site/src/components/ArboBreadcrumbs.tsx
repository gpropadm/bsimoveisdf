'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ArboBreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function ArboBreadcrumbs({ items }: ArboBreadcrumbsProps) {
  return (
    <nav
      className="d-flex align-items-center py-2 px-3 px-md-4"
      style={{
        backgroundColor: '#f8f9fa',
        fontSize: '14px',
        color: '#6c757d'
      }}
    >
      <div className="container">
        <div className="d-flex align-items-center flex-wrap">
          {items.map((item, index) => (
            <div key={index} className="d-flex align-items-center">
              {index > 0 && (
                <i
                  className="fas fa-chevron-right mx-2"
                  style={{
                    fontSize: '10px',
                    color: '#adb5bd'
                  }}
                ></i>
              )}

              {item.href ? (
                <Link
                  href={item.href}
                  className="text-decoration-none"
                  style={{
                    color: '#6c757d',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#495057'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6c757d'
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  style={{
                    color: '#495057',
                    fontWeight: '500'
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}