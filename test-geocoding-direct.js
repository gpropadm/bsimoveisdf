// Teste direto do geocoding
import { geocodeCEPWithCache } from './src/lib/geocoding.js';

async function testDirectGeocoding() {
  console.log('🔍 Testando geocoding direto...');

  try {
    const result = await geocodeCEPWithCache('01310-100');

    if (result) {
      console.log('✅ Geocoding funcionou:', {
        coordinates: result.coordinates,
        address: result.address
      });
    } else {
      console.log('❌ Geocoding retornou null');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectGeocoding();