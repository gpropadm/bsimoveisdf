interface Property {
  totalArea: number | null
  cultivatedArea: number | null
  pastures: number | null
  buildings: string | null
  waterSources: string | null
}

// Componente para informações específicas de fazendas
export default function FarmInfo({ property }: { property: Property }) {
  const formatAreaHectares = (value: number | null) => {
    if (!value) return null
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} hectares`
  }

  const getBuildingsList = (buildings: string | null) => {
    if (!buildings) return []
    try {
      return Array.isArray(buildings) ? buildings : JSON.parse(buildings)
    } catch {
      return []
    }
  }

  const buildingsList = getBuildingsList(property.buildings)

  if (!property.totalArea && !property.cultivatedArea && !property.pastures && !property.waterSources && buildingsList.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações da Fazenda</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Área Total */}
        {property.totalArea && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{formatAreaHectares(property.totalArea)}</div>
                <div className="text-sm text-gray-600">Área total</div>
              </div>
            </div>
          </div>
        )}

        {/* Área Cultivada */}
        {property.cultivatedArea && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{formatAreaHectares(property.cultivatedArea)}</div>
                <div className="text-sm text-gray-600">Área cultivada</div>
              </div>
            </div>
          </div>
        )}

        {/* Pastagens */}
        {property.pastures && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{formatAreaHectares(property.pastures)}</div>
                <div className="text-sm text-gray-600">Pastagens</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benfeitorias */}
      {buildingsList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Benfeitorias da Fazenda</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {buildingsList.map((building: string, index: number) => (
              <div key={index} className="flex items-center bg-blue-50 p-3 rounded-lg">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{building}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fontes de Água */}
      {property.waterSources && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Fontes de Água</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-700">{property.waterSources}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}