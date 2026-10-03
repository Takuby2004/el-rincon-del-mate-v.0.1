import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models/models';

@Component({
    selector: 'app-admin-clients',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-clients.component.html',
    styleUrl: './admin-clients.component.css'
})
export class AdminClientsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  clients: Client[] = [];
  loading = true;

  // Filtros reactivos
  searchTerm = '';
  selectedDepartment = 'Todos';
  cityFilter = '';
  sortBy = 'recent'; // 'recent' | 'name_asc' | 'name_desc' | 'orders_desc' | 'orders_asc'

  // Departamentos oficiales de Bolivia
  readonly departments = [
    'Todos',
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija'
  ];

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.apiService.getClients().subscribe({
      next: (res) => {
        this.clients = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredClients(): Client[] {
    let result = [...this.clients];

    // 1. Filtro por término de búsqueda (nombre, email, teléfono, ci/nit, dirección)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter((c) =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.includes(term)) ||
        (c.ciNit && c.ciNit.toLowerCase().includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term))
      );
    }

    // 2. Filtro por departamento
    if (this.selectedDepartment !== 'Todos') {
      const dept = this.selectedDepartment.toLowerCase();
      result = result.filter((c) => c.city && c.city.toLowerCase().includes(dept));
    }

    // 3. Filtro por ciudad específica
    if (this.cityFilter.trim()) {
      const city = this.cityFilter.toLowerCase().trim();
      result = result.filter((c) => c.city && c.city.toLowerCase().includes(city));
    }

    // 4. Criterio de Ordenamiento
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'orders_desc':
          return (b._count?.orders || 0) - (a._count?.orders || 0);
        case 'orders_asc':
          return (a._count?.orders || 0) - (b._count?.orders || 0);
        case 'recent':
        default:
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
      }
    });

    return result;
  }

  get totalOrdersSum(): number {
    return this.clients.reduce((acc, c) => acc + (c._count?.orders || 0), 0);
  }

  actionMessage: string | null = null;
  actionError: string | null = null;
  deletingId: string | null = null;

  deleteClient(client: Client) {
    const confirmation = confirm(
      `¿Estás seguro de que deseas eliminar permanentemente los datos del cliente "${client.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmation) return;

    this.deletingId = client.id;
    this.actionMessage = null;
    this.actionError = null;

    this.apiService.deleteClient(client.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.actionMessage = `Los datos de "${client.name}" fueron eliminados exitosamente.`;
        this.clients = this.clients.filter((c) => c.id !== client.id);
        setTimeout(() => (this.actionMessage = null), 5000);
      },
      error: (err) => {
        this.deletingId = null;
        this.actionError = err.error?.error || 'No se pudo eliminar el cliente. Intenta nuevamente.';
        setTimeout(() => (this.actionError = null), 7000);
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = 'Todos';
    this.cityFilter = '';
    this.sortBy = 'recent';
  }
}


