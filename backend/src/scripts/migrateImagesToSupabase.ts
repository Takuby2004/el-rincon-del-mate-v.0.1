import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { validateImageMagicBytes } from '../utils/fileStorageService';

async function uploadLocalFileToSupabase(
  relativeUrlOrPath: string,
  folder: string,
  supabaseBucket: string
): Promise<string | null> {
  try {
    // Normalizar ruta local eliminando prefijo /uploads/
    const cleanRelative = relativeUrlOrPath.replace(/^\/?uploads\//, '');
    const uploadsDir = path.join(__dirname, '../../uploads');
    const localFullPath = path.join(uploadsDir, cleanRelative);

    if (!fs.existsSync(localFullPath)) {
      console.warn(`  ⚠️ Archivo físico no encontrado en disco: ${localFullPath}`);
      return null;
    }

    const buffer = await fs.promises.readFile(localFullPath);
    const validation = validateImageMagicBytes(buffer);
    const mimeType = validation.isValid ? validation.detectedMime : 'image/jpeg';

    const fileName = path.basename(localFullPath);
    const objectPath = `${folder}/${fileName}`;

    console.log(`  ⬆️ Subiendo a Supabase Storage: [${supabaseBucket}] ${objectPath}...`);
    const { error: uploadError } = await supabaseAdmin.storage
      .from(supabaseBucket)
      .upload(objectPath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error(`  ❌ Error al subir ${fileName} a Supabase:`, uploadError.message);
      return null;
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(supabaseBucket)
      .getPublicUrl(objectPath);

    return publicData.publicUrl;
  } catch (err: any) {
    console.error(`  ❌ Excepción al migrar archivo ${relativeUrlOrPath}:`, err?.message || err);
    return null;
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 MIGRACIÓN DE IMÁGENES LOCALES A SUPABASE STORAGE');
  console.log('====================================================');

  const supabaseBucket = env.SUPABASE_STORAGE_BUCKET || 'el-rincon-del-mate';

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ [ERROR] Variables de Supabase no configuradas.');
    console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo backend/.env.');
    process.exit(1);
  }

  console.log(`📡 Conectando a Supabase URL: ${env.SUPABASE_URL}`);
  console.log(`📦 Bucket objetivo: ${supabaseBucket}`);
  console.log('----------------------------------------------------');

  let migratedProducts = 0;
  let migratedCategories = 0;
  let migratedQrs = 0;
  let migratedProofs = 0;

  // 1. Migración de Productos
  console.log('\n🔍 [1/4] Analizando Productos...');
  const products = await prisma.product.findMany();
  for (const product of products) {
    let hasChanges = false;
    let newImageUrl = product.imageUrl;
    let newImages: string[] = [];

    // Portada principal
    if (product.imageUrl && (product.imageUrl.startsWith('/uploads/') || product.imageUrl.startsWith('uploads/'))) {
      const publicUrl = await uploadLocalFileToSupabase(product.imageUrl, 'products', supabaseBucket);
      if (publicUrl) {
        newImageUrl = publicUrl;
        hasChanges = true;
      }
    }

    // Galería de imágenes adicionales
    if (Array.isArray(product.images) && product.images.length > 0) {
      newImages = [];
      for (const img of product.images) {
        if (typeof img === 'string' && (img.startsWith('/uploads/') || img.startsWith('uploads/'))) {
          const publicUrl = await uploadLocalFileToSupabase(img, 'products', supabaseBucket);
          newImages.push(publicUrl || img);
          if (publicUrl) hasChanges = true;
        } else if (typeof img === 'string') {
          newImages.push(img);
        }
      }
    }

    if (hasChanges) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          imageUrl: newImageUrl,
          ...(newImages.length > 0 ? { images: newImages } : {})
        }
      });
      migratedProducts++;
      console.log(`  ✅ Producto actualizado en BD: "${product.name}"`);
    }
  }

  // 2. Migración de Categorías
  console.log('\n🔍 [2/4] Analizando Categorías...');
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (cat.imageUrl && (cat.imageUrl.startsWith('/uploads/') || cat.imageUrl.startsWith('uploads/'))) {
      const publicUrl = await uploadLocalFileToSupabase(cat.imageUrl, 'categories', supabaseBucket);
      if (publicUrl) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { imageUrl: publicUrl }
        });
        migratedCategories++;
        console.log(`  ✅ Categoría actualizada en BD: "${cat.name}"`);
      }
    }
  }

  // 3. Migración de QR de Pago
  console.log('\n🔍 [3/4] Analizando Códigos QR de Pago...');
  const qrConfigs = await prisma.paymentQrConfig.findMany();
  for (const qr of qrConfigs) {
    if (qr.imageUrl && (qr.imageUrl.startsWith('/uploads/') || qr.imageUrl.startsWith('uploads/'))) {
      const publicUrl = await uploadLocalFileToSupabase(qr.imageUrl, 'payment-qr', supabaseBucket);
      if (publicUrl) {
        await prisma.paymentQrConfig.update({
          where: { id: qr.id },
          data: { imageUrl: publicUrl }
        });
        migratedQrs++;
        console.log(`  ✅ Código QR actualizado en BD (ID: ${qr.id})`);
      }
    }
  }

  // 4. Migración de Comprobantes de Pedidos (Payment Proofs)
  console.log('\n🔍 [4/4] Analizando Comprobantes de Pago de Pedidos...');
  const proofs = await prisma.paymentProof.findMany();

  for (const proof of proofs) {
    if (proof.imageUrl && (proof.imageUrl.startsWith('/uploads/') || proof.imageUrl.startsWith('uploads/'))) {
      const publicUrl = await uploadLocalFileToSupabase(proof.imageUrl, 'payment-proofs', supabaseBucket);
      if (publicUrl) {
        await prisma.paymentProof.update({
          where: { id: proof.id },
          data: { imageUrl: publicUrl }
        });
        migratedProofs++;
        console.log(`  ✅ Comprobante de pago actualizado en BD (ID: ${proof.id})`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('🎉 RESUMEN DE MIGRACIÓN COMPLETADO');
  console.log('====================================================');
  console.log(`📦 Productos migrados a Supabase:   ${migratedProducts}`);
  console.log(`📁 Categorías migradas a Supabase:  ${migratedCategories}`);
  console.log(`📱 Códigos QR migrados a Supabase:  ${migratedQrs}`);
  console.log(`🧾 Comprobantes de pago migrados:   ${migratedProofs}`);
  console.log('====================================================\n');
}

runMigration()
  .catch((e) => {
    console.error('❌ Error fatal en el proceso de migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
