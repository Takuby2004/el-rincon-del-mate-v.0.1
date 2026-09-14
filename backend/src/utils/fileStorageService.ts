import fs from 'fs';
import path from 'path';

export class FileStorageService {
  private static uploadDir = path.join(__dirname, '../../uploads');

  private static ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public static async saveFile(file: Express.Multer.File, folder: string = 'general'): Promise<{ url: string; fileName: string; mimeType: string }> {
    this.ensureUploadDirExists();
    const targetFolder = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const fileExt = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
    const filePath = path.join(targetFolder, uniqueFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const relativeUrl = `/uploads/${folder}/${uniqueFileName}`;
    return {
      url: relativeUrl,
      fileName: file.originalname,
      mimeType: file.mimetype
    };
  }

  public static async saveFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<Array<{ url: string; fileName: string; mimeType: string }>> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map(file => this.saveFile(file, folder)));
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
