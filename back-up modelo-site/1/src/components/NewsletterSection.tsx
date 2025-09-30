'use client'

import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!email.trim()) {
      setMessage('Por favor, preencha seu email')
      return
    }

    if (!name.trim()) {
      setMessage('Por favor, preencha seu nome')
      return
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Por favor, digite um email válido')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // Salvar lead na API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: '',
          message: 'Interesse em receber novos imóveis por email - Newsletter',
          propertyTitle: 'Newsletter Subscription',
          propertyPrice: 0,
          propertyType: 'newsletter',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar email')
      }

      setMessage('✅ Email cadastrado com sucesso! Você receberá novos imóveis em sua caixa de entrada.')
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        setName('')
        setEmail('')
        setMessage('')
      }, 3000)

    } catch (error) {
      console.error('Erro:', error)
      setMessage('❌ Erro ao cadastrar email. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Receba Novos Imóveis por Email
          </h2>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Seja o primeiro a saber sobre os melhores imóveis disponíveis. 
            Cadastre-se e receba notificações exclusivas!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-6 py-4 text-lg rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-teal-300 focus:outline-none bg-white/95 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email"
                className="w-full px-6 py-4 text-lg rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-teal-300 focus:outline-none bg-white/95 backdrop-blur-sm"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Cadastrar
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-lg font-medium max-w-md mx-auto ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                : message.includes('❌')
                ? 'bg-red-100 text-red-800 border-2 border-red-200'
                : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
            }`}>
              {message}
            </div>
          )}
        </form>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-teal-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>100% Gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Sem Spam</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Cancele Quando Quiser</span>
          </div>
        </div>
      </div>
    </section>
  )
}