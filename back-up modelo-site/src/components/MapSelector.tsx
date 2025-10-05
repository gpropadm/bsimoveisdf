'use client'

import { useState } from 'react'

interface MapSelectorProps {
  onLocationSelect: (latitude: number, longitude: number) => void
  initialLatitude?: number
  initialLongitude?: number
}

export default function MapSelector({ onLocationSelect, initialLatitude, initialLongitude }: MapSelectorProps) {
  const [manualCoords, setManualCoords] = useState({
    lat: initialLatitude?.toString() || '',
    lng: initialLongitude?.toString() || ''
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const handleCoordChange = (type: 'lat' | 'lng', value: string) => {
    setManualCoords(prev => ({ ...prev, [type]: value }))

    // Se ambos os campos estão preenchidos, chamar callback
    const lat = type === 'lat' ? value : manualCoords.lat
    const lng = type === 'lng' ? value : manualCoords.lng

    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        onLocationSelect(latNum, lngNum)
      }
    }
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Atualizar os campos
        setManualCoords({
          lat: lat.toString(),
          lng: lng.toString()
        })

        // Chamar callback
        onLocationSelect(lat, lng)
        setIsGettingLocation(false)

        // Mostrar confirmação
        alert(`Localização obtida:\nLatitude: ${lat}\nLongitude: ${lng}`)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        let errorMessage = 'Erro ao obter localização: '
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permissão negada pelo usuário.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Localização indisponível.'
            break
          case error.TIMEOUT:
            errorMessage += 'Timeout na requisição.'
            break
          default:
            errorMessage += 'Erro desconhecido.'
        }
        alert(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const openInMaps = () => {
    const lat = parseFloat(manualCoords.lat) || initialLatitude || -15.7801
    const lng = parseFloat(manualCoords.lng) || initialLongitude || -47.9292
    const url = `https://www.openstreetmap.org/#map=15/${lat}/${lng}`
    window.open(url, '_blank')
  }

  const openGoogleMaps = () => {
    const lat = parseFloat(manualCoords.lat) || initialLatitude || -15.7801
    const lng = parseFloat(manualCoords.lng) || initialLongitude || -47.9292
    const url = `https://www.google.com/maps/@${lat},${lng},15z`
    window.open(url, '_blank')
  }

  return (
    <div className="w-full space-y-4">
      {/* Seletor Manual de Coordenadas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-800 mb-3">📍 Coordenadas Manuais</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-blue-700 mb-1">Latitude:</label>
            <input
              type="text"
              value={manualCoords.lat}
              onChange={(e) => handleCoordChange('lat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: -23.5505"
            />
          </div>
          <div>
            <label className="block text-xs text-blue-700 mb-1">Longitude:</label>
            <input
              type="text"
              value={manualCoords.lng}
              onChange={(e) => handleCoordChange('lng', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: -46.6333"
            />
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Digite as coordenadas GPS da propriedade ou use os métodos abaixo
        </p>
      </div>

      {/* Botões de Localização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Botão GPS */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors font-medium"
        >
          {isGettingLocation ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Localizando...
            </>
          ) : (
            <>📍 Usar Minha Localização</>
          )}
        </button>

        {/* Google Maps */}
        <button
          type="button"
          onClick={openGoogleMaps}
          className="flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
        >
          🗺️ Abrir Google Maps
        </button>

        {/* OpenStreetMap */}
        <button
          type="button"
          onClick={openInMaps}
          className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          🌍 Abrir OpenStreetMap
        </button>
      </div>

      {/* Instruções */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">💡 Como obter coordenadas:</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>1. GPS:</strong> Se estiver no local da propriedade, clique em "📍 Usar Minha Localização"</li>
          <li><strong>2. Google Maps:</strong> Abra o mapa, encontre o local e clique nele. As coordenadas aparecerão embaixo.</li>
          <li><strong>3. OpenStreetMap:</strong> Clique com botão direito no local e escolha "Mostrar endereço"</li>
          <li><strong>4. Manual:</strong> Digite diretamente se já souber as coordenadas</li>
        </ul>
      </div>

      {/* Validação das Coordenadas */}
      {manualCoords.lat && manualCoords.lng && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">✅ Coordenadas definidas</p>
              <p className="text-xs text-green-600">
                Lat: {manualCoords.lat}, Lng: {manualCoords.lng}
              </p>
            </div>
            <button
              type="button"
              onClick={openInMaps}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              🔍 Verificar no Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}