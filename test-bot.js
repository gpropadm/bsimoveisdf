// Script para testar o Bot WhatsApp localmente
// Execute: node test-bot.js

const conversas = [
  {
    nome: "Teste 1 - Cliente interessado em apartamento",
    mensagens: [
      "Oi, quero apartamento 2 quartos em Águas Claras até R$ 500 mil",
      "O primeiro parece legal",
      "João Silva",
      "joao@email.com"
    ]
  },
  {
    nome: "Teste 2 - Cliente buscando casa",
    mensagens: [
      "Olá, procuro casa pra comprar",
      "Em Taguatinga",
      "Até 700 mil",
      "Maria Santos",
      "maria@email.com"
    ]
  },
  {
    nome: "Teste 3 - Lead quente (urgência)",
    mensagens: [
      "Preciso urgente de apartamento pra alugar!",
      "Pode ser em qualquer lugar, até R$ 3000",
      "Pedro Costa",
      "pedro@email.com",
      "Quero visitar ainda hoje"
    ]
  }
]

async function testConversation(conversa) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🧪 TESTANDO: ${conversa.nome}`)
  console.log('='.repeat(60))

  const telefone = `+5561${Math.floor(Math.random() * 900000000 + 100000000)}`
  console.log(`📱 Telefone: ${telefone}\n`)

  for (let i = 0; i < conversa.mensagens.length; i++) {
    const mensagem = conversa.mensagens[i]
    console.log(`\n👤 CLIENTE: "${mensagem}"`)
    console.log('⏳ Processando...\n')

    try {
      const response = await fetch('http://localhost:3000/api/bot/whatsapp/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: telefone,
          text: mensagem,
          id: `msg_${Date.now()}_${i}`
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log(`🤖 BOT: "${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}"`)

        if (data.leadCreated) {
          console.log('\n✅ LEAD CRIADO NO CRM!')
          console.log(`   Lead ID: ${data.leadId}`)
        }
      } else {
        console.error('❌ Erro:', data.error)
      }

    } catch (error) {
      console.error('❌ Erro na requisição:', error.message)
    }

    // Aguardar 2s entre mensagens
    if (i < conversa.mensagens.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  console.log(`\n✅ Teste concluído!`)
  console.log(`📊 Veja no monitor: http://localhost:3000/admin/bot-monitor`)
}

async function runAllTests() {
  console.log('\n🚀 INICIANDO TESTES DO BOT WHATSAPP\n')
  console.log('⚠️  Certifique-se que o servidor está rodando: npm run dev\n')

  for (const conversa of conversas) {
    await testConversation(conversa)
    console.log('\n⏱️  Aguardando 3s antes do próximo teste...\n')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 TODOS OS TESTES CONCLUÍDOS!')
  console.log('='.repeat(60))
  console.log('\n📊 Acesse para ver os resultados:')
  console.log('   • Monitor: http://localhost:3000/admin/bot-monitor')
  console.log('   • CRM: http://localhost:3000/admin/crm')
  console.log('   • Leads: http://localhost:3000/admin/leads\n')
}

// Executar testes
runAllTests().catch(console.error)
