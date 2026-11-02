import fs from 'fs';
import path from 'path';
import { AppError } from '../errors/AppError';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';

export interface ImageValidationResult {
  isValid: boolean;
  detectedMime: string;
  extension: string;
}

/**
 * Valida firmas binarias ("magic bytes") para asegurar que el archivo sea una imagen auténtica.
 * Evita ataques de MIME Spoofing y ejecución de scripts maliciosos.
 */
export function validateImageMagicBytes(buffer: Buffer): ImageValidationResult {
  if (!buffer || buffer.length < 12) {
    return { isValid: false, detectedMime: '', extension: '' };
  }

  // 1. JPEG / JPG: Primeros 3 bytes FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, detectedMime: 'image/jpeg', extension: '.jpg' };
  }

  // 2. PNG: Primeros 8 bytes 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { isValid: true, detectedMime: 'image/png', extension: '.png' };
  }

  // 3. WEBP: Bytes 0-3 'RIFF' (52 49 46 46) y Bytes 8-11 'WEBP' (57 45 42 50)
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { isValid: true, detectedMime: 'image/webp', extension: '.webp' };
  }

  return { isValid: false, detectedMime: '', extension: '' };
}

export class FileStorageService {
  private static uploadDir = path.join(__dirname, '../../uploads');

  private static ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public static async saveFile(
    file: Express.Multer.File,
    folder: string = 'general'
  ): Promise<{ url: string; fileName: string; mimeType: string }> {
    if (!file || !file.buffer) {
      throw AppError.badRequest('No se recibió ningún archivo binario para almacenar.');
    }

    // P1-4: Validación de firmas binarias reales (Magic Bytes)
    const validation = validateImageMagicBytes(file.buffer);
    if (!validation.isValid) {
      throw AppError.badRequest(
        `El archivo "${file.originalname}" no contiene una firma binaria de imagen válida. Solo se admiten formatos auténticos JPG, PNG o WEBP.`
      );
    }

    const isProduction = env.NODE_ENV === 'production';
    const supabaseBucket = env.SUPABASE_STORAGE_BUCKET || 'el-rincon-del-mate';
    const isCloudConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

    // Generar nombre de archivo único con la extensión garantizada por los magic bytes
    const safeExt = validation.extension;
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${safeExt}`;
    const objectPath = `${folder}/${uniqueFileName}`;

    // 1. Si Supabase Storage está configurado con clave administrativa (service_role), subir a la nube
    if (isCloudConfigured) {
      try {
        const { data, error: uploadError } = await supabaseAdmin.storage
          .from(supabaseBucket)
          .upload(objectPath, file.buffer, {
            contentType: validation.detectedMime,
            upsert: true
          });

        if (uploadError) {
          console.error('[FileStorageService] Error al subir archivo a Supabase Storage:', uploadError);
          if (isProduction) {
            throw AppError.internal(
              `Error al persistir la imagen en Supabase Storage: ${uploadError.message || JSON.stringify(uploadError)}`
            );
          }
          console.warn('[FileStorageService] Fallback a almacenamiento local debido a error en Supabase Storage.');
        } else {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(supabaseBucket)
            .getPublicUrl(objectPath);

          return {
            url: publicUrlData.publicUrl,
            fileName: file.originalname,
            mimeType: validation.detectedMime
          };
        }
      } catch (cloudErr: any) {
        if (cloudErr instanceof AppError) {
          throw cloudErr;
        }
        console.error('[FileStorageService] Excepción de conexión con Supabase Storage:', cloudErr);
        if (isProduction) {
          throw AppError.internal(
            `Error de conexión con el servicio de almacenamiento en la nube: ${cloudErr?.message || cloudErr}`
          );
        }
        console.warn('[FileStorageService] Fallback a almacenamiento local tras excepción en la nube.');
      }
    } else if (isProduction) {
      throw AppError.internal(
        'El almacenamiento permanente en la nube (Supabase) no está configurado. ' +
        'Falta la variable SUPABASE_SERVICE_ROLE_KEY en el entorno de producción.'
      );
    }

    // 2. Fallback: Almacenamiento local en disco (Solo en desarrollo local)
    this.ensureUploadDirExists();
    const targetFolder = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, uniqueFileName);
    await fs.promises.writeFile(filePath, file.buffer);

    const relativeUrl = `/uploads/${folder}/${uniqueFileName}`;
    return {
      url: relativeUrl,
      fileName: file.originalname,
      mimeType: validation.detectedMime
    };
  }

  public static async saveFiles(
    files: Express.Multer.File[],
    folder: string = 'general'
  ): Promise<Array<{ url: string; fileName: string; mimeType: string }>> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.saveFile(file, folder)));
  }

  public static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl) return false;

      const supabaseBucket = env.SUPABASE_STORAGE_BUCKET || 'el-rincon-del-mate';

      if (fileUrl.includes(`/storage/v1/object/public/${supabaseBucket}/`)) {
        const rawPath = fileUrl.split(`/storage/v1/object/public/${supabaseBucket}/`)[1];
        const objectPath = rawPath?.split('?')[0]?.trim();
        if (objectPath) {
          const { error } = await supabaseAdmin.storage
            .from(supabaseBucket)
            .remove([objectPath]);
          if (error) {
            console.error('[FileStorageService] Error al eliminar archivo en Supabase Storage:', error);
            return false;
          }
          console.log(`[FileStorageService] Archivo liberado de Supabase Storage: ${objectPath}`);
          return true;
        }
      }

      if (fileUrl.startsWith('/uploads/')) {
        const relativePath = fileUrl.replace('/uploads/', '');
        const fullPath = path.join(this.uploadDir, relativePath);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
          return true;
        }
      }
    } catch (error) {
      console.error('[FileStorageService] Error al eliminar archivo:', error);
    }
    return false;
  }
}
