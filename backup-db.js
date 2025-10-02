const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backup() {
  try {
    console.log('Iniciando backup...');
    
    const properties = await prisma.property.findMany({
      include: {
        leads: true,
        appointments: true,
        whatsappMessages: true,
        priceAlerts: true
      }
    });
    
    const users = await prisma.user.findMany();
    const settings = await prisma.settings.findMany();
    const leads = await prisma.lead.findMany();
    const appointments = await prisma.appointment.findMany();
    
    const backup = {
      properties,
      users,
      settings,
      leads,
      appointments,
      timestamp: new Date().toISOString()
    };
    
    const filename = `backup-database-${new Date().toISOString().replace(/:/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup salvo em: ${filename}`);
    console.log(`Total de imóveis: ${properties.length}`);
    console.log(`Total de usuários: ${users.length}`);
    
  } catch (error) {
    console.error('Erro no backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
