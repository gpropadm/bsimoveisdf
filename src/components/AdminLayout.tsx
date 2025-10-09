'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentPage: string
  actions?: React.ReactNode
}

export default function AdminLayout({ children, title, subtitle, currentPage, actions }: AdminLayoutProps) {
  const { data: session } = useSession()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard', current: currentPage === 'dashboard' },
    { name: 'Imóveis', href: '/admin/properties', icon: 'home', current: currentPage === 'properties' },
    { name: 'Páginas Vistas', href: '/admin/analytics', icon: 'chart', current: currentPage === 'analytics' },
    { name: 'Leads', href: '/admin/leads', icon: 'users', current: currentPage === 'leads' },
    { name: 'Agendamentos', href: '/admin/appointments', icon: 'calendar', current: currentPage === 'appointments' },
    { name: 'Usuários', href: '/admin/users', icon: 'users', current: currentPage === 'users' },
    { name: 'Central de Mídia', href: '/admin/cloudinary-usage', icon: 'cloud', current: currentPage === 'media' },
    { name: 'Configurações', href: '/admin/settings', icon: 'settings', current: currentPage === 'settings' },
  ]

  const getIcon = (iconName: string, className: string = "w-5 h-5") => {
    const icons = {
      dashboard: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
        </svg>
      ),
      home: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      ),
      users: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
        </svg>
      ),
      cloud: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
        </svg>
      ),
      calendar: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
        </svg>
      ),
      settings: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
        </svg>
      ),
      chart: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
        </svg>
      )
    }
    return icons[iconName as keyof typeof icons] || icons.dashboard
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Layout com Flexbox - Sidebar fixo e conteúdo ao lado */}
      <div className="flex">

        {/* Sidebar - Largura fixa */}
        <div className={`w-64 min-h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>

          {/* Logo/Header do Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#7360ee] rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              </div>
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                All Gestor
              </span>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      item.current
                        ? `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`
                    }`}
                  >
                    {getIcon(item.icon, `w-5 h-5 mr-3 ${item.current ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`)}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Área Principal - Ocupa o restante da tela */}
        <div className="flex-1">

          {/* Header/Navbar do conteúdo */}
          <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Actions */}
                {actions && <div className="flex-shrink-0">{actions}</div>}

                {/* Botão Dark Mode */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                  )}
                </button>

                {/* User Menu */}
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-8 h-8 bg-[#7360ee] text-white rounded-full flex items-center justify-center">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* Conteúdo Principal */}
          <main className="p-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}