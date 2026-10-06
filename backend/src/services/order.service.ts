import crypto from 'crypto';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { FileStorageService } from '../utils/fileStorageService';
import { PaymentQrService } from './paymentQr.service';
import { AppError } from '../errors/AppError';
import { parsePaginationParams, buildPaginatedResponse } from '../utils/pagination';

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT_VERIFICATION: ['PAID', 'PAYMENT_REJECTED', 'CANCELLED'],
  PAID: ['PACKING', 'CANCELLED'],
  PACKING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  PAYMENT_REJECTED: ['PENDING_PAYMENT_VERIFICATION', 'PAID'],
  CANCELLED: []
};

const ACTIVE_STOCK_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT_VERIFICATION',
  'PAID',
  'PACKING',
  'SHIPPED',
  'DELIVERED'
];

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
  public static formatOrder(order: any) {
    if (!order) return order;
    return {
      ...order,
      subtotal: Number(order.subtotal) || 0,
      total: Number(order.total) || 0,
      payment: order.payment
        ? {
            ...order.payment,
            amount: Number(order.payment.amount) || 0
          }
        : order.payment,
      items: order.items?.map((i: any) => ({
        ...i,
        unitPrice: Number(i.unitPrice) || 0,
        unitCost: Number(i.unitCost) || 0,
        subtotal: Number(i.subtotal) || 0,
        product: i.product
          ? {
              ...i.product,
              price: Number(i.product.price) || 0,
              ...(i.product.cost !== undefined && i.product.cost !== null ? { cost: Number(i.product.cost) || 0 } : {})
            }
          : i.product
      }))
    };
  }

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

    // 3. Validar datos requeridos del cliente
    if (!orderData.clientName?.trim()) throw new Error('El nombre del cliente es obligatorio.');
    if (!orderData.clientEmail?.trim()) throw new Error('El correo electrónico es obligatorio.');
    if (!orderData.clientPhone?.trim()) throw new Error('El teléfono de contacto es obligatorio.');
    if (!orderData.clientAddress?.trim()) throw new Error('La dirección de entrega es obligatoria.');

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('El carrito no contiene productos.');
    }

    if (orderData.items.length > 50) {
      throw new Error('El pedido excede el límite máximo de 50 ítems por orden.');
    }

    // 4. Validar y fusionar productos e items (P0-1: control de cantidades positivas enteras)
    const mergedMap = new Map<string, number>();
    for (const it of orderData.items) {
      if (!it.productId || typeof it.productId !== 'string' || !it.productId.trim()) {
        throw new Error('Cada producto del pedido debe contar con un identificador válido.');
      }
      const pId = it.productId.trim();
      const qty = Number(it.quantity);

      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        throw new Error('La cantidad de cada producto debe ser un número entero entre 1 y 99.');
      }

      const existingQty = mergedMap.get(pId) || 0;
      const totalQty = existingQty + qty;
      if (totalQty > 99) {
        throw new Error('La cantidad máxima permitida por producto es de 99 unidades.');
      }
      mergedMap.set(pId, totalQty);
    }

    const normalizedItems = Array.from(mergedMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));

    // 5. Fetch products and recalculate prices/stock in backend
    const productIds = normalizedItems.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true }
    });

    if (dbProducts.length !== productIds.length) {
      throw new Error('Uno o más productos del carrito no existen o ya no se encuentran disponibles.');
    }

    let calculatedSubtotal = 0;
    const validatedItems: { product: any; quantity: number; unitPrice: number; unitCost: number; itemSubtotal: number }[] = [];

    for (const itemInput of normalizedItems) {
      const product = dbProducts.find((p) => p.id === itemInput.productId);
      if (!product) throw new Error(`Producto ${itemInput.productId} no encontrado`);

      if (product.stock < itemInput.quantity) {
        throw new Error(`Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, Solicitado: ${itemInput.quantity}`);
      }

      const itemSubtotal = Number(product.price) * itemInput.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product,
        quantity: itemInput.quantity,
        unitPrice: Number(product.price),
        unitCost: Number(product.cost),
        itemSubtotal
      });
    }

    const calculatedTotal = calculatedSubtotal;

    // Save proof image file via FileStorageService
    const { url: proofUrl, fileName: proofFileName, mimeType: proofMimeType } = await FileStorageService.saveFile(fileProof, 'payment-proofs');

    // P0-3: Generar número de pedido único con entropía criptográfica (no predecible)
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `ORD-${datePrefix}-${randomHex}`;

    // Execute atomic transaction
    return prisma.$transaction(async (tx) => {
      // P0-6: Normalizar email y buscar cliente
      const normalizedEmail = orderData.clientEmail.trim().toLowerCase();
      let client = await tx.client.findFirst({
        where: { email: normalizedEmail }
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            userId: userId || null,
            name: orderData.clientName.trim(),
            email: normalizedEmail,
            phone: orderData.clientPhone.trim(),
            address: orderData.clientAddress.trim(),
            city: (orderData.clientCity || 'Santa Cruz').trim(),
            ciNit: (orderData.clientCiNit || '').trim()
          }
        });
      } else if (userId && client.userId === userId) {
        // Solo si el usuario que realiza la compra está autenticado como dueño de la cuenta
        client = await tx.client.update({
          where: { id: client.id },
          data: {
            name: orderData.clientName.trim() || client.name,
            phone: orderData.clientPhone.trim() || client.phone,
            address: orderData.clientAddress.trim() || client.address,
            city: (orderData.clientCity || client.city).trim(),
            ciNit: (orderData.clientCiNit || client.ciNit || '').trim()
          }
        });
      }

      if (!client) {
        throw new Error('Error al procesar la información del cliente.');
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

      return OrderService.formatOrder({
        ...order,
        payment
      });
    });
  }

  public static async getAllOrders(filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: string | number;
    pageSize?: string | number;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status as any;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const { page, pageSize, skip, take, isPaginated } = parsePaginationParams(filters || {});
    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: true,
        payment: { include: { paymentProof: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: isPaginated ? skip : undefined,
      take: isPaginated ? take : undefined
    });

    const formattedOrders = orders.map(OrderService.formatOrder);

    if (isPaginated) {
      return buildPaginatedResponse(formattedOrders, total, page, pageSize);
    }
    return formattedOrders;
  }

  public static async getOrderById(id: string, isAdmin: boolean = false) {
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

    // P0-3: Si la consulta no es de un administrador, devolver únicamente DTO público sanitizado
    if (!isAdmin) {
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal) || 0,
        total: Number(order.total) || 0,
        items: order.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice) || 0,
          subtotal: Number(i.subtotal) || 0,
          product: {
            name: i.product?.name,
            imageUrl: i.product?.imageUrl
          }
        })),
        payment: {
          status: order.payment?.status,
          rejectionReason: order.payment?.rejectionReason
        }
      };
    }

    return OrderService.formatOrder(order);
  }

  public static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userId?: string,
    rejectionReason?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: { include: { paymentProof: true } },
        items: { include: { product: true } },
        client: true
      }
    });

    if (!order) throw new Error('Pedido no encontrado');

    const currentStatus = order.status as OrderStatus;
    if (currentStatus === newStatus) {
      return order;
    }

    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(
        `Transición no permitida: no se puede cambiar el estado de "${currentStatus}" a "${newStatus}".`
      );
    }

    const wasActive = ACTIVE_STOCK_STATUSES.includes(currentStatus);
    const willBeActive = ACTIVE_STOCK_STATUSES.includes(newStatus);

    return prisma.$transaction(async (tx) => {
      // 1. Manejo atómico de Stock según la transición de estados
      if (wasActive && !willBeActive) {
        // Transición de activo a inactivo (PAYMENT_REJECTED o CANCELLED): Restaurar stock
        const movementType = newStatus === 'PAYMENT_REJECTED' ? 'PAYMENT_REJECTED' : 'ORDER_CANCELLED';
        const reasonText =
          newStatus === 'PAYMENT_REJECTED'
            ? `Restauración de stock por pago rechazado en pedido #${order.orderNumber}`
            : `Restauración de stock por anulación de pedido #${order.orderNumber}`;

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              userId: userId || null,
              type: movementType,
              quantity: item.quantity,
              reason: reasonText
            }
          });
        }
      } else if (!wasActive && willBeActive) {
        // Transición de inactivo a activo (ej. reactivación o pago posterior): Re-reservar stock
        for (const item of order.items) {
          const freshProduct = await tx.product.findUnique({ where: { id: item.productId } });
          if (!freshProduct || freshProduct.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para reactivar el producto "${freshProduct?.name || item.productId}". Disponible: ${freshProduct?.stock || 0}, Solicitado: ${item.quantity}.`
            );
          }

          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });

          if (updated.stock < 0) {
            throw new Error(`Stock insuficiente para el producto "${freshProduct.name}".`);
          }

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              userId: userId || null,
              type: 'RESTOCK',
              quantity: -item.quantity,
              reason: `Re-reserva de inventario por cambio de estado a ${newStatus} en pedido #${order.orderNumber}`
            }
          });
        }
      }

      // 2. Sincronizar estado del Pago asociado
      let paymentStatus = order.paymentStatus;
      if (newStatus === 'PAID') {
        paymentStatus = 'APPROVED';
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'APPROVED',
              reviewedAt: new Date(),
              reviewedBy: userId || null
            }
          });
        }
      } else if (newStatus === 'PAYMENT_REJECTED') {
        paymentStatus = 'REJECTED';
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'REJECTED',
              reviewedAt: new Date(),
              reviewedBy: userId || null,
              rejectionReason: rejectionReason || order.payment.rejectionReason || 'Comprobante no verificado'
            }
          });
        }
      } else if (newStatus === 'PENDING_PAYMENT_VERIFICATION') {
        paymentStatus = 'PENDING_VERIFICATION';
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'PENDING_VERIFICATION'
            }
          });
        }
      }

      // 3. Actualizar registro principal de la orden
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus
        },
        include: {
          client: true,
          payment: { include: { paymentProof: true } },
          items: { include: { product: true } }
        }
      });

      return OrderService.formatOrder(updatedOrder);
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
