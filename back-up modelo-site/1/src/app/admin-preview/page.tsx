import AdminLayout from '@/components/AdminLayout'

export default function AdminPreview() {
  return (
    <AdminLayout
      title="Preview do Layout Admin"
      subtitle="Visualização do layout sem autenticação"
      currentPage="dashboard"
    >
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900">Layout Desktop</h3>
            <p className="text-blue-700 mt-2">
              ✅ Logo no canto superior esquerdo<br/>
              ✅ Sidebar sempre visível<br/>
              ✅ Sem menu hamburger
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900">Layout Mobile</h3>
            <p className="text-green-700 mt-2">
              ✅ Menu hamburger funcional<br/>
              ✅ Sidebar retrátil<br/>
              ✅ Layout responsivo
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900">Status</h3>
            <p className="text-purple-700 mt-2">
              🚀 Deploy ativo<br/>
              ⚡ Layout funcionando<br/>
              🎯 Problema resolvido
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Teste do Layout</h2>
          <p className="text-gray-600">
            Esta página demonstra o AdminLayout funcionando. Teste redimensionando a janela do browser
            para ver a responsividade entre desktop e mobile.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}