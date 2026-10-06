import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string({ required_error: 'El nombre es obligatorio' }).min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
  email: z.string({ required_error: 'El correo electrónico es obligatorio' }).email('Formato de correo no válido').toLowerCase().trim(),
  phone: z.string({ required_error: 'El teléfono es obligatorio' }).min(6, 'El teléfono debe tener al menos 6 dígitos').trim(),
  address: z.string({ required_error: 'La dirección es obligatoria' }).min(3, 'Dirección no válida').trim(),
  city: z.string().trim().optional().default('Santa Cruz'),
  ciNit: z.string().trim().optional()
});

export const updateClientSchema = createClientSchema.partial();
