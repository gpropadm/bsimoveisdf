'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useSettings } from '@/hooks/useSettings'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentPage: string
  actions?: React.ReactNode
}

export default function AdminLayout({ children, title, subtitle, currentPage, actions }: AdminLayoutProps) {
  const { settings } = useSettings()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect screen size and set mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile) // Desktop: sidebar always open, Mobile: closed by default
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard', current: currentPage === 'dashboard' },
    { name: 'Imóveis', href: '/admin/properties', icon: 'home', current: currentPage === 'properties' },
    { name: 'Leads', href: '/admin/leads', icon: 'users', current: currentPage === 'leads' },
    { name: 'Usuários', href: '/admin/users', icon: 'users', current: currentPage === 'users' },
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
      settings: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
        </svg>
      )
    }
    return icons[iconName as keyof typeof icons] || icons.dashboard
  }

  // Render completely different layouts for mobile vs desktop
  if (isMobile) {
    // MOBILE LAYOUT
    return (
      <div className={`min-h-screen font-inter ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Mobile Header - Only hamburger and logout */}
        <nav className={`fixed top-0 z-50 w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="px-3 py-3">
            <div className="flex items-center justify-between">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
              </button>
              
              {/* Mobile logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="flex text-sm bg-gray-800 rounded-full"
              >
                <div className="w-8 h-8 bg-[#7360ee] text-white rounded-full flex items-center justify-center">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Mobile Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r pt-16`}>
          <div className="h-full px-3 pb-4 overflow-y-auto">
            <ul className="space-y-2 font-medium">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center p-2 rounded-lg group ${
                      item.current
                        ? `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-[#7360ee]/10 text-[#7360ee] border border-[#7360ee]/20'}`
                        : `${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`
                    }`}
                  >
                    {getIcon(item.icon, `w-5 h-5 ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} transition duration-75 ${item.current ? (isDarkMode ? 'text-white' : 'text-[#7360ee]') : ''}`)}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mobile Main Content */}
        <div className="pt-16">
          <div className="p-4">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 rounded-lg mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
                </div>
                {actions && <div className="flex-shrink-0">{actions}</div>}
              </div>
            </header>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // DESKTOP LAYOUT - Traditional admin layout
  return (
    <div className={`min-h-screen font-inter ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Desktop Header - Traditional layout with sidebar space */}
      <nav className={`fixed top-0 z-50 w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b pl-64`}>
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Desktop: Site name centered */}
            <div className="flex items-center justify-center flex-1">
              <a href="#" className="flex">
                <div className="w-8 h-8 bg-[#7360ee] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </div>
                <span className={`self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {settings?.siteName || 'ImobiNext'}
                </span>
              </a>
            </div>
            
            {/* Desktop: Right side buttons */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
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
                <Link
                  href="/"
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${isDarkMode ? 'text-white bg-gray-800 hover:bg-gray-700' : 'text-gray-900 bg-white border border-gray-200 hover:bg-gray-100'}`}
                >
                  Ver Site
                </Link>
                <div className="flex items-center">
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  >
                    <div className="w-8 h-8 bg-[#7360ee] text-white rounded-full flex items-center justify-center">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar - Always visible */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r pt-20`}>
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg group ${
                    item.current
                      ? `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-[#7360ee]/10 text-[#7360ee] border border-[#7360ee]/20'}`
                      : `${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`
                  }`}
                >
                  {getIcon(item.icon, `w-5 h-5 ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} transition duration-75 ${item.current ? (isDarkMode ? 'text-white' : 'text-[#7360ee]') : ''}`)}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Desktop Main Content */}
      <div className="pl-64 pt-20">
        <div className="p-4">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          </header>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}