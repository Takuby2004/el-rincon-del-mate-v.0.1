import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-mate-900">Estadísticas Comerciales y Financieras</h1>
        <p class="text-xs text-wood-600">Cálculo estricto de ventas, costos, ganancias netas y demanda considerando únicamente pagos Aprobados</p>
      </div>

      @if (stats) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-3xl border border-wood-200 shadow-sm space-y-2">
            <div class="text-xs font-bold text-wood-600 uppercase">Ingresos Totales (Ventas)</div>
            <div class="text-3xl font-extrabold text-mate-900">Bs. {{ stats.metrics.totalRevenue.toFixed(2) }}</div>
            <p class="text-2xs text-wood-500">Suma estricta de pedidos con pago APPROVED.</p>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-wood-200 shadow-sm space-y-2">
            <div class="text-xs font-bold text-wood-600 uppercase">Costo Total de Inventario Vendido</div>
            <div class="text-3xl font-extrabold text-wood-800">Bs. {{ stats.metrics.totalCost.toFixed(2) }}</div>
            <p class="text-2xs text-wood-500">Costo base de los productos entregados.</p>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
            <div class="text-xs font-bold text-emerald-800 uppercase">Ganancia Neta</div>
            <div class="text-3xl font-extrabold text-emerald-700">Bs. {{ stats.metrics.netProfit.toFixed(2) }}</div>
            <p class="text-2xs text-emerald-600">Margen bruto neto (Ingresos - Costos).</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-wood-200 shadow-sm space-y-4">
          <h3 class="font-bold text-base text-mate-900 border-b border-wood-100 pb-3">Pronóstico Estadístico de Demanda</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div class="p-4 rounded-2xl bg-wood-50 border border-wood-200 space-y-2">
              <div class="font-bold text-mate-900">Promedio de Venta Diaria:</div>
              <div class="text-2xl font-black text-mate-700">{{ stats.demandForecast.averageDailyDemand }} un. / día</div>
              <p class="text-wood-600 text-2xs">Basado en el historial de pedidos aprobados.</p>
            </div>

            <div class="p-4 rounded-2xl bg-wood-50 border border-wood-200 space-y-2">
              <div class="font-bold text-mate-900">Demanda estimada para el próximo mes:</div>
              <div class="text-2xl font-black text-mate-700">~ {{ stats.demandForecast.projectedDemandNextMonth }} un. recomendadas</div>
              <p class="text-wood-600 text-2xs">Utiliza este cálculo para realizar compras a proveedores.</p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminStatisticsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  stats: DashboardStats | null = null;

  ngOnInit() {
    this.apiService.getDashboardStats().subscribe((res) => (this.stats = res));
  }
}
