import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'El nombre del producto es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  categoryId: z
    .string({ required_error: 'La categoría es obligatoria' })
    .min(1, 'El identificador de categoría no es válido'),
  description: z
    .string({ required_error: 'La descripción es obligatoria' })
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .trim(),
  price: z.coerce
    .number({ required_error: 'El precio es obligatorio' })
    .min(0, 'El precio no puede ser negativo'),
  cost: z.coerce
    .number()
    .min(0, 'El costo no puede ser negativo')
    .default(0),
  stock: z.coerce
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  imageUrl: z.string().optional(),
  images: z.any().optional(),
  active: z.coerce.boolean().optional().default(true)
});

export const updateProductSchema = createProductSchema.partial();
