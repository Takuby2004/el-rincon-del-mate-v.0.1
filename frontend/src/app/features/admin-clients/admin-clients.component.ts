import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DialogService } from '../../core/services/dialog.service';
import { Client } from '../../core/models/models';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-admin-clients',
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './admin-clients.component.html',
    styleUrl: './admin-clients.component.css'
})
export class AdminClientsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  clients: Client[] = [];
  loading = true;

  // Paginación
  currentPage = 1;
  pageSize = 5;

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
      next: (res: any) => {
        this.clients = Array.isArray(res) ? res : (res?.data || []);
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

  get paginatedClients(): Client[] {
    const list = this.filteredClients;
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

  get totalOrdersSum(): number {
    return this.clients.reduce((acc, c) => acc + (c._count?.orders || 0), 0);
  }

  actionMessage: string | null = null;
  actionError: string | null = null;
  deletingId: string | null = null;

  async deleteClient(client: Client) {
    const confirmed = await this.dialogService.confirm({
      title: '¿Eliminar Cliente?',
      message: `¿Estás seguro de que deseas eliminar permanentemente los datos del cliente "${client.name}"?\nEsta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'fa-solid fa-user-xmark'
    });

    if (!confirmed) return;

    this.deletingId = client.id;
    this.actionMessage = null;
    this.actionError = null;

    this.apiService.deleteClient(client.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.actionMessage = `Los datos de "${client.name}" fueron eliminados exitosamente.`;
        this.toastService.success(this.actionMessage);
        this.clients = this.clients.filter((c) => c.id !== client.id);
        setTimeout(() => (this.actionMessage = null), 5000);
      },
      error: (err) => {
        this.deletingId = null;
        this.actionError = err.error?.error || 'No se pudo eliminar el cliente. Intenta nuevamente.';
        this.toastService.error(this.actionError || 'No se pudo eliminar el cliente.');
        setTimeout(() => (this.actionError = null), 7000);
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedDepartment = 'Todos';
    this.cityFilter = '';
    this.sortBy = 'recent';
    this.currentPage = 1;
  }
}


