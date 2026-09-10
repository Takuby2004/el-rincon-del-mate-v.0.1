import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      @if (loading) {
        <div class="py-20 text-center text-wood-500">
          <i class="fa-solid fa-spinner fa-spin text-3xl text-mate-600 mb-2"></i>
          <p class="text-sm">Cargando información del pedido...</p>
        </div>
      } @else if (order) {
        <div class="bg-white rounded-3xl p-8 border border-wood-200 shadow-sm space-y-8">
          <!-- Header Status -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-wood-100 pb-6">
            <div>
              <span class="text-xs font-semibold text-wood-600 uppercase tracking-wider">Confirmación de Pedido</span>
              <h1 class="text-2xl font-extrabold text-mate-900">Pedido #{{ order.orderNumber }}</h1>
              <p class="text-xs text-wood-500 mt-0.5">Fecha: {{ order.createdAt | date: 'medium' }}</p>
            </div>

            <div class="flex flex-col items-end">
              <span class="text-xs font-bold text-wood-600">Estado del Pago:</span>
              <span class="px-3 py-1 rounded-full text-xs font-bold mt-1"
                [ngClass]="{
                  'bg-amber-100 text-amber-800': order.paymentStatus === 'PENDING_VERIFICATION',
                  'bg-emerald-100 text-emerald-800': order.paymentStatus === 'APPROVED',
                  'bg-red-100 text-red-800': order.paymentStatus === 'REJECTED'
                }">
                {{ order.paymentStatus === 'PENDING_VERIFICATION' ? 'Pendiente de verificación' : (order.paymentStatus === 'APPROVED' ? 'Pagado y Verificado' : 'Pago Rechazado') }}
              </span>
            </div>
          </div>

          <!-- Alert banner if pending verification -->
          @if (order.paymentStatus === 'PENDING_VERIFICATION') {
            <div class="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
              <div class="font-bold flex items-center gap-2">
                <i class="fa-solid fa-clock"></i> Comprobante recibido y en revisión
              </div>
              <p class="text-amber-800">Tu comprobante de pago fue adjuntado correctamente y está siendo verificado por el equipo administrativo. Te avisaremos tan pronto sea aprobado.</p>
            </div>
          }

          @if (order.paymentStatus === 'REJECTED' && order.payment?.rejectionReason) {
            <div class="bg-red-50 border border-red-200 text-red-900 p-4 rounded-2xl text-xs space-y-1">
              <div class="font-bold flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation"></i> Pago Rechazado por el Administrador
              </div>
              <p class="text-red-800">Motivo de rechazo: "<strong>{{ order.payment?.rejectionReason }}</strong>"</p>
            </div>
          }

          <!-- Items Table -->
          <div class="space-y-3">
            <h3 class="font-bold text-mate-900 text-base">Detalle de Productos</h3>
            <div class="divide-y divide-wood-100 border border-wood-200 rounded-2xl overflow-hidden bg-wood-50/50">
              @for (item of order.items; track item.id) {
                <div class="p-4 flex justify-between items-center bg-white">
                  <div>
                    <h4 class="font-bold text-xs text-mate-900">{{ item.product?.name }}</h4>
                    <p class="text-2xs text-wood-500">Cantidad: {{ item.quantity }} × Bs. {{ item.unitPrice.toFixed(2) }}</p>
                  </div>
                  <span class="font-bold text-xs text-mate-800">Bs. {{ item.subtotal.toFixed(2) }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Total Breakdown -->
          <div class="bg-wood-100/70 p-4 rounded-2xl space-y-2 text-xs">
            <div class="flex justify-between text-wood-700">
              <span>Subtotal:</span>
              <span class="font-bold text-mate-900">Bs. {{ order.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-wood-700 border-t border-wood-200 pt-2 text-sm">
              <span class="font-extrabold text-mate-900">Total:</span>
              <span class="font-extrabold text-mate-700">Bs. {{ order.total.toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-wood-100">
            <a routerLink="/" class="text-xs font-bold text-wood-700 hover:text-mate-700">
              Volver al Inicio
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class OrderDetailFeatureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  order: Order | null = null;
  loading = true;

  ngOnInit() {
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (orderNumber) {
      this.apiService.getOrderById(orderNumber).subscribe({
        next: (res) => {
          this.order = res;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }
}
