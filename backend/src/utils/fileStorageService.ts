import fs from 'fs';
import path from 'path';
import { AppError } from '../errors/AppError';

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

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)?.trim();
    const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'el-rincon-del-mate';

    // Generar nombre de archivo único con la extensión garantizada por los magic bytes
    const safeExt = validation.extension;
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${safeExt}`;

    // 1. Si Supabase Storage está configurado en producción, subir a la nube
    if (supabaseUrl && supabaseKey) {
      try {
        const objectPath = `${folder}/${uniqueFileName}`;
        const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${objectPath}`;

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': validation.detectedMime,
            'x-upsert': 'true'
          },
          body: file.buffer as any
        });

        if (response.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${objectPath}`;
          return {
            url: publicUrl,
            fileName: file.originalname,
            mimeType: validation.detectedMime
          };
        } else {
          const errText = await response.text();
          console.warn('[FileStorageService] Advertencia en Supabase Storage. Usando almacenamiento local:', errText);
        }
      } catch (cloudErr) {
        console.warn('[FileStorageService] Excepción en Supabase Storage. Usando almacenamiento local:', cloudErr);
      }
    }

    // 2. Fallback: Almacenamiento local en disco
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
      if (!fileUrl || !fileUrl.startsWith('/uploads/')) return false;
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(this.uploadDir, relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    return false;
  }
}
