import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function syncAdmin() {
  console.log('🔄 Iniciando sincronización de permisos de Administrador...\n');

  const adminEmail = (process.env.ADMIN_EMAIL || 'rincondelmatebo@gmail.com').trim().toLowerCase();

  console.log(`📌 Correo de Administrador objetivo: ${adminEmail}`);

  try {
    // 1. Buscar si el usuario ya existe en la base de datos
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: adminEmail,
          mode: 'insensitive'
        }
      }
    });

    if (existingUser) {
      console.log(`👤 Usuario encontrado en PostgreSQL:`);
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Nombre: ${existingUser.name}`);
      console.log(`   - Rol actual: ${existingUser.role}`);

      if (existingUser.role !== 'ADMIN') {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'ADMIN',
            email: adminEmail // normalizar correo
          }
        });
        console.log(`\n✅ ¡ROL ACTUALIZADO! El usuario ahora tiene rol: ${updated.role}`);
      } else {
        console.log(`\n✅ El usuario ya cuenta con rol de ADMIN. Todo en orden.`);
      }
    } else {
      console.log(`⚠️ El usuario no existía en la base de datos PostgreSQL local.`);
      console.log(`➕ Creando registro de Administrador vinculado a Supabase Auth...`);

      const newUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Administrador Dueño',
          password: 'SUPABASE_AUTH_MANAGED',
          role: 'ADMIN',
          phone: '+591 69891494'
        }
      });

      console.log(`\n✅ ¡ADMINISTRADOR CREADO CON ÉXITO!`);
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Email: ${newUser.email}`);
      console.log(`   - Rol: ${newUser.role}`);
    }

    // 2. Resumen de administradores en el sistema
    const allAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });

    console.log(`\n📋 Administradores registrados en la tienda (${allAdmins.length}):`);
    allAdmins.forEach((adm, idx) => {
      console.log(`   ${idx + 1}. ${adm.name} <${adm.email}> [${adm.role}]`);
    });

    console.log('\n🎉 Sincronización completada con éxito.');
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncAdmin();

