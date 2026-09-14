import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-mate-900">Gestión de Pedidos y Verificación de Pagos</h1>
          <p class="text-xs text-wood-600">Revisa comprobantes, datos del comprador, productos y notifica el estado por correo electrónico</p>
        </div>
      </div>

      <!-- Feedback Toast / Alert -->
      @if (notificationMessage) {
        <div 
          [ngClass]="notificationType === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'"
          class="p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-fade-in">
          <div class="flex items-center gap-2.5 text-xs font-semibold">
            <i [ngClass]="notificationType === 'success' ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-circle-exclamation text-red-600'"></i>
            <span>{{ notificationMessage }}</span>
          </div>
          <button (click)="notificationMessage = ''" class="text-xs opacity-70 hover:opacity-100">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }

      <!-- Filters Row -->
      <div class="bg-white p-4 rounded-2xl border border-wood-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="flex flex-wrap gap-4 w-full md:w-auto">
          <!-- Filter Payment Status -->
          <div>
            <label class="block text-2xs font-bold text-wood-600 uppercase mb-1">Estado de Pago</label>
            <select [(ngModel)]="filterPaymentStatus" (ngModelChange)="loadOrders()" class="px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white focus:ring-2 focus:ring-mate-700 outline-none">
              <option value="">Todos los Pagos</option>
              <option value="PENDING_VERIFICATION">Pendiente</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>

          <!-- Filter Order Status -->
          <div>
            <label class="block text-2xs font-bold text-wood-600 uppercase mb-1">Estado del Pedido</label>
            <select [(ngModel)]="filterOrderStatus" (ngModelChange)="loadOrders()" class="px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white focus:ring-2 focus:ring-mate-700 outline-none">
              <option value="">Todos los Estados</option>
              <option value="PENDING_PAYMENT_VERIFICATION">Pendiente de verificación</option>
              <option value="PAID">Pagado</option>
              <option value="PACKING">Preparando</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregado</option>
              <option value="PAYMENT_REJECTED">Pago rechazado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>

        <!-- Search Input -->
        <div class="w-full md:w-64">
          <label class="block text-2xs font-bold text-wood-600 uppercase mb-1">Buscar</label>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="loadOrders()" placeholder="Número o cliente..." class="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs focus:ring-2 focus:ring-mate-700 outline-none">
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white rounded-3xl border border-wood-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-wood-100/70 border-b border-wood-200 text-2xs font-bold text-wood-700 uppercase tracking-wider">
              <th class="p-4">Número</th>
              <th class="p-4">Cliente</th>
              <th class="p-4">Fecha</th>
              <th class="p-4">Total (Bs.)</th>
              <th class="p-4">Estado Pago</th>
              <th class="p-4">Estado Pedido</th>
              <th class="p-4">Comprobante</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wood-100 text-xs">
            @for (order of orders; track order.id) {
              <tr class="hover:bg-wood-50/50 transition-colors">
                <td class="p-4 font-bold text-mate-900 font-mono">{{ order.orderNumber }}</td>
                <td class="p-4">
                  <div class="font-bold text-mate-900">{{ order.client?.name || 'Cliente' }}</div>
                  <div class="text-2xs text-wood-500">{{ order.client?.email }}</div>
                  <div class="text-2xs text-wood-400 font-mono">{{ order.phone }}</div>
                </td>
                <td class="p-4 text-wood-600">{{ order.createdAt | date: 'short' }}</td>
                <td class="p-4 font-extrabold text-mate-900">Bs. {{ order.total.toFixed(2) }}</td>

                <!-- Payment Status Badge -->
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full font-bold text-2xs"
                    [ngClass]="{
                      'bg-amber-100 text-amber-800': order.paymentStatus === 'PENDING_VERIFICATION',
                      'bg-emerald-100 text-emerald-800': order.paymentStatus === 'APPROVED',
                      'bg-red-100 text-red-800': order.paymentStatus === 'REJECTED'
                    }">
                    {{ order.paymentStatus === 'PENDING_VERIFICATION' ? 'Pendiente' : (order.paymentStatus === 'APPROVED' ? 'Aprobado' : 'Rechazado') }}
                  </span>
                </td>

                <!-- Order Status Badge -->
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-2xs font-semibold"
                    [ngClass]="{
                      'bg-amber-50 text-amber-900': order.status === 'PENDING_PAYMENT_VERIFICATION',
                      'bg-emerald-50 text-emerald-900': order.status === 'PAID',
                      'bg-blue-50 text-blue-900': order.status === 'PACKING',
                      'bg-indigo-50 text-indigo-900': order.status === 'SHIPPED',
                      'bg-green-50 text-green-900': order.status === 'DELIVERED',
                      'bg-red-50 text-red-900': order.status === 'PAYMENT_REJECTED'
                    }">
                    {{ getOrderStatusLabel(order.status) }}
                  </span>
                </td>

                <!-- Proof Thumbnail -->
                <td class="p-4">
                  @if (order.payment?.paymentProof?.imageUrl) {
                    <button (click)="openProofZoom(order.payment?.paymentProof?.imageUrl!)" class="group relative block w-10 h-10 rounded-lg overflow-hidden border border-wood-300">
                      <img [src]="order.payment?.paymentProof?.imageUrl | assetUrl" alt="Comprobante" appImgFallback class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-mate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                      </div>
                    </button>
                  } @else {
                    <span class="text-2xs text-wood-400">Sin archivo</span>
                  }
                </td>

                <!-- Actions -->
                <td class="p-4 text-right">
                  <button (click)="openOrderModal(order)" class="px-3 py-1.5 bg-mate-700 hover:bg-mate-800 text-white font-bold text-2xs rounded-lg shadow transition-all">
                    Verificar / Detalle
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Order Detail & Buyer Information Modal -->
      @if (selectedOrder) {
        <div class="fixed inset-0 bg-mate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-3xl w-full border border-wood-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <!-- Modal Header -->
            <div class="flex justify-between items-center border-b border-wood-100 pb-3">
              <div>
                <h3 class="font-bold text-lg text-mate-900 flex items-center gap-2">
                  <span>Pedido #{{ selectedOrder.orderNumber }}</span>
                  <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    [ngClass]="{
                      'bg-amber-100 text-amber-800': selectedOrder.payment?.status === 'PENDING_VERIFICATION',
                      'bg-emerald-100 text-emerald-800': selectedOrder.payment?.status === 'APPROVED',
                      'bg-red-100 text-red-800': selectedOrder.payment?.status === 'REJECTED'
                    }">
                    {{ selectedOrder.payment?.status === 'PENDING_VERIFICATION' ? 'Pago Pendiente' : (selectedOrder.payment?.status === 'APPROVED' ? 'Pago Aprobado' : 'Pago Rechazado') }}
                  </span>
                </h3>
                <p class="text-2xs text-wood-500">Fecha del Pedido: {{ selectedOrder.createdAt | date: 'medium' }}</p>
              </div>
              <button (click)="closeOrderModal()" class="text-wood-400 hover:text-wood-700 text-lg">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Buyer Details Card (Datos del Comprador) -->
            <div class="bg-gradient-to-br from-wood-50/90 to-amber-50/40 p-5 rounded-2xl border border-wood-200 space-y-3">
              <div class="flex justify-between items-center border-b border-wood-200/80 pb-2">
                <h4 class="font-bold text-xs text-mate-900 uppercase tracking-wider flex items-center gap-2">
                  <i class="fa-solid fa-user-tag text-mate-700"></i>
                  <span>Datos del Comprador</span>
                </h4>
                @if (selectedOrder.client?.phone || selectedOrder.phone) {
                  <a 
                    [href]="'https://wa.me/' + cleanPhone(selectedOrder.phone || selectedOrder.client?.phone || '')" 
                    target="_blank" 
                    class="text-2xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
                    <i class="fa-brands fa-whatsapp text-xs"></i>
                    <span>Contactar por WhatsApp</span>
                  </a>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <div class="text-2xs text-wood-500 font-medium">Nombre Completo:</div>
                  <div class="font-bold text-mate-900">{{ selectedOrder.client?.name || 'No especificado' }}</div>
                </div>

                <div>
                  <div class="text-2xs text-wood-500 font-medium">Correo Electrónico:</div>
                  <div class="font-bold text-mate-900 flex items-center gap-1.5">
                    <i class="fa-regular fa-envelope text-wood-400"></i>
                    <a [href]="'mailto:' + selectedOrder.client?.email" class="text-mate-700 hover:underline truncate">
                      {{ selectedOrder.client?.email }}
                    </a>
                  </div>
                </div>

                <div>
                  <div class="text-2xs text-wood-500 font-medium">Teléfono / WhatsApp:</div>
                  <div class="font-bold text-mate-900 font-mono">{{ selectedOrder.phone || selectedOrder.client?.phone || 'N/A' }}</div>
                </div>

                <div>
                  <div class="text-2xs text-wood-500 font-medium">CI / NIT:</div>
                  <div class="font-bold text-mate-900 font-mono">{{ selectedOrder.client?.ciNit || 'Sin CI/NIT' }}</div>
                </div>

                <div class="sm:col-span-2">
                  <div class="text-2xs text-wood-500 font-medium">Dirección de Entrega:</div>
                  <div class="font-semibold text-mate-900 flex items-center gap-1.5">
                    <i class="fa-solid fa-location-dot text-wood-400"></i>
                    <span>{{ selectedOrder.address }}, {{ selectedOrder.city }}</span>
                  </div>
                </div>
              </div>

              <!-- Customer Notes if any -->
              @if (selectedOrder.notes) {
                <div class="mt-2 bg-white/80 p-3 rounded-xl border border-wood-200/80 text-xs">
                  <div class="text-2xs font-bold text-wood-600 uppercase mb-0.5">
                    <i class="fa-solid fa-comment-dots text-wood-400 mr-1"></i> Notas del Cliente:
                  </div>
                  <p class="text-mate-900 italic m-0">{{ selectedOrder.notes }}</p>
                </div>
              }
            </div>

            <!-- Products Breakdown (Productos Comprados) -->
            <div class="space-y-2">
              <h4 class="font-bold text-xs text-wood-700 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-basket-shopping text-mate-700"></i>
                <span>Productos del Pedido ({{ selectedOrder.items.length }} ítems)</span>
              </h4>

              <div class="bg-wood-50/50 rounded-2xl border border-wood-200 overflow-hidden">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-wood-100/60 border-b border-wood-200 text-2xs font-bold text-wood-600 uppercase">
                      <th class="p-3">Producto</th>
                      <th class="p-3 text-center">Cant.</th>
                      <th class="p-3 text-right">Precio Unit.</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-wood-100">
                    @for (item of selectedOrder.items; track item.id || $index) {
                      <tr>
                        <td class="p-3">
                          <div class="flex items-center gap-2.5">
                            <img [src]="item.product?.imageUrl | assetUrl" [alt]="item.product?.name" appImgFallback class="w-9 h-9 object-cover rounded-lg border border-wood-200">
                            <div>
                              <div class="font-bold text-mate-900">{{ item.product?.name }}</div>
                              <div class="text-3xs text-wood-500 font-mono">{{ item.product?.slug }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="p-3 text-center font-bold text-wood-800">{{ item.quantity }} un.</td>
                        <td class="p-3 text-right text-wood-700">Bs. {{ item.unitPrice.toFixed(2) }}</td>
                        <td class="p-3 text-right font-extrabold text-mate-900">Bs. {{ item.subtotal.toFixed(2) }}</td>
                      </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr class="bg-wood-100/40 border-t border-wood-200 font-extrabold text-sm">
                      <td colspan="3" class="p-3 text-right text-mate-900 uppercase text-xs">Total del Pedido:</td>
                      <td class="p-3 text-right text-mate-800 font-black">Bs. {{ selectedOrder.total.toFixed(2) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Payment Review & Comprobante Section -->
            <div class="bg-wood-50 p-5 rounded-2xl border border-wood-200 space-y-4">
              <div class="flex justify-between items-center border-b border-wood-200 pb-2">
                <h4 class="font-bold text-sm text-mate-900 flex items-center gap-2">
                  <i class="fa-solid fa-receipt text-mate-700"></i>
                  <span>Comprobante de Pago Bancario</span>
                </h4>
                
                <!-- Send Email Action Button -->
                <button 
                  (click)="openEmailNotificationDialog()"
                  class="px-3 py-1.5 bg-white hover:bg-wood-100 border border-wood-300 text-mate-800 font-bold text-2xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors">
                  <i class="fa-solid fa-paper-plane text-mate-600"></i>
                  <span>Enviar Estado por Correo</span>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div class="text-wood-600">Método de Pago:</div>
                  <div class="font-bold text-mate-900 text-sm">QR Bancario</div>
                  
                  <div class="text-wood-600 mt-2">Monto Facturado:</div>
                  <div class="font-extrabold text-mate-700 text-lg">Bs. {{ selectedOrder.total.toFixed(2) }}</div>
                  
                  @if (selectedOrder.payment?.rejectionReason) {
                    <div class="mt-3 bg-red-100 text-red-900 p-2.5 rounded-xl text-2xs">
                      <strong>Motivo de Rechazo:</strong> {{ selectedOrder.payment?.rejectionReason }}
                    </div>
                  }

                  <!-- Auto notify checkbox -->
                  <div class="mt-4 pt-3 border-t border-wood-200/80">
                    <label class="flex items-center gap-2 text-2xs text-wood-700 cursor-pointer font-medium">
                      <input type="checkbox" [(ngModel)]="notifyBuyerByEmail" class="rounded text-mate-700 focus:ring-mate-700 w-3.5 h-3.5">
                      <span>Notificar automáticamente al comprador por correo electrónico</span>
                    </label>
                  </div>
                </div>

                <!-- Proof Image Viewer -->
                <div>
                  <div class="text-wood-600 mb-1">Imagen del Comprobante:</div>
                  @if (selectedOrder.payment?.paymentProof?.imageUrl) {
                    <div class="relative group rounded-xl overflow-hidden border border-wood-300 bg-white">
                      <img [src]="selectedOrder.payment?.paymentProof?.imageUrl | assetUrl" alt="Comprobante de pago" class="w-full h-44 object-contain bg-black/5">
                      <button (click)="openProofZoom(selectedOrder.payment?.paymentProof?.imageUrl!)" class="absolute bottom-2 right-2 px-2.5 py-1 bg-mate-900/80 text-white text-2xs rounded-md shadow">
                        <i class="fa-solid fa-expand"></i> Ampliar comprobante
                      </button>
                    </div>
                  } @else {
                    <div class="p-6 text-center text-2xs text-wood-500 bg-wood-100 rounded-xl">No hay imagen de comprobante adjunta</div>
                  }
                </div>
              </div>

              <!-- Action Buttons (Approve / Reject) -->
              @if (selectedOrder.payment?.status === 'PENDING_VERIFICATION') {
                <div class="pt-3 border-t border-wood-200 flex justify-end gap-3">
                  <button (click)="openRejectDialog()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors">
                    <i class="fa-solid fa-xmark"></i> Rechazar Pago
                  </button>
                  <button (click)="approvePayment()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-colors">
                    <i class="fa-solid fa-check"></i> Aprobar Pago
                  </button>
                </div>
              }
            </div>

            <!-- Order Status Controls -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-mate-900">Actualizar Estado de Envío del Pedido:</label>
              <div class="flex gap-2">
                <select [(ngModel)]="selectedOrder.status" class="px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white flex-1 focus:ring-2 focus:ring-mate-700 outline-none">
                  <option value="PENDING_PAYMENT_VERIFICATION">Pendiente de verificación</option>
                  <option value="PAID">Pagado</option>
                  <option value="PACKING">Preparando pedido</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
                <button (click)="updateOrderStatus()" class="px-4 py-2 bg-mate-700 hover:bg-mate-800 text-white text-xs font-bold rounded-xl transition-colors">
                  Actualizar
                </button>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-2 border-t border-wood-100 flex justify-between items-center">
              <button (click)="downloadPdf(selectedOrder.id)" class="text-xs font-bold text-mate-700 hover:text-mate-900 flex items-center gap-1.5">
                <i class="fa-solid fa-file-pdf text-red-600"></i> Descargar Pedido en PDF
              </button>
              <button (click)="closeOrderModal()" class="px-4 py-2 bg-wood-200 hover:bg-wood-300 text-wood-800 text-xs font-bold rounded-xl transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Rejection Reason Dialog -->
      @if (showRejectModal) {
        <div class="fixed inset-0 bg-mate-950/80 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <h3 class="font-bold text-base text-red-900 flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation"></i> Rechazar Pago de Pedido
            </h3>
            <p class="text-xs text-wood-600">
              Indica el motivo por el cual rechazas este comprobante. El stock reservado se restaurará automáticamente y se notificará al comprador.
            </p>

            <div>
              <label class="block text-xs font-bold text-wood-700 mb-1">Motivo de Rechazo *</label>
              <select [(ngModel)]="rejectionReason" class="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white mb-2 focus:ring-2 focus:ring-red-500 outline-none">
                <option value="El monto del comprobante no coincide con el total del pedido.">El monto del comprobante no coincide</option>
                <option value="El comprobante de pago no es legible o está borroso.">El comprobante no es legible o está borroso</option>
                <option value="El comprobante no corresponde a la cuenta del negocio.">El comprobante no corresponde a la cuenta</option>
                <option value="custom">Otro motivo personalizado...</option>
              </select>

              @if (rejectionReason === 'custom' || customReason) {
                <textarea [(ngModel)]="customReason" placeholder="Escribe el motivo detallado para el cliente..." rows="3" class="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs focus:ring-2 focus:ring-red-500 outline-none"></textarea>
              }
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-wood-100">
              <button (click)="showRejectModal = false" class="px-4 py-2 bg-wood-200 text-wood-800 text-xs font-bold rounded-xl">Cancelar</button>
              <button (click)="confirmRejectPayment()" class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow">Confirmar y Notificar</button>
            </div>
          </div>
        </div>
      }

      <!-- Dedicated Send Email Notification Modal -->
      @if (showEmailModal && selectedOrder) {
        <div class="fixed inset-0 bg-mate-950/80 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-wood-200 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-wood-100 pb-2">
              <h3 class="font-bold text-base text-mate-900 flex items-center gap-2">
                <i class="fa-solid fa-paper-plane text-mate-700"></i>
                <span>Enviar Estado por Correo</span>
              </h3>
              <button (click)="showEmailModal = false" class="text-wood-400 hover:text-wood-700">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p class="text-xs text-wood-600">
              Se enviará un correo con el estado del pago y el resumen del pedido a <strong>{{ selectedOrder.client?.email }}</strong>.
            </p>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-wood-700 mb-1">Estado de Pago a Notificar:</label>
                <select [(ngModel)]="emailNotifyStatus" class="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs bg-white focus:ring-2 focus:ring-mate-700 outline-none">
                  <option value="APPROVED">Pago Aprobado ✅</option>
                  <option value="REJECTED">Pago Rechazado ❌</option>
                  <option value="PENDING_VERIFICATION">Pago Pendiente de Verificación ⏳</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-wood-700 mb-1">Nota Adicional / Mensaje Opcional:</label>
                <textarea [(ngModel)]="emailNotifyMessage" placeholder="Ej: Tu pedido será entregado mañana en el horario de la tarde..." rows="3" class="w-full px-3 py-2 rounded-xl border border-wood-300 text-xs focus:ring-2 focus:ring-mate-700 outline-none"></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-wood-100">
              <button (click)="showEmailModal = false" class="px-4 py-2 bg-wood-200 text-wood-800 text-xs font-bold rounded-xl">Cancelar</button>
              <button 
                [disabled]="isSendingEmail"
                (click)="sendEmailNotification()" 
                class="px-5 py-2 bg-mate-700 hover:bg-mate-800 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2">
                @if (isSendingEmail) {
                  <i class="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  <span>Enviando...</span>
                } @else {
                  <i class="fa-solid fa-envelope"></i>
                  <span>Enviar Correo</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Zoom Image Modal -->
      @if (zoomImageUrl) {
        <div (click)="zoomImageUrl = null" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer">
          <div class="relative max-w-4xl max-h-[90vh] overflow-hidden">
            <img [src]="zoomImageUrl | assetUrl" alt="Comprobante ampliado" class="w-full h-full object-contain rounded-2xl">
          </div>
        </div>
      }
    </div>
  `
})
export class AdminOrdersFeatureComponent implements OnInit {
  private apiService = inject(ApiService);

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  filterPaymentStatus = '';
  filterOrderStatus = '';
  searchQuery = '';
  showRejectModal = false;
  showEmailModal = false;
  rejectionReason = 'El monto del comprobante no coincide con el total del pedido.';
  customReason = '';
  zoomImageUrl: string | null = null;
  notifyBuyerByEmail = true;

  emailNotifyStatus = 'APPROVED';
  emailNotifyMessage = '';
  isSendingEmail = false;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.apiService
      .getOrders({
        paymentStatus: this.filterPaymentStatus,
        status: this.filterOrderStatus,
        search: this.searchQuery
      })
      .subscribe((res) => (this.orders = res));
  }

  getOrderStatusLabel(status: string): string {
    const map: any = {
      PENDING_PAYMENT_VERIFICATION: 'Pendiente de verificación',
      PAID: 'Pagado',
      PACKING: 'Preparando pedido',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      PAYMENT_REJECTED: 'Pago rechazado',
      CANCELLED: 'Cancelado'
    };
    return map[status] || status;
  }

  cleanPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  showNotification(msg: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 6000);
  }

  openOrderModal(order: Order) {
    this.selectedOrder = order;
    this.emailNotifyStatus = order.payment?.status || order.paymentStatus || 'APPROVED';
    this.emailNotifyMessage = '';
  }

  closeOrderModal() {
    this.selectedOrder = null;
  }

  openProofZoom(url: string) {
    this.zoomImageUrl = url;
  }

  approvePayment() {
    if (this.selectedOrder?.payment) {
      if (confirm('¿Desea aprobar este pago? El estado del pedido cambiará a PAGADO y se notificará al comprador.')) {
        this.apiService.approvePayment(this.selectedOrder.payment.id, this.notifyBuyerByEmail).subscribe({
          next: (res) => {
            const emailMsg = res.emailNotified
              ? ' ¡Correo de confirmación enviado al comprador!'
              : '';
            this.showNotification(`Pago aprobado exitosamente.${emailMsg}`, 'success');
            this.closeOrderModal();
            this.loadOrders();
          },
          error: (err) => {
            this.showNotification(err.error?.error || 'Error al aprobar el pago.', 'error');
          }
        });
      }
    }
  }

  openRejectDialog() {
    this.showRejectModal = true;
  }

  confirmRejectPayment() {
    const finalReason = this.rejectionReason === 'custom' ? this.customReason : this.rejectionReason;
    if (!finalReason) {
      alert('Debe especificar la razón de rechazo.');
      return;
    }

    if (this.selectedOrder?.payment) {
      this.apiService.rejectPayment(this.selectedOrder.payment.id, finalReason, this.notifyBuyerByEmail).subscribe({
        next: (res) => {
          const emailMsg = res.emailNotified
            ? ' ¡Correo de rechazo con motivo enviado al comprador!'
            : '';
          this.showNotification(`Pago rechazado y stock restaurado.${emailMsg}`, 'success');
          this.showRejectModal = false;
          this.closeOrderModal();
          this.loadOrders();
        },
        error: (err) => {
          this.showNotification(err.error?.error || 'Error al rechazar el pago.', 'error');
        }
      });
    }
  }

  openEmailNotificationDialog() {
    if (this.selectedOrder?.payment) {
      this.emailNotifyStatus = this.selectedOrder.payment.status || 'APPROVED';
      this.emailNotifyMessage = '';
      this.showEmailModal = true;
    }
  }

  sendEmailNotification() {
    if (!this.selectedOrder?.payment) return;

    this.isSendingEmail = true;
    this.apiService
      .sendPaymentEmailNotification(
        this.selectedOrder.payment.id,
        this.emailNotifyStatus,
        this.emailNotifyMessage
      )
      .subscribe({
        next: (res) => {
          this.isSendingEmail = false;
          this.showEmailModal = false;
          this.showNotification(`Correo enviado exitosamente a ${this.selectedOrder?.client?.email}`, 'success');
        },
        error: (err) => {
          this.isSendingEmail = false;
          this.showNotification(err.error?.error || 'Error al enviar la notificación por correo.', 'error');
        }
      });
  }

  updateOrderStatus() {
    if (this.selectedOrder) {
      this.apiService.updateOrderStatus(this.selectedOrder.id, this.selectedOrder.status).subscribe({
        next: () => this.showNotification('Estado del pedido actualizado correctamente.', 'success'),
        error: (err) => this.showNotification(err.error?.error || 'Error al actualizar el estado.', 'error')
      });
    }
  }

  downloadPdf(orderId: string) {
    this.apiService.downloadOrderPdf(orderId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pedido-${orderId}.pdf`;
      a.click();
    });
  }
}
