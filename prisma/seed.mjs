import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [ElysiumPad] Iniciando seed de base de datos...');

  // 1. Configuración Global
  const existingSettings = await prisma.globalSettings.findUnique({
    where: { id: 'default' },
  });

  if (!existingSettings) {
    console.log('⚙️ Creando configuración global inicial...');
    await prisma.globalSettings.create({
      data: {
        id: 'default',
        maintenanceMode: false,
        registrationsOpen: true,
        freePlanMaxLaunchers: 1,
        adsEnabled: true,
        adBannerText: 'Alojamiento de Minecraft de alto rendimiento • Patrocinado',
        adBannerLink: 'https://elysiumpad.com',
      },
    });
    console.log('✅ Configuración global inicial creada.');
  } else {
    console.log('ℹ️ Configuración global ya existe.');
  }

  // 2. Administrador Principal por Defecto
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@elysiumpad.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123456';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log(`👤 Creando usuario administrador inicial (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'SuperAdmin ElysiumPad',
        passwordHash,
        role: 'ADMIN',
        plan: 'LIFETIME',
        status: 'ACTIVE',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'SYSTEM_INITIAL_SEED',
        details: `Usuario administrador inicial (${adminEmail}) creado automáticamente.`,
        userId: newAdmin.id,
      },
    });

    console.log(`✅ Administrador creado con éxito. Correo: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Administrador (${adminEmail}) ya existe.`);
  }

  console.log('🚀 [ElysiumPad] Seed completado correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
