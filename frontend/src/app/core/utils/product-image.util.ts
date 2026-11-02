import { Product } from '../models/models';

/**
 * Resuelve de forma consistente la imagen de un producto para toda la aplicación.
 * Si el producto tiene una URL de prueba de café de Unsplash o está vacía,
 * devuelve la ilustración artesanal de mate correspondiente (imperial, torpedo, termo, bombilla).
 */
export function resolveProductImage(product: Partial<Product> | null | undefined): string {
  if (!product) return 'assets/producto_mate_16.svg';

  const slug = (product.slug || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const img = (product.imageUrl || '').trim();

  const isCoffeePlaceholder =
    img.includes('photo-1517256064527') ||
    img.includes('photo-1576092768241') ||
    img.includes('photo-1544816155-12df9643f363') ||
    img.includes('photo-1514432324607') ||
    img.includes('photo-1594750853874') ||
    !img;

  if (isCoffeePlaceholder) {
    if (slug.includes('torpedo') || name.includes('torpedo') || img.includes('photo-1576092768241')) {
      return 'assets/producto_mate_27.svg';
    }
    if (slug.includes('termo') || name.includes('termo') || img.includes('photo-1544816155-12df9643f363')) {
      return 'assets/producto_mate_18.svg';
    }
    if (slug.includes('bombilla') || name.includes('bombilla') || img.includes('photo-1514432324607')) {
      return 'assets/producto_mate_31.svg';
    }
    return 'assets/producto_mate_16.svg';
  }

  return img;
}

/**
 * Resuelve la galería completa de imágenes del producto.
 * Si tiene fotos adicionales en `product.images`, las retorna; si no,
 * retorna un arreglo con la imagen principal resuelta.
 */
export function resolveProductImages(product: Partial<Product> | null | undefined): string[] {
  if (!product) return ['assets/producto_mate_16.svg'];
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return [resolveProductImage(product)];
}

