import QRCode from 'qrcode';

export class QrGenerator {
  public static async generateDataUrl(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 2,
        color: {
          dark: '#1e3a2b',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Error al generar código QR');
    }
  }
}
