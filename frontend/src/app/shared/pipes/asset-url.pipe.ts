import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'assetUrl',
  standalone: true
})
export class AssetUrlPipe implements PipeTransform {
  private readonly baseUrl = environment.baseUrl;
  private readonly defaultFallback = 'assets/producto_mate_16.svg';

  transform(value: string | null | undefined, fallback: string = this.defaultFallback): string {
    if (!value || value.trim() === '') {
      return fallback;
    }

    const cleanValue = value.trim();

    // Reemplazar URLs de prueba de café por el mate correspondiente
    if (cleanValue.includes('photo-1576092768241')) return 'assets/producto_mate_27.svg';
    if (cleanValue.includes('photo-1544816155-12df9643f363')) return 'assets/producto_mate_18.svg';
    if (cleanValue.includes('photo-1514432324607')) return 'assets/producto_mate_31.svg';
    if (cleanValue.includes('photo-1517256064527') || cleanValue.includes('photo-1594750853874-9549f7b19688')) {
      return 'assets/producto_mate_16.svg';
    }

    // Manejar rutas relativas de backend (uploads)
    if (cleanValue.startsWith('/uploads/') || cleanValue.startsWith('uploads/')) {
      const normalizedPath = cleanValue.startsWith('/') ? cleanValue : `/${cleanValue}`;
      return `${this.baseUrl}${normalizedPath}`;
    }

    return cleanValue;
  }
}
