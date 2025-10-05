'use client'

import { useState } from 'react'

export default function TestLoginDirect() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: 'admin@imobinext.com',
          password: 'admin123',
          csrfToken: 'test',
          callbackUrl: '/admin',
          json: 'true'
        })
      })

      const data = await response.text()
      setResult(`Status: ${response.status}\n\nResponse: ${data}`)

    } catch (error) {
      setResult(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testWithSignIn = async () => {
    setLoading(true)
    setResult('')

    try {
      // Importar signIn dinamicamente
      const { signIn } = await import('next-auth/react')
      
      const result = await signIn('credentials', {
        email: 'admin@imobinext.com',
        password: 'admin123',
        redirect: false
      })

      setResult(JSON.stringify(result, null, 2))

    } catch (error) {
      setResult(`Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Login Direto</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Login (API direta)'}
        </button>
        
        <button
          onClick={testWithSignIn}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testando...' : 'Testar com signIn'}
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Resultado:</h3>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-bold mb-2">Informações:</h3>
        <p><strong>Email:</strong> admin@imobinext.com</p>
        <p><strong>Senha:</strong> admin123</p>
        <p><strong>Banco:</strong> ✅ Verificado funcionando</p>
        <p><strong>Usuário:</strong> ✅ Criado e senha confirmada</p>
      </div>
    </div>
  )
}