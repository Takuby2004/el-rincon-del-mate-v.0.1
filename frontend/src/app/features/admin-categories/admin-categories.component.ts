import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-mate-900">Gestión de Categorías</h1>
          <p class="text-xs text-wood-600">Organiza los productos por categorías</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2.5 bg-mate-700 hover:bg-mate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all">
          <i class="fa-solid fa-plus"></i>
          <span>Nueva Categoría</span>
        </button>
      </div>

      <!-- Categories Table -->
      <div class="bg-white rounded-3xl border border-wood-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-wood-100/70 border-b border-wood-200 text-2xs font-bold text-wood-700 uppercase tracking-wider">
              <th class="p-4">Categoría</th>
              <th class="p-4">Slug</th>
              <th class="p-4">Descripción</th>
              <th class="p-4">Productos</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wood-100 text-xs">
            @for (cat of categories; track cat.id) {
              <tr class="hover:bg-wood-50/50 transition-colors">
                <td class="p-4 font-bold text-mate-900">{{ cat.name }}</td>
                <td class="p-4 font-mono text-wood-500 text-2xs">{{ cat.slug }}</td>
                <td class="p-4 text-wood-600 max-w-xs truncate">{{ cat.description }}</td>
                <td class="p-4 font-semibold text-mate-700">{{ cat._count?.products || 0 }} productos</td>
                <td class="p-4 text-right space-x-2">
                  <button (click)="editCategory(cat)" class="p-2 text-mate-700 hover:bg-mate-50 rounded-lg">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="deleteCategory(cat.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      @if (showModal) {
        <div class="fixed inset-0 bg-mate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-wood-200 shadow-2xl space-y-4">
            <h3 class="font-bold text-lg text-mate-900">{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
            <form (ngSubmit)="saveCategory()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Nombre *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
              </div>
              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">URL Imagen</label>
                <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
              </div>
              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Descripción</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs"></textarea>
              </div>
              <div class="pt-3 flex justify-end gap-3 border-t border-wood-100">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-wood-200 text-wood-800 text-xs font-bold rounded-xl">Cancelar</button>
                <button type="submit" class="px-5 py-2 bg-mate-700 hover:bg-mate-800 text-white text-xs font-bold rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminCategoriesFeatureComponent implements OnInit {
  private apiService = inject(ApiService);

  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  editingId = '';

  formData = { name: '', description: '', imageUrl: '' };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  openModal() {
    this.isEditing = false;
    this.formData = { name: '', description: '', imageUrl: '' };
    this.showModal = true;
  }

  editCategory(c: Category) {
    this.isEditing = true;
    this.editingId = c.id;
    this.formData = { name: c.name, description: c.description || '', imageUrl: c.imageUrl || '' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (this.isEditing) {
      this.apiService.updateCategory(this.editingId, this.formData).subscribe(() => {
        this.closeModal();
        this.loadCategories();
      });
    } else {
      this.apiService.createCategory(this.formData).subscribe(() => {
        this.closeModal();
        this.loadCategories();
      });
    }
  }

  deleteCategory(id: string) {
    if (confirm('¿Desea eliminar esta categoría?')) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.error || 'Error al eliminar')
      });
    }
  }
}
