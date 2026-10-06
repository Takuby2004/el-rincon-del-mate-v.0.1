import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';

@Component({
    selector: 'app-admin-dashboard',
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class AdminDashboardFeatureComponent implements OnInit {
  private apiService = inject(ApiService);

  stats: DashboardStats | null = null;
  loading = true;
  hoveredDailyIndex: number | null = null;
  hoveredBinIndex: number | null = null;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.apiService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // Cálculos de Escala para Histograma Diario (Últimos 7 días)
  getMaxDailyTotal(): number {
    if (!this.stats?.dailySalesHistory || this.stats.dailySalesHistory.length === 0) return 1;
    const max = Math.max(...this.stats.dailySalesHistory.map((d) => d.total));
    return max > 0 ? max : 1;
  }

  getDailyBarHeight(total: number): number {
    const max = this.getMaxDailyTotal();
    const pct = Math.round((total / max) * 100);
    // Asegurar una altura mínima visual del 6% si hay datos para que no sea invisible
    return total > 0 ? Math.max(pct, 8) : 4;
  }

  // Cálculos de Escala para Histograma de Montos por Pedido (Ticket Bins)
  getMaxTicketCount(): number {
    if (!this.stats?.orderDistribution || this.stats.orderDistribution.length === 0) return 1;
    const max = Math.max(...this.stats.orderDistribution.map((b) => b.count));
    return max > 0 ? max : 1;
  }

  getTicketBarHeight(count: number): number {
    const max = this.getMaxTicketCount();
    const pct = Math.round((count / max) * 100);
    return count > 0 ? Math.max(pct, 10) : 4;
  }

  // Cálculos de Escala para Gráfica de Barras de Productos Líderes
  getMaxProductQuantity(): number {
    if (!this.stats?.topSellingProducts || this.stats.topSellingProducts.length === 0) return 1;
    const max = Math.max(...this.stats.topSellingProducts.map((p) => p.quantity));
    return max > 0 ? max : 1;
  }

  getProductBarWidth(qty: number): number {
    const max = this.getMaxProductQuantity();
    return Math.max(Math.round((qty / max) * 100), 5);
  }

  // Métricas Consolidadas Globales
  getTotalOrders(): number {
    if (!this.stats) return 0;
    return (
      this.stats.metrics.pendingVerificationCount +
      this.stats.metrics.approvedCount +
      this.stats.metrics.rejectedCount
    );
  }

  getApprovalRate(): number {
    const total = this.getTotalOrders();
    if (total === 0 || !this.stats) return 0;
    return Math.round((this.stats.metrics.approvedCount / total) * 100);
  }

  getCostPercentage(): number {
    if (!this.stats || this.stats.metrics.totalRevenue <= 0) return 0;
    return Math.min(
      Math.round((this.stats.metrics.totalCost / this.stats.metrics.totalRevenue) * 100),
      100
    );
  }

  getProfitPercentage(): number {
    if (!this.stats || this.stats.metrics.totalRevenue <= 0) return 0;
    return Math.max(
      Math.round((this.stats.metrics.netProfit / this.stats.metrics.totalRevenue) * 100),
      0
    );
  }
}
