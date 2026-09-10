import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models/models';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-mate-900">Gestión de Clientes</h1>
        <p class="text-xs text-wood-600">Directorio de clientes registrados y datos de contacto</p>
      </div>

      <div class="bg-white rounded-3xl border border-wood-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-wood-100/70 border-b border-wood-200 text-2xs font-bold text-wood-700 uppercase tracking-wider">
              <th class="p-4">Cliente</th>
              <th class="p-4">Correo</th>
              <th class="p-4">Teléfono</th>
              <th class="p-4">CI / NIT</th>
              <th class="p-4">Dirección</th>
              <th class="p-4">Pedidos realizados</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wood-100 text-xs">
            @for (client of clients; track client.id) {
              <tr class="hover:bg-wood-50/50 transition-colors">
                <td class="p-4 font-bold text-mate-900">{{ client.name }}</td>
                <td class="p-4 text-wood-600">{{ client.email }}</td>
                <td class="p-4 text-mate-700 font-mono">{{ client.phone }}</td>
                <td class="p-4 text-wood-500 font-mono">{{ client.ciNit || '-' }}</td>
                <td class="p-4 text-wood-600 max-w-xs truncate">{{ client.address }}, {{ client.city }}</td>
                <td class="p-4 font-bold text-mate-800">{{ client._count?.orders || 0 }} pedidos</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminClientsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  clients: Client[] = [];

  ngOnInit() {
    this.apiService.getClients().subscribe((res) => (this.clients = res));
  }
}
