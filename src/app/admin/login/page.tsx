'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettings } from '@/hooks/useSettings'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function AdminLogin() {
  const { settings } = useSettings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 Tentando fazer login:', { email, hasPassword: !!password });

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('🔐 Resultado do signIn:', result);

      if (result?.error) {
        console.log('❌ Erro no signIn:', result.error);
        setError('Email ou senha inválidos')
      } else {
        console.log('✅ Login bem-sucedido, redirecionando...');
        router.push('/admin')
      }
    } catch (error) {
      console.log('❌ Exceção no login:', error);
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 relative">
        {/* Background with solid color - Roxo */}
        <div className="absolute inset-0" style={{background: '#7360ee'}}></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-center px-12 py-12 w-full">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V12H15V21"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {settings.siteName || 'ImobiNext'}
                </h1>
                <p className="text-purple-200 text-sm font-medium">Plataforma Administrativa</p>
              </div>
            </div>

            {/* Welcome text */}
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Bem Vindo!
            </h2>

          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-lg" style={{backgroundColor: '#7360ee'}}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21V12H15V21"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {settings.siteName || 'ImobiNext'}
              </h1>
              <p style={{color: '#7360ee'}} className="text-sm font-medium">Plataforma Administrativa</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Fazer Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Entre com suas credenciais para acessar o painel administrativo
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{backgroundColor: '#7360ee'}}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-sm font-medium transition-colors"
                style={{color: '#7360ee'}}
              >
                ← Voltar ao site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}