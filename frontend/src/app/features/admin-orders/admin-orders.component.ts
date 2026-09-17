import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-admin-orders',
    imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './admin-orders.component.html',
    styleUrl: './admin-orders.component.css'
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
