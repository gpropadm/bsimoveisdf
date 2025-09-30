const fetch = require('node-fetch')

async function testSettingsAPI() {
  try {
    console.log('🧪 Testando API de configurações...')

    // Primeiro, testar o GET para verificar se consegue buscar
    console.log('\n1️⃣ Testando GET /api/admin/settings...')
    const getResponse = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('📋 Status GET:', getResponse.status)
    const getData = await getResponse.text()
    console.log('📦 Response GET:', getData)

    // Agora testar o POST
    console.log('\n2️⃣ Testando POST /api/admin/settings...')

    const testData = {
      type: 'site',
      settings: {
        siteName: 'Teste Site',
        headerImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        headerTitle: 'Teste Título',
        headerSubtitle: 'Teste Subtítulo'
      }
    }

    console.log('📤 Enviando dados:', JSON.stringify(testData, null, 2))

    const postResponse = await fetch('http://localhost:3000/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    console.log('📋 Status POST:', postResponse.status)
    const postData = await postResponse.text()
    console.log('📦 Response POST:', postData)

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testSettingsAPI()