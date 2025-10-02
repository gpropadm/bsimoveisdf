const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restore(filename) {
  try {
    if (!filename) {
      console.error('❌ Informe o arquivo de backup!');
      console.log('Uso: node restore-db.js backup-database-XXXX.json');
      process.exit(1);
    }

    if (!fs.existsSync(filename)) {
      console.error('❌ Arquivo não encontrado:', filename);
      process.exit(1);
    }

    console.log('📥 Carregando backup de:', filename);
    const backup = JSON.parse(fs.readFileSync(filename, 'utf8'));

    console.log('🗑️  Limpando banco atual...');
    await prisma.appointment.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    await prisma.settings.deleteMany();

    console.log('📦 Restaurando dados...');

    // Restaurar settings
    for (const setting of backup.settings) {
      const { id, ...data } = setting;
      await prisma.settings.create({ data });
    }

    // Restaurar users
    for (const user of backup.users) {
      const { id, ...data } = user;
      await prisma.user.create({ data });
    }

    // Restaurar properties
    for (const property of backup.properties) {
      const { id, leads, appointments, whatsappMessages, priceAlerts, ...data } = property;
      await prisma.property.create({ data });
    }

    // Restaurar leads
    for (const lead of backup.leads) {
      const { id, ...data } = lead;
      await prisma.lead.create({ data });
    }

    // Restaurar appointments
    for (const appointment of backup.appointments) {
      const { id, ...data } = appointment;
      await prisma.appointment.create({ data });
    }

    console.log('✅ Restauração concluída!');
    console.log('Imóveis restaurados:', backup.properties.length);
    console.log('Usuários restaurados:', backup.users.length);

  } catch (error) {
    console.error('❌ Erro na restauração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const filename = process.argv[2];
restore(filename);
