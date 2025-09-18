#!/usr/bin/env node

/**
 * Script para testar o sistema de matching de leads
 * Usage: node test-matching.js [propertyId]
 */

async function testMatching(propertyId) {
  const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log('🧪 Testando Sistema de Matching de Leads')
  console.log('=' .repeat(50))

  if (!propertyId) {
    console.log('❌ Uso: node test-matching.js [propertyId]')
    console.log('💡 Exemplo: node test-matching.js clrx8y0000001l0h8abc123')
    process.exit(1)
  }

  try {
    console.log(`🎯 Buscando leads para imóvel: ${propertyId}`)

    const response = await fetch(`${API_URL}/api/admin/properties/match-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ propertyId })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    console.log('\n📊 Resultado do Matching:')
    console.log('-'.repeat(30))
    console.log(`🏠 Imóvel: ${result.property.title}`)
    console.log(`🎯 Leads encontrados: ${result.matches}`)
    console.log(`📱 WhatsApps enviados: ${result.whatsappSent}`)

    if (result.details && result.details.length > 0) {
      console.log('\n👥 Detalhes dos Matches:')
      result.details.forEach((match, index) => {
        console.log(`\n${index + 1}. ${match.leadName}`)
        console.log(`   📞 ${match.leadPhone}`)
        console.log(`   ⭐ Score: ${match.matchScore}`)
        console.log(`   ✅ Motivos:`)
        match.matchReasons.forEach(reason => {
          console.log(`      • ${reason}`)
        })
      })
    }

    console.log('\n✅ Teste concluído com sucesso!')

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const propertyId = process.argv[2]
  testMatching(propertyId)
}

module.exports = { testMatching }