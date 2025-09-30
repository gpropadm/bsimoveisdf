'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useSettings } from '@/hooks/useSettings'

interface AdminDashboardProps {
  session: Session & {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
}

interface DashboardStats {
  totalProperties: number
  saleProperties: number
  rentalProperties: number
  featuredProperties: number
  totalLeads: number
  newLeads: number
  interestedLeads: number
  convertedLeads: number
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const { settings } = useSettings()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    saleProperties: 0,
    rentalProperties: 0,
    featuredProperties: 0,
    totalLeads: 0,
    newLeads: 0,
    interestedLeads: 0,
    convertedLeads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      } else {
        console.error('Erro na API:', data.error)
        if (response.status === 401) {
          setTimeout(() => {
            fetchDashboardData()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      setTimeout(() => {
        fetchDashboardData()
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard', current: true },
    { name: 'Imóveis', href: '/admin/properties', icon: 'home', current: false },
    { name: 'Leads', href: '/admin/leads', icon: 'users', current: false },
    { name: 'Usuários', href: '/admin/users', icon: 'users', current: false },
    { name: 'Central de Mídia', href: '/admin/cloudinary-usage', icon: 'cloud', current: false },
    { name: 'Configurações', href: '/admin/settings', icon: 'settings', current: false },
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
      settings: (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
        </svg>
      )
    }
    return icons[iconName as keyof typeof icons] || icons.dashboard
  }

  return (
    <div className={`min-h-screen font-inter ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 z-50 w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            {/* Mobile: Just hamburger and logout */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
              </button>
              
              {/* Mobile logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="lg:hidden flex text-sm bg-gray-800 rounded-full"
              >
                <div className="w-8 h-8 bg-[#7360ee] text-white rounded-full flex items-center justify-center">
                  {session.user?.name?.charAt(0)?.toUpperCase()}
                </div>
              </button>
            </div>

            {/* Desktop: Full header */}
            <div className="hidden lg:flex items-center justify-start">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`inline-flex items-center p-2 text-sm rounded-lg focus:outline-none focus:ring-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 focus:ring-gray-600' : 'text-gray-500 hover:bg-gray-100 focus:ring-gray-200'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
              </button>
              <a href="#" className="flex ml-2 md:mr-24">
                <div className="w-8 h-8 bg-[#7360ee] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </div>
                <span className={`self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {settings.siteName || 'ImobiNext'}
                </span>
              </a>
            </div>
            
            <div className="hidden lg:flex items-center">
              <div className="flex items-center ml-3">
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
                        {session.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r ${isSidebarOpen ? 'lg:translate-x-0' : ''}`}>
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg group ${
                    item.current
                      ? `${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`
                      : `${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`
                  }`}
                >
                  {getIcon(item.icon, `w-5 h-5 ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'} transition duration-75 ${item.current ? (isDarkMode ? 'text-white' : 'text-gray-900') : ''}`)}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 sm:ml-64">
        <div className={`p-4 rounded-lg mt-14 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Bem-vindo de volta, {session.user?.name}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Imóveis */}
            <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#7360ee]/10 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-[#7360ee] dark:text-[#7360ee]/80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Imóveis
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '...' : stats.totalProperties}
                  </p>
                </div>
              </div>
            </div>

            {/* Para Venda */}
            <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Para Venda
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '...' : stats.saleProperties}
                  </p>
                </div>
              </div>
            </div>

            {/* Para Aluguel */}
            <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Para Aluguel
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '...' : stats.rentalProperties}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Leads */}
            <div className={`p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Leads
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loading ? '...' : stats.totalLeads}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-lg shadow mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/properties/new"
                className={`p-6 rounded-lg border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-600 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'}`}
              >
                <div className="flex items-center">
                  <svg className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-[#7360ee]' : 'text-[#7360ee]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <h4 className="text-lg font-medium">Adicionar Imóvel</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cadastrar novo imóvel
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/properties"
                className={`p-6 rounded-lg border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-600 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'}`}
              >
                <div className="flex items-center">
                  <svg className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  <div>
                    <h4 className="text-lg font-medium">Gerenciar Imóveis</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ver todos os imóveis
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/leads"
                className={`p-6 rounded-lg border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-600 hover:bg-gray-600 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'}`}
              >
                <div className="flex items-center">
                  <svg className={`w-8 h-8 mr-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                  <div>
                    <h4 className="text-lg font-medium">Gerenciar Leads</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Acompanhar interessados
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Atividade Recente
            </h3>
            <div className="text-center py-8">
              <svg className={`mx-auto h-12 w-12 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nenhuma atividade recente
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Quando houver atividade, ela aparecerá aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}