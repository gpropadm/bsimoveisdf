// Teste das Regiões Administrativas do DF
// Execute: node test-df-regions.js

const { getAddressFromCEP } = require('./src/lib/geocoding.ts')

async function testDFRegions() {
  console.log('🧪 Teste do Sistema de Regiões Administrativas do DF\n')

  const testCEPs = [
    { cep: '71901-070', expected: 'Águas Claras' },
    { cep: '72020-000', expected: 'Taguatinga' },
    { cep: '72405-610', expected: 'Gama' },
    { cep: '73010-000', expected: 'Sobradinho' },
    { cep: '72220-000', expected: 'Ceilândia' },
    { cep: '71000-000', expected: 'Guará' },
    { cep: '72300-000', expected: 'Samambaia' },
    { cep: '70040-010', expected: 'Brasília' }, // Asa Norte
    { cep: '72500-000', expected: 'Santa Maria' }
  ]

  for (const test of testCEPs) {
    try {
      console.log(`🔍 Testando CEP: ${test.cep} (esperado: ${test.expected})`)

      const result = await getAddressFromCEP(test.cep)

      if (result) {
        const success = result.localidade === test.expected
        console.log(`${success ? '✅' : '❌'} Resultado: ${result.localidade}`)
        console.log(`📍 Endereço: ${result.logradouro}, ${result.bairro}`)
        console.log(`🏙️ Cidade: ${result.localidade}/${result.uf}`)

        if (!success) {
          console.log(`⚠️ ATENÇÃO: Esperado "${test.expected}", recebido "${result.localidade}"`)
        }
      } else {
        console.log('❌ Falha - Não foi possível buscar endereço')
      }

      console.log('─'.repeat(60))

    } catch (error) {
      console.error(`❌ Erro no CEP ${test.cep}:`, error.message)
      console.log('─'.repeat(60))
    }
  }

  console.log('\n🎯 TESTE DO CEP ESPECÍFICO MENCIONADO:')
  console.log('CEP 71901-070 deveria retornar "Águas Claras" em vez de "Brasília"')
}

// Executar teste
testDFRegions().catch(console.error)