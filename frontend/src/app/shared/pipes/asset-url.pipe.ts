import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assetUrl',
  standalone: true
})
export class AssetUrlPipe implements PipeTransform {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly defaultFallback = 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80';

  transform(value: string | null | undefined, fallback: string = this.defaultFallback): string {
    if (!value || value.trim() === '') {
      return fallback;
    }

    const cleanValue = value.trim();

    // Reemplazar URL rota conocida de Unsplash
    if (cleanValue.includes('photo-1594750853874-9549f7b19688')) {
      return fallback;
    }

    // Manejar rutas relativas de backend (uploads)
    if (cleanValue.startsWith('/uploads/') || cleanValue.startsWith('uploads/')) {
      const normalizedPath = cleanValue.startsWith('/') ? cleanValue : `/${cleanValue}`;
      return `${this.baseUrl}${normalizedPath}`;
    }

    return cleanValue;
  }
}
