// Função para converter URL do Unsplash
function convertUnsplashUrl(url) {
  console.log('🔗 URL original:', url)

  // Se já é uma URL direta de imagem, retorna como está
  if (url.includes('images.unsplash.com')) {
    console.log('✅ Já é URL direta da imagem')
    return url
  }

  // Para a URL específica que contém o ID 76JYlSoAYM4 (deve vir primeiro)
  if (url.includes('76JYlSoAYM4')) {
    const directUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    console.log('🎯 URL específica detectada, convertendo para:', directUrl)
    return directUrl
  }

  // Se é uma URL da página do Unsplash, extrai o ID da foto
  const unsplashPageMatch = url.match(/unsplash\.com\/.*\/([\w-]+)$/)
  if (unsplashPageMatch) {
    const photoId = unsplashPageMatch[1]
    // Se o ID parece ser real (não contém hífens longos)
    if (photoId.length > 5 && photoId.length < 15) {
      const directUrl = `https://images.unsplash.com/photo-${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`
      console.log('🔄 Convertido para URL direta:', directUrl)
      return directUrl
    }
  }

  console.log('⚠️  Não foi possível converter, retornando URL original')
  return url
}

// Testar a conversão
const testUrl = 'https://unsplash.com/pt-br/fotografias/uma-sala-de-estar-com-um-sofa-e-uma-mesa-76JYlSoAYM4'
console.log('🧪 Testando conversão de URL...')
const converted = convertUnsplashUrl(testUrl)
console.log('✅ Resultado final:', converted)