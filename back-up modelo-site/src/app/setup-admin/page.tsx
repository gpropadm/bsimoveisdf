// Força a página a ser dinâmica
export const dynamic = 'force-dynamic'

export default function SetupAdmin() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Setup Admin</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">⚠️ Problema identificado:</h2>
        <p className="text-sm">A DATABASE_URL na Vercel está com formato "postgres://" mas precisa ser "postgresql://"</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">✅ Solução aplicada:</h3>
        <p className="text-sm">O código foi atualizado para converter automaticamente "postgres://" para "postgresql://"</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">🔧 Para testar:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Acesse: <a href="/api/create-admin" className="text-blue-600 hover:underline">/api/create-admin</a></li>
          <li>2. Verifique se o usuário foi criado</li>
          <li>3. Tente fazer login abaixo</li>
        </ol>
      </div>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🔑 Credenciais de Login:</h3>
        <p><strong>Email:</strong> admin@imobinext.com</p>
        <p><strong>Senha:</strong> admin123</p>
        <p><strong>Login:</strong> <a href="/admin/login" className="text-blue-600 hover:underline">/admin/login</a></p>
      </div>
    </div>
  )
}