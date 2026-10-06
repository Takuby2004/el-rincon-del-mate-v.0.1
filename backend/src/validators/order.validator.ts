import { z } from 'zod';

export const createOrderItemSchema = z.object({
  productId: z
    .string({ required_error: 'El ID del producto es obligatorio' })
    .min(1, 'Identificador de producto no válido'),
  quantity: z.coerce
    .number({ required_error: 'La cantidad es obligatoria' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1')
    .max(99, 'La cantidad máxima por producto es 99')
});

export const createOrderBodySchema = z.object({
  clientName: z
    .string({ required_error: 'El nombre del cliente es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .trim(),
  clientEmail: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .email('Formato de correo electrónico inválido')
    .toLowerCase()
    .trim(),
  clientPhone: z
    .string({ required_error: 'El teléfono es obligatorio' })
    .min(6, 'El teléfono debe tener al menos 6 dígitos')
    .trim(),
  clientAddress: z
    .string({ required_error: 'La dirección es obligatoria' })
    .min(3, 'La dirección de entrega debe ser descriptiva')
    .trim(),
  clientCity: z.string().trim().optional().default('Santa Cruz'),
  clientCiNit: z.string().trim().optional().default(''),
  notes: z.string().trim().optional(),
  items: z
    .array(createOrderItemSchema, { required_error: 'Los ítems son obligatorios' })
    .min(1, 'El carrito no puede estar vacío')
    .max(50, 'No se permiten más de 50 ítems en un solo pedido')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      'PENDING_PAYMENT_VERIFICATION',
      'PAID',
      'PACKING',
      'SHIPPED',
      'DELIVERED',
      'PAYMENT_REJECTED',
      'CANCELLED'
    ],
    {
      errorMap: () => ({
        message: 'Estado de pedido no reconocido en el sistema'
      })
    }
  )
});

export const rejectPaymentSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'El motivo de rechazo es obligatorio' })
    .min(3, 'Debe especificar un motivo descriptivo (mínimo 3 caracteres)')
    .trim(),
  notifyEmail: z.boolean().optional().default(true)
});
