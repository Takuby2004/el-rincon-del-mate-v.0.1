import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'El nombre de la categoría es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  description: z.string().trim().optional(),
  imageUrl: z.string().optional()
});

export const updateCategorySchema = createCategorySchema.partial();
