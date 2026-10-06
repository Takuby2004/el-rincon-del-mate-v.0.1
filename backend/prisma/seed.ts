import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User seguro desde variables de entorno
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@elrincondelmate.com';
  const adminRawPassword = process.env.ADMIN_PASSWORD || 'ChangeMeInProduction_2026!';
  const adminPassword = await bcrypt.hash(adminRawPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Dueño El Rincón del Mate (Tarija & La Paz)',
      role: 'ADMIN',
      phone: '+591 69891494 / 64014507'
    }
  });

  // Create Demo Active Payment QR
  await prisma.paymentQrConfig.create({
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80',
      fileName: 'qr-bancario-dueno.png',
      mimeType: 'image/png',
      active: true,
      uploadedBy: admin.id
    }
  });

  // Create Categories
  const catMates = await prisma.category.upsert({
    where: { slug: 'mates' },
    update: {
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80'
    },
    create: {
      name: 'Mates Artesanales',
      slug: 'mates',
      description: 'Mates de calabaza, madera de algarrobo y acero inoxidable con virola grabada.',
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80'
    }
  });

  const catTermos = await prisma.category.upsert({
    where: { slug: 'termos' },
    update: {
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'
    },
    create: {
      name: 'Termos Térmicos',
      slug: 'termos',
      description: 'Termos de alta conservación de temperatura de 1L y 1.3L.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'
    }
  });

  const catBombillas = await prisma.category.upsert({
    where: { slug: 'bombillas' },
    update: {
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
    },
    create: {
      name: 'Bombillas de Alpaca y Acero',
      slug: 'bombillas',
      description: 'Bombillas con filtro resorte o cuchara de acero 304 y alpaca pura.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
    }
  });

  // Create Products
  const productsData = [
    {
      categoryId: catMates.id,
      name: 'Mate Imperial de Calabaza y Alpaca',
      slug: 'mate-imperial-calabaza-alpaca',
      description: 'Mate Imperial artesanal forrado en cuero vacuno con virola de alpaca cincelada a mano.',
      price: 250.0,
      cost: 120.0,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80'
    },
    {
      categoryId: catMates.id,
      name: 'Mate Torpedo Cincelado Premium',
      slug: 'mate-torpedo-cincelado-premium',
      description: 'Mate Torpedo uruguayo de calabaza brasilera y virola lisa de bronce y alpaca.',
      price: 210.0,
      cost: 95.0,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80'
    },
    {
      categoryId: catTermos.id,
      name: 'Termo Acero Inoxidable 1L Verde Selva',
      slug: 'termo-acero-inoxidable-1l-verde-selva',
      description: 'Termo de doble pared al vacío con tapón cebador de alta precisión. Mantiene frío/calor 24h.',
      price: 320.0,
      cost: 180.0,
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'
    },
    {
      categoryId: catBombillas.id,
      name: 'Bombilla de Alpaca Cuchara Pico Loro',
      slug: 'bombilla-alpaca-cuchara-pico-loro',
      description: 'Bombilla artesanal pico de loro ideal para mates imperiales. Excelente filtrado.',
      price: 85.0,
      cost: 35.0,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
    }
  ];

  for (const prod of productsData) {
    const qrText = `http://localhost:4200/productos/${prod.slug}`;
    const qrCodeUrl = await QRCode.toDataURL(qrText);

    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        imageUrl: prod.imageUrl,
        qrCodeUrl
      },
      create: {
        ...prod,
        qrCodeUrl
      }
    });

    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        userId: admin.id,
        type: 'INITIAL',
        quantity: prod.stock,
        reason: 'Carga inicial de inventario en seed'
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
