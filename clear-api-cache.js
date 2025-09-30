// Script para limpar o cache das APIs
console.log('🗑️  Limpando cache das APIs...\n');

const clearCache = async () => {
  try {
    // Fazer uma requisição com um timestamp único para forçar bypass do cache
    const timestamp = Date.now();

    const response = await fetch(`http://localhost:3000/api/properties?_t=${timestamp}`);
    const data = await response.json();

    if (data && data.length > 0) {
      const property = data[0];
      console.log('✅ Primeiro imóvel da API:');
      console.log('   Título:', property.title);
      console.log('   Latitude:', property.latitude);
      console.log('   Longitude:', property.longitude);
      console.log('   Tipo:', typeof property.latitude, typeof property.longitude);

      if (property.latitude && property.longitude) {
        console.log('\n✅ Coordenadas estão sendo retornadas corretamente!');
        console.log('💡 Agora limpe o cache do navegador:');
        console.log('   - Chrome: Ctrl + Shift + Delete');
        console.log('   - Ou abra DevTools (F12) > Network > Disable cache + Hard Reload\n');
      } else {
        console.log('\n⚠️  Coordenadas ainda não estão no banco!\n');
      }
    } else {
      console.log('⚠️  Nenhum imóvel encontrado\n');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('💡 Certifique-se que o servidor Next.js está rodando na porta 3000\n');
  }
};

clearCache();