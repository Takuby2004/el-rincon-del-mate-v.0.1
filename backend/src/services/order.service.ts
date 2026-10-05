import { prisma } from '../config/prisma';
import { FileStorageService } from '../utils/fileStorageService';
import { PaymentQrService } from './paymentQr.service';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity?: string;
  clientCiNit?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export class OrderService {
  public static async createOrder(orderData: CreateOrderInput, fileProof?: Express.Multer.File, userId?: string) {
    // 1. Mandatory check: Payment proof file must exist
    if (!fileProof) {
      throw new Error('El comprobante de pago es obligatorio para procesar el pedido.');
    }

    // 2. Validate active QR existence
    const activeQr = await PaymentQrService.getActiveQr();
    if (!activeQr) {
      throw new Error('En este momento no hay un código QR bancario activo configurado para recibir pagos.');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('El carrito no contiene productos.');
    }

    // 3. Fetch products and recalculate prices/stock in backend
    const productIds = orderData.items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true }
    });

    if (dbProducts.length !== productIds.length) {
      throw new Error('Uno o más productos del carrito no existen o ya no se encuentran disponibles.');
    }

    let calculatedSubtotal = 0;
    const validatedItems: { product: any; quantity: number; unitPrice: number; unitCost: number; itemSubtotal: number }[] = [];

    for (const itemInput of orderData.items) {
      const product = dbProducts.find((p) => p.id === itemInput.productId);
      if (!product) throw new Error(`Producto ${itemInput.productId} no encontrado`);

      if (product.stock < itemInput.quantity) {
        throw new Error(`Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, Solicitado: ${itemInput.quantity}`);
      }

      const itemSubtotal = product.price * itemInput.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product,
        quantity: itemInput.quantity,
        unitPrice: product.price,
        unitCost: product.cost,
        itemSubtotal
      });
    }

    const calculatedTotal = calculatedSubtotal; // Extendable for shipping/tax if needed

    // Save proof image file via FileStorageService
    const { url: proofUrl, fileName: proofFileName, mimeType: proofMimeType } = await FileStorageService.saveFile(fileProof, 'payment-proofs');

    // Generate unique order number (e.g. ORD-20260907-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${Date.now().toString().substring(4)}-${randomSuffix}`;

    // Execute atomic transaction
    return prisma.$transaction(async (tx) => {
      // Find or create client
      let client = await tx.client.findFirst({
        where: { email: orderData.clientEmail }
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            userId: userId || null,
            name: orderData.clientName,
            email: orderData.clientEmail,
            phone: orderData.clientPhone,
            address: orderData.clientAddress,
            city: orderData.clientCity || 'Santa Cruz',
            ciNit: orderData.clientCiNit || ''
          }
        });
      } else {
        // Update client address/phone if changed
        client = await tx.client.update({
          where: { id: client.id },
          data: {
            name: orderData.clientName,
            phone: orderData.clientPhone,
            address: orderData.clientAddress,
            city: orderData.clientCity || client.city,
            ciNit: orderData.clientCiNit || client.ciNit
          }
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          clientId: client.id,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          status: 'PENDING_PAYMENT_VERIFICATION',
          paymentStatus: 'PENDING_VERIFICATION',
          address: orderData.clientAddress,
          city: orderData.clientCity || 'Santa Cruz',
          phone: orderData.clientPhone,
          notes: orderData.notes || '',
          items: {
            create: validatedItems.map((v) => ({
              productId: v.product.id,
              unitPrice: v.unitPrice,
              unitCost: v.unitCost,
              quantity: v.quantity,
              subtotal: v.itemSubtotal
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          client: true
        }
      });

      // Deduct stock and log InventoryMovement for each product with race-condition protection
      for (const v of validatedItems) {
        const updatedProduct = await tx.product.update({
          where: { id: v.product.id },
          data: { stock: { decrement: v.quantity } }
        });

        // Atomic check: prevent race conditions if multiple users buy simultaneously
        if (updatedProduct.stock < 0) {
          throw new Error(`Stock insuficiente para el producto "${v.product.name}" debido a compras simultáneas. Stock disponible agotado.`);
        }

        await tx.inventoryMovement.create({
          data: {
            productId: v.product.id,
            userId: userId || null,
            type: 'ORDER_CREATED',
            quantity: -v.quantity,
            reason: `Reserva de stock por pedido #${order.orderNumber}`
          }
        });
      }

      // Create Payment + PaymentProof
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: calculatedTotal,
          method: 'QR',
          status: 'PENDING_VERIFICATION',
          paymentProof: {
            create: {
              imageUrl: proofUrl,
              originalFileName: proofFileName,
              mimeType: proofMimeType
            }
          }
        },
        include: { paymentProof: true }
      });

      return {
        ...order,
        payment
      };
    });
  }

  public static async getAllOrders(filters?: { status?: string; paymentStatus?: string; search?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    return prisma.order.findMany({
      where,
      include: {
        client: true,
        payment: { include: { paymentProof: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async getOrderById(id: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }]
      },
      include: {
        client: true,
        payment: {
          include: {
            paymentProof: true,
            reviewer: { select: { id: true, name: true, email: true } }
          }
        },
        items: { include: { product: true } }
      }
    });

    if (!order) throw new Error('Pedido no encontrado');
    return order;
  }

  public static async updateOrderStatus(orderId: string, status: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    });

    if (!order) throw new Error('Pedido no encontrado');

    // Rule: Cannot move to PACKING, SHIPPED or DELIVERED if payment is not APPROVED
    if (['PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      if (!order.payment || order.payment.status !== 'APPROVED') {
        throw new Error('No es posible cambiar el estado del pedido a Preparando/Enviado/Entregado si el pago no ha sido verificado y APROBADO por el administrador.');
      }
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any }
    });
  }

  public static async deleteOrder(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: {
          include: { paymentProof: true }
        }
      }
    });

    if (!order) throw new Error('Pedido no encontrado');

    const shouldRestoreStock = order.status !== 'PAYMENT_REJECTED' && order.status !== 'CANCELLED';

    await prisma.$transaction(async (tx) => {
      // 1. Restaurar stock de los productos si el pedido estaba activo
      if (shouldRestoreStock) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              userId: userId || null,
              type: 'ORDER_CANCELLED',
              quantity: item.quantity,
              reason: `Restauración de stock por eliminación de pedido #${order.orderNumber}`
            }
          });
        }
      }

      // 2. Eliminar el pedido de la base de datos (eliminación en cascada de ítems y pagos)
      await tx.order.delete({
        where: { id: orderId }
      });
    });

    // 3. Eliminar archivo físico del comprobante si existe
    if (order.payment?.paymentProof?.imageUrl) {
      await FileStorageService.deleteFile(order.payment.paymentProof.imageUrl);
    }

    return { message: `Pedido #${order.orderNumber} eliminado exitosamente.` };
  }
}
