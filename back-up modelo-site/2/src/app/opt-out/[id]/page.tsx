'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function OptOutPage() {
  const params = useParams()
  const leadId = params.id as string
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_opted'>('loading')
  const [leadInfo, setLeadInfo] = useState<any>(null)

  useEffect(() => {
    handleOptOut()
  }, [leadId])

  const handleOptOut = async () => {
    try {
      const response = await fetch(`/api/opt-out/${leadId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setLeadInfo(data.lead)
        setStatus(data.alreadyOptedOut ? 'already_opted' : 'success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Erro ao processar opt-out:', error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Processando solicitação...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Descadastro realizado com sucesso!
              </h2>
              <p className="text-gray-600 mb-4">
                Olá <strong>{leadInfo?.name}</strong>, você não receberá mais sugestões de imóveis da BS Imóveis DF.
              </p>
              <p className="text-sm text-gray-500">
                Se mudar de ideia, pode demonstrar interesse em nossos imóveis novamente no site.
              </p>
            </>
          )}

          {status === 'already_opted' && (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Já estava descadastrado
              </h2>
              <p className="text-gray-600 mb-4">
                <strong>{leadInfo?.name}</strong>, você já havia optado por não receber mais sugestões.
              </p>
              <p className="text-sm text-gray-500">
                Não enviamos mais mensagens automáticas para você.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Erro ao processar solicitação
              </h2>
              <p className="text-gray-600 mb-4">
                Não foi possível processar seu descadastro. Tente novamente ou entre em contato conosco.
              </p>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <a
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar ao Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}