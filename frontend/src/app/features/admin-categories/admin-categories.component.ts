import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-mate-900">Gestión de Categorías</h1>
          <p class="text-xs text-wood-600">Organiza los productos por categorías con imágenes reales</p>
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
              <th class="p-4">Foto</th>
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
                <td class="p-4">
                  <div class="w-12 h-12 rounded-xl overflow-hidden border border-wood-200 bg-wood-100 shrink-0 shadow-2xs">
                    <img [src]="cat.imageUrl | assetUrl" [alt]="cat.name" appImgFallback class="w-full h-full object-cover">
                  </div>
                </td>
                <td class="p-4 font-bold text-mate-900">{{ cat.name }}</td>
                <td class="p-4 font-mono text-wood-500 text-2xs">{{ cat.slug }}</td>
                <td class="p-4 text-wood-600 max-w-xs truncate">{{ cat.description || 'Sin descripción' }}</td>
                <td class="p-4 font-semibold text-mate-700">{{ cat._count?.products || 0 }} productos</td>
                <td class="p-4 text-right space-x-2">
                  <button (click)="editCategory(cat)" class="p-2 text-mate-700 hover:bg-mate-50 rounded-lg transition-colors" title="Editar Categoría">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="deleteCategory(cat.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Categoría">
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
          <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-wood-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center border-b border-wood-100 pb-3">
              <h3 class="font-bold text-lg text-mate-900">{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
              <button (click)="closeModal()" class="text-wood-400 hover:text-wood-700 text-lg">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="saveCategory()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Nombre de la Categoría *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="Ej: Mates Imperiales" class="w-full px-3.5 py-2.5 rounded-xl border border-wood-300 text-xs focus:ring-2 focus:ring-mate-700 outline-none">
              </div>

              <!-- Image Upload Dropzone -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-wood-700">Foto o Imagen de la Categoría</label>
                
                <!-- Dropzone Area -->
                <div 
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  (click)="fileInput.click()"
                  [ngClass]="isDragging ? 'border-mate-700 bg-mate-50' : 'border-wood-300 bg-wood-50'"
                  class="border-2 border-dashed hover:border-mate-600 rounded-2xl p-4 text-center cursor-pointer transition-all duration-200">
                  
                  <input 
                    #fileInput 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    (change)="onFileSelected($event)" 
                    class="hidden">

                  <div class="flex flex-col items-center gap-1.5 py-1">
                    <div class="w-10 h-10 rounded-full bg-mate-100 text-mate-800 flex items-center justify-center">
                      <i class="fa-solid fa-cloud-arrow-up text-base"></i>
                    </div>
                    <div class="text-xs font-bold text-mate-900">
                      Arrastra la imagen aquí o <span class="text-mate-700 underline">haz clic para examinar</span>
                    </div>
                    <div class="text-2xs text-wood-500">JPG, PNG o WEBP (Máx. 5MB)</div>
                  </div>
                </div>

                @if (uploadError) {
                  <div class="text-2xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> {{ uploadError }}
                  </div>
                }

                <!-- Preview Area -->
                @if (selectedFilePreview) {
                  <div class="mt-2 p-3 bg-wood-50 rounded-2xl border border-wood-200 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <img [src]="selectedFilePreview" alt="Previsualización" class="w-12 h-12 object-cover rounded-xl border border-wood-300 shadow-2xs">
                      <div>
                        <div class="text-xs font-bold text-mate-900">Nueva imagen seleccionada</div>
                        <div class="text-2xs text-emerald-700 font-semibold flex items-center gap-1">
                          <i class="fa-solid fa-check-circle"></i> Lista para subir
                        </div>
                      </div>
                    </div>
                    <button type="button" (click)="clearSelectedFile($event)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs" title="Quitar imagen">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                } @else if (formData.imageUrl) {
                  <div class="mt-2 p-3 bg-wood-50 rounded-2xl border border-wood-200 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <img [src]="formData.imageUrl | assetUrl" appImgFallback alt="Imagen actual" class="w-12 h-12 object-cover rounded-xl border border-wood-300 shadow-2xs">
                      <div>
                        <div class="text-xs font-bold text-mate-900">Imagen actual</div>
                        <div class="text-2xs text-wood-500">Se mantendrá esta imagen si no subes una nueva</div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div>
                <label class="block text-xs font-bold text-wood-700 mb-1">Descripción</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" placeholder="Describe brevemente esta categoría..." class="w-full px-3.5 py-2 rounded-xl border border-wood-300 text-xs focus:ring-2 focus:ring-mate-700 outline-none"></textarea>
              </div>

              <div class="pt-3 flex justify-end gap-3 border-t border-wood-100">
                <button type="button" (click)="closeModal()" class="px-4 py-2 bg-wood-200 hover:bg-wood-300 text-wood-800 text-xs font-bold rounded-xl transition-colors">Cancelar</button>
                <button type="submit" [disabled]="isSaving" class="px-5 py-2 bg-mate-700 hover:bg-mate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2">
                  @if (isSaving) {
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Guardando...</span>
                  } @else {
                    <span>Guardar Categoría</span>
                  }
                </button>
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
  isSaving = false;

  formData = { name: '', description: '', imageUrl: '' };
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  uploadError = '';
  isDragging = false;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  openModal() {
    this.isEditing = false;
    this.editingId = '';
    this.formData = { name: '', description: '', imageUrl: '' };
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
    this.showModal = true;
  }

  editCategory(c: Category) {
    this.isEditing = true;
    this.editingId = c.id;
    this.formData = { name: c.name, description: c.description || '', imageUrl: c.imageUrl || '' };
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    this.uploadError = '';
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      this.uploadError = 'Formato inválido. Solo se permiten imágenes JPG, PNG o WEBP.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'El archivo supera el límite de 5MB.';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFilePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearSelectedFile(e: Event) {
    e.stopPropagation();
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
  }

  saveCategory() {
    if (!this.formData.name.trim()) return;

    this.isSaving = true;
    const payload = new FormData();
    payload.append('name', this.formData.name.trim());
    payload.append('description', this.formData.description || '');

    if (this.selectedFile) {
      payload.append('image', this.selectedFile);
    } else if (this.formData.imageUrl) {
      payload.append('imageUrl', this.formData.imageUrl);
    }

    const request$ = this.isEditing
      ? this.apiService.updateCategory(this.editingId, payload)
      : this.apiService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.error || 'Error al guardar la categoría.');
      }
    });
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
