import { prisma } from '../config/prisma';
import { FileStorageService } from '../utils/fileStorageService';
import { AppError } from '../errors/AppError';

export class PaymentQrService {
  public static async getActiveQr() {
    const qrConfig = await prisma.paymentQrConfig.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!qrConfig) {
      return null;
    }

    return {
      id: qrConfig.id,
      imageUrl: qrConfig.imageUrl,
      active: qrConfig.active,
      updatedAt: qrConfig.updatedAt
    };
  }

  public static async uploadQr(file: Express.Multer.File, uploadedByUserId: string) {
    if (!file) {
      throw AppError.badRequest('Debe adjuntar una imagen válida del código QR bancario.');
    }

    const { url, fileName, mimeType } = await FileStorageService.saveFile(file, 'payment-qr');

    return prisma.$transaction(async (tx) => {
      // Deactivate any existing active QR
      await tx.paymentQrConfig.updateMany({
        where: { active: true },
        data: { active: false }
      });

      return tx.paymentQrConfig.create({
        data: {
          imageUrl: url,
          fileName,
          mimeType,
          active: true,
          uploadedBy: uploadedByUserId
        }
      });
    });
  }

  public static async getAllQrConfigs() {
    return prisma.paymentQrConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { name: true, email: true }
        }
      }
    });
  }

  public static async deactivateQr(id: string) {
    return prisma.paymentQrConfig.update({
      where: { id },
      data: { active: false }
    });
  }
}
