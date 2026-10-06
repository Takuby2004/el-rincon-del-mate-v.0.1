import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El formato del correo electrónico no es válido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña no puede estar vacía')
});

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('El formato del correo electrónico no es válido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  ciNit: z.string().trim().optional()
});
