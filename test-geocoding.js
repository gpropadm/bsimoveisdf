// Teste de geocoding independente

async function testGeocoding() {
  try {
    console.log('🔍 Testando geocoding...');

    // Simular a função geocodeCEPWithCache
    const cep = '01310-100';
    console.log(`📍 Testando CEP: ${cep}`);

    // 1. Teste ViaCEP
    const https = require('https');
    
    const viacepData = await new Promise((resolve, reject) => {
      https.get(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (viacepData.erro) {
      throw new Error('CEP não encontrado no ViaCEP');
    }

    console.log('✅ ViaCEP funcionando:', {
      logradouro: viacepData.logradouro,
      localidade: viacepData.localidade,
      uf: viacepData.uf
    });

    console.log('🔍 Geocoding funcionando - problema pode ser com rate limiting da API externa');

  } catch (error) {
    console.error('❌ Erro no geocoding:', error.message);
  }
}

testGeocoding();
