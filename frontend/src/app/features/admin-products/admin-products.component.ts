import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-mate-900">Gestión de Productos</h1>
          <p class="text-xs text-wood-600">Administra el catálogo de mates, termos, bombillas y control de stock</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2.5 bg-mate-700 hover:bg-mate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all">
          <i class="fa-solid fa-plus"></i>
          <span>Nuevo Producto</span>
        </button>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-3xl border border-wood-200 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-wood-100/70 border-b border-wood-200 text-2xs font-bold text-wood-700 uppercase tracking-wider">
              <th class="p-4">Producto</th>
              <th class="p-4">Categoría</th>
              <th class="p-4">Precio (Bs.)</th>
              <th class="p-4">Costo (Bs.)</th>
              <th class="p-4">Stock</th>
              <th class="p-4">QR</th>
              <th class="p-4">Estado</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wood-100 text-xs">
            @for (product of products; track product.id) {
              <tr class="hover:bg-wood-50/50 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img [src]="product.imageUrl | assetUrl" [alt]="product.name" appImgFallback class="w-10 h-10 object-cover rounded-lg border border-wood-200">
                    <div>
                      <div class="font-bold text-mate-900 line-clamp-1">{{ product.name }}</div>
                      <div class="text-2xs text-wood-500 font-mono">{{ product.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4 font-semibold text-wood-700">{{ product.category?.name }}</td>
                <td class="p-4 font-extrabold text-mate-900">Bs. {{ product.price.toFixed(2) }}</td>
                <td class="p-4 font-medium text-wood-600">Bs. {{ product.cost.toFixed(2) }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full font-bold text-2xs" [ngClass]="product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                    {{ product.stock }} un.
                  </span>
                </td>
                <td class="p-4">
                  @if (product.qrCodeUrl) {
                    <img [src]="product.qrCodeUrl" [alt]="'QR ' + product.name" class="w-8 h-8 rounded border border-wood-300">
                  }
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-2xs font-semibold" [ngClass]="product.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'">
                    {{ product.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="p-4 text-right space-x-2">
                  <button (click)="editProduct(product)" class="p-2 text-mate-700 hover:bg-mate-50 rounded-lg transition-colors">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="deleteProduct(product.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create / Edit Modal -->
      @if (showModal) {
        <div class="fixed inset-0 bg-mate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-xl w-full border border-wood-200 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-wood-100 pb-3">
              <h3 class="font-bold text-lg text-mate-900">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
              <button (click)="closeModal()" class="text-wood-400 hover:text-wood-700 text-lg">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Nombre del Producto *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-wood-700 mb-1">Categoría *</label>
                  <select [(ngModel)]="formData.categoryId" name="categoryId" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs bg-white">
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-wood-700 mb-1">URL Imagen</label>
                  <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs" placeholder="https://...">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-wood-700 mb-1">Precio Venta (Bs.) *</label>
                  <input type="number" step="0.01" [(ngModel)]="formData.price" name="price" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
                </div>
                <div>
                  <label class="block text-xs font-bold text-wood-700 mb-1">Costo (Bs.) *</label>
                  <input type="number" step="0.01" [(ngModel)]="formData.cost" name="cost" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
                </div>
                <div>
                  <label class="block text-xs font-bold text-wood-700 mb-1">{{ isEditing ? 'Ajustar Stock (+/-)' : 'Stock Inicial' }}</label>
                  <input type="number" [(ngModel)]="formData.stockInput" name="stockInput" required class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Descripción</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs"></textarea>
              </div>

              <div class="pt-3 flex justify-end gap-3 border-t border-wood-100">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-wood-200 text-wood-800 text-xs font-bold rounded-xl">Cancelar</button>
                <button type="submit" class="px-5 py-2 bg-mate-700 hover:bg-mate-800 text-white text-xs font-bold rounded-xl shadow">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);

  products: Product[] = [];
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  editingId = '';

  formData = {
    name: '',
    categoryId: '',
    description: '',
    price: 0,
    cost: 0,
    stockInput: 0,
    imageUrl: ''
  };

  ngOnInit() {
    this.loadProducts();
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  loadProducts() {
    this.apiService.getProducts().subscribe((res) => (this.products = res));
  }

  openModal() {
    this.isEditing = false;
    this.formData = { name: '', categoryId: this.categories[0]?.id || '', description: '', price: 0, cost: 0, stockInput: 10, imageUrl: '' };
    this.showModal = true;
  }

  editProduct(p: Product) {
    this.isEditing = true;
    this.editingId = p.id;
    this.formData = {
      name: p.name,
      categoryId: p.categoryId,
      description: p.description,
      price: p.price,
      cost: p.cost,
      stockInput: 0,
      imageUrl: p.imageUrl || ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProduct() {
    if (this.isEditing) {
      this.apiService
        .updateProduct(this.editingId, {
          name: this.formData.name,
          categoryId: this.formData.categoryId,
          description: this.formData.description,
          price: this.formData.price,
          cost: this.formData.cost,
          stockAdjustment: this.formData.stockInput,
          imageUrl: this.formData.imageUrl
        })
        .subscribe(() => {
          this.closeModal();
          this.loadProducts();
        });
    } else {
      this.apiService
        .createProduct({
          name: this.formData.name,
          categoryId: this.formData.categoryId,
          description: this.formData.description,
          price: this.formData.price,
          cost: this.formData.cost,
          stock: this.formData.stockInput,
          imageUrl: this.formData.imageUrl
        })
        .subscribe(() => {
          this.closeModal();
          this.loadProducts();
        });
    }
  }

  deleteProduct(id: string) {
    if (confirm('¿Desea desactivar este producto?')) {
      this.apiService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }
}
