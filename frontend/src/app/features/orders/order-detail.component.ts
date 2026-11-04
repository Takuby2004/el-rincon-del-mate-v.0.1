import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';

@Component({
    selector: 'app-order-detail',
    imports: [CommonModule, RouterLink],
    templateUrl: './order-detail.component.html',
    styleUrl: './order-detail.component.css'
})
export class OrderDetailFeatureComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  order: Order | null = null;
  loading = true;
  isPolling = false;
  isRefreshing = false;
  private pollingSub?: Subscription;
  private orderNumber = '';

  ngOnInit() {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber') || '';
    if (this.orderNumber) {
      this.fetchOrder(true);
    }
  }

  fetchOrder(isInitial = false) {
    if (!this.orderNumber) return;
    if (!isInitial) this.isRefreshing = true;

    this.apiService.getOrderById(this.orderNumber).subscribe({
      next: (res: any) => {
        this.order = res ? {
          ...res,
          total: Number(res.total) || 0,
          subtotal: Number(res.subtotal) || 0,
          items: (res.items || []).map((it: any) => ({
            ...it,
            unitPrice: Number(it.unitPrice) || 0,
            subtotal: Number(it.subtotal) || 0
          }))
        } : null;
        this.loading = false;
        this.isRefreshing = false;

        // Si el pago sigue pendiente de verificación, activar sondeo reactivo
        if (this.order?.paymentStatus === 'PENDING_VERIFICATION') {
          this.startPolling();
        } else {
          this.stopPolling();
        }
      },
      error: () => {
        this.loading = false;
        this.isRefreshing = false;
      }
    });
  }

  startPolling() {
    if (this.pollingSub || !this.orderNumber) return;
    this.isPolling = true;

    // Sondeo periódico reactivo cada 4 segundos
    this.pollingSub = interval(4000).subscribe(() => {
      this.apiService.getOrderById(this.orderNumber).subscribe({
        next: (res: any) => {
          if (!res) return;
          this.order = {
            ...res,
            total: Number(res.total) || 0,
            subtotal: Number(res.subtotal) || 0,
            items: (res.items || []).map((it: any) => ({
              ...it,
              unitPrice: Number(it.unitPrice) || 0,
              subtotal: Number(it.subtotal) || 0
            }))
          };

          // Si el estado ya no está pendiente (aprobado o rechazado), detener sondeo automáticamente
          if (res.paymentStatus !== 'PENDING_VERIFICATION') {
            this.stopPolling();
          }
        },
        error: () => {
          // Ignorar fallas momentáneas de red durante sondeo
        }
      });
    });
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
