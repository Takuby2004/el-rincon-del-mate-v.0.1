import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DialogService } from '../../core/services/dialog.service';
import { Order } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { environment } from '../../../environments/environment';

import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-admin-orders',
    imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective, PaginationComponent],
    templateUrl: './admin-orders.component.html',
    styleUrl: './admin-orders.component.css'
})
export class AdminOrdersFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  filterPaymentStatus = '';
  filterOrderStatus = '';
  searchQuery = '';
  loading = false;
  showRejectModal = false;
  showEmailModal = false;
  rejectionReason = 'El monto del comprobante no coincide con el total del pedido.';
  customReason = '';
  zoomImageUrl: string | null = null;
  proofModalOrder: Order | null = null;
  zoomLevel = 1;
  rotation = 0;
  notifyBuyerByEmail = true;

  // Paginación
  currentPage = 1;
  pageSize = 5;

  emailNotifyStatus = 'APPROVED';
  emailNotifyMessage = '';
  isSendingEmail = false;

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.loadOrders();
  }

  normalizeStatus(status: string): any {
    if (status === 'PENDING_PAYMENT_VERIFICATION' || status === 'PENDING_VERIFICATION') {
      return 'PENDING_PAYMENT_VERIFICATION';
    }
    if (['PAID', 'APPROVED', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      return 'PAID';
    }
    if (['PAYMENT_REJECTED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return 'PAYMENT_REJECTED';
    }
    return 'PENDING_PAYMENT_VERIFICATION';
  }

  loadOrders() {
    this.loading = true;
    this.apiService
      .getOrders({
        paymentStatus: this.filterPaymentStatus,
        status: this.filterOrderStatus,
        search: this.searchQuery
      })
      .subscribe({
        next: (res: any) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          this.orders = list.map((o: any) => ({
            ...o,
            total: Number(o.total) || 0,
            subtotal: Number(o.subtotal) || 0,
            status: this.normalizeStatus(o.status),
            payment: o.payment
              ? {
                  ...o.payment,
                  amount: Number(o.payment.amount) || 0
                }
              : o.payment,
            items: (o.items || []).map((it: any) => ({
              ...it,
              unitPrice: Number(it.unitPrice) || 0,
              unitCost: Number(it.unitCost) || 0,
              subtotal: Number(it.subtotal) || 0
            }))
          }));
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterPaymentStatus = '';
    this.filterOrderStatus = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  get pendingVerificationCount(): number {
    return this.orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION' || o.payment?.status === 'PENDING_VERIFICATION').length;
  }

  get paidOrdersCount(): number {
    return this.orders.filter((o) => o.paymentStatus === 'APPROVED' || o.status === 'PAID').length;
  }

  get totalRevenue(): number {
    return this.orders
      .filter((o) => o.paymentStatus === 'APPROVED' || o.status === 'PAID')
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }

  get paginatedOrders(): Order[] {
    const list = this.orders;
    const maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  getOrderStatusLabel(status: string): string {
    const map: any = {
      PENDING_PAYMENT_VERIFICATION: 'Pendiente de verificación',
      PAID: 'Aprobado',
      APPROVED: 'Aprobado',
      PACKING: 'Aprobado',
      SHIPPED: 'Aprobado',
      DELIVERED: 'Aprobado',
      PAYMENT_REJECTED: 'Rechazado',
      REJECTED: 'Rechazado',
      CANCELLED: 'Rechazado'
    };
    return map[status] || status;
  }

  getOrderStatusBadgeClass(status: string): string {
    if (status === 'PENDING_PAYMENT_VERIFICATION') {
      return 'bg-amber-100 text-amber-800';
    }
    if (['PAID', 'APPROVED', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      return 'bg-emerald-100 text-emerald-800';
    }
    return 'bg-red-100 text-red-800';
  }

  cleanPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  showNotification(msg: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = msg;
    this.notificationType = type;
    if (type === 'success') {
      this.toastService.success(msg);
    } else {
      this.toastService.error(msg);
    }
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 6000);
  }

  openOrderModal(order: Order) {
    this.selectedOrder = {
      ...order,
      total: Number(order.total) || 0,
      subtotal: Number(order.subtotal) || 0,
      status: this.normalizeStatus(order.status),
      items: (order.items || []).map((it: any) => ({
        ...it,
        unitPrice: Number(it.unitPrice) || 0,
        unitCost: Number(it.unitCost) || 0,
        subtotal: Number(it.subtotal) || 0
      }))
    };
    this.emailNotifyStatus = order.payment?.status || order.paymentStatus || 'APPROVED';
    this.emailNotifyMessage = '';
  }

  closeOrderModal() {
    this.selectedOrder = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.proofModalOrder) {
      this.closeProofModal();
    }
  }

  openProofModal(order: Order, url?: string) {
    this.proofModalOrder = {
      ...order,
      total: Number(order.total) || 0,
      subtotal: Number(order.subtotal) || 0
    };
    this.zoomImageUrl = url || order.payment?.paymentProof?.imageUrl || null;
    this.zoomLevel = 1;
    this.rotation = 0;
  }

  closeProofModal() {
    this.proofModalOrder = null;
    this.zoomImageUrl = null;
    this.zoomLevel = 1;
    this.rotation = 0;
  }

  zoomIn() {
    if (this.zoomLevel < 3.5) {
      this.zoomLevel = +(this.zoomLevel + 0.25).toFixed(2);
    }
  }

  zoomOut() {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel = +(this.zoomLevel - 0.25).toFixed(2);
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.rotation = 0;
  }

  rotateProof() {
    this.rotation = (this.rotation + 90) % 360;
  }

  downloadProof(url?: string) {
    const target = url || this.zoomImageUrl;
    if (!target) return;

    let fullUrl = target;
    if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('data:') && !target.startsWith('blob:')) {
      const baseUrl = environment.apiUrl.replace(/\/api\/?$/, '');
      fullUrl = `${baseUrl}${target.startsWith('/') ? '' : '/'}${target}`;
    }

    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = `comprobante-${this.proofModalOrder?.orderNumber || 'pedido'}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openProofZoom(url: string, order?: Order) {
    if (order) {
      this.openProofModal(order, url);
    } else if (this.selectedOrder) {
      this.openProofModal(this.selectedOrder, url);
    } else {
      this.zoomImageUrl = url;
    }
  }

  async approvePayment() {
    if (this.selectedOrder?.payment) {
      const confirmed = await this.dialogService.confirm({
        title: '¿Aprobar Pago?',
        message: '¿Deseas aprobar este pago? El estado del pedido cambiará a PAGADO y se notificará al comprador por correo.',
        confirmText: 'Sí, aprobar pago',
        cancelText: 'Cancelar',
        type: 'success',
        icon: 'fa-solid fa-circle-check'
      });

      if (confirmed) {
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

  async confirmRejectPayment() {
    const finalReason = this.rejectionReason === 'custom' ? this.customReason : this.rejectionReason;
    if (!finalReason) {
      await this.dialogService.alert({
        title: 'Campo Requerido',
        message: 'Debes especificar la razón o motivo de rechazo del comprobante.',
        type: 'warning'
      });
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
        next: () => {
          this.showNotification('Estado del pedido actualizado correctamente.', 'success');
          this.loadOrders();
        },
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

  deletingId: string | null = null;

  async deleteOrder(order: Order, fromModal: boolean = false) {
    const clientName = order.client?.name || 'Cliente';
    const confirmed = await this.dialogService.confirm({
      title: '¿Eliminar Pedido?',
      message: `¿Estás seguro de que deseas eliminar permanentemente el pedido #${order.orderNumber} de ${clientName}?\nEsta acción restaurará el stock de los productos reservados y no se puede deshacer.`,
      confirmText: 'Sí, eliminar pedido',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'fa-solid fa-trash-can'
    });

    if (!confirmed) return;

    this.deletingId = order.id;

    this.apiService.deleteOrder(order.id).subscribe({
      next: (res) => {
        this.deletingId = null;
        if (fromModal) {
          this.closeOrderModal();
        }
        this.showNotification(res?.message || `El pedido #${order.orderNumber} fue eliminado exitosamente.`, 'success');
        this.orders = this.orders.filter((o) => o.id !== order.id);
      },
      error: (err) => {
        this.deletingId = null;
        this.showNotification(err.error?.error || 'No se pudo eliminar el pedido. Intenta nuevamente.', 'error');
      }
    });
  }
}
