export default function DebugPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug - Variáveis de Ambiente</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold">NextAuth:</h3>
          <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'NÃO CONFIGURADO'}</p>
          <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold">Database:</h3>
          <p>DATABASE_URL: {process.env.DATABASE_URL ? '✅ CONFIGURADO' : '❌ NÃO CONFIGURADO'}</p>
          <p>Começa com postgresql: {process.env.DATABASE_URL?.startsWith('postgresql') ? '✅ SIM' : '❌ NÃO'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold">Site:</h3>
          <p>SITE_URL: {process.env.SITE_URL || 'NÃO CONFIGURADO'}</p>
          <p>SITE_NAME: {process.env.SITE_NAME || 'NÃO CONFIGURADO'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold">Node Environment:</h3>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  )
}