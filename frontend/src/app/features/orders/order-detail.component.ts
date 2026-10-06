import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/models';

@Component({
    selector: 'app-order-detail',
    imports: [CommonModule, RouterLink],
    templateUrl: './order-detail.component.html',
    styleUrl: './order-detail.component.css'
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
        },
        error: () => (this.loading = false)
      });
    }
  }
}
