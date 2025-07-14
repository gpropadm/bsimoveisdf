const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('=== USUÁRIOS ===')
    const users = await prisma.user.findMany()
    console.log('Total de usuários:', users.length)
    users.forEach(user => {
      console.log(`- ID: ${user.id}`)
      console.log(`  Nome: ${user.name}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Criado em: ${user.createdAt}`)
      console.log('')
    })

    console.log('=== PROPRIEDADES ===')
    const properties = await prisma.property.findMany()
    console.log('Total de propriedades:', properties.length)
    properties.forEach(property => {
      console.log(`- ID: ${property.id}`)
      console.log(`  Título: ${property.title}`)
      console.log(`  Slug: ${property.slug}`)
      console.log(`  Tipo: ${property.type}`)
      console.log(`  Status: ${property.status}`)
      console.log(`  Preço: R$ ${property.price}`)
      console.log(`  Cidade: ${property.city}`)
      console.log(`  Criado em: ${property.createdAt}`)
      console.log('')
    })

    console.log('=== LEADS ===')
    const leads = await prisma.lead.findMany()
    console.log('Total de leads:', leads.length)
    leads.forEach(lead => {
      console.log(`- ID: ${lead.id}`)
      console.log(`  Nome: ${lead.name}`)
      console.log(`  Email: ${lead.email}`)
      console.log(`  Telefone: ${lead.phone}`)
      console.log(`  Status: ${lead.status}`)
      console.log(`  Propriedade: ${lead.propertyTitle || 'N/A'}`)
      console.log(`  Criado em: ${lead.createdAt}`)
      console.log('')
    })

    console.log('=== CONFIGURAÇÕES ===')
    const settings = await prisma.settings.findMany()
    console.log('Total de configurações:', settings.length)
    settings.forEach(setting => {
      console.log(`- ID: ${setting.id}`)
      console.log(`  Nome do Site: ${setting.siteName}`)
      console.log(`  Email de Contato: ${setting.contactEmail}`)
      console.log(`  Telefone: ${setting.contactPhone}`)
      console.log(`  WhatsApp: ${setting.contactWhatsapp}`)
      console.log(`  Cidade: ${setting.city}`)
      console.log('')
    })

  } catch (error) {
    console.error('Erro ao consultar banco de dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()