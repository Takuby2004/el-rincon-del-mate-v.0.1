import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DialogService } from '../../core/services/dialog.service';
import { Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective, PaginationComponent],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
})
export class AdminCategoriesFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  categories: Category[] = [];
  searchTerm = '';
  showModal = false;
  isEditing = false;
  editingId = '';
  isSaving = false;

  // Paginación
  currentPage = 1;
  pageSize = 5;

  formData = { name: '', description: '', imageUrl: '' };
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  uploadError = '';
  isDragging = false;

  // Validación reactiva por campos
  touchedFields: Record<string, boolean> = {};
  fieldErrors: Record<string, string> = {};

  @HostListener('window:keydown.escape')
  handleEscapeKey(): void {
    if (this.showModal) {
      this.closeModal();
    }
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  get filteredCategories(): Category[] {
    if (!this.searchTerm.trim()) {
      return this.categories;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.categories.filter((cat) =>
      (cat.name && cat.name.toLowerCase().includes(term)) ||
      (cat.slug && cat.slug.toLowerCase().includes(term)) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  }

  get paginatedCategories(): Category[] {
    const list = this.filteredCategories;
    const maxPage = Math.max(1, Math.ceil(list.length / this.pageSize));
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  // Métodos de validación reactiva
  onFieldInput(field: string): void {
    if (this.touchedFields[field]) {
      this.validateField(field);
    }
  }

  onFieldBlur(field: string): void {
    this.touchedFields[field] = true;
    this.validateField(field);
  }

  validateField(field: string): boolean {
    if (field === 'name') {
      const val = this.formData.name ? this.formData.name.trim() : '';
      if (!val) {
        this.fieldErrors['name'] = 'El nombre de la categoría es obligatorio.';
        return false;
      }
      if (val.length < 3) {
        this.fieldErrors['name'] = 'El nombre debe tener al menos 3 caracteres.';
        return false;
      }
      delete this.fieldErrors['name'];
      return true;
    }
    return true;
  }

  validateAll(): boolean {
    this.touchedFields['name'] = true;
    return this.validateField('name');
  }

  clearErrors(): void {
    this.touchedFields = {};
    this.fieldErrors = {};
  }

  openModal() {
    this.clearErrors();
    this.isEditing = false;
    this.editingId = '';
    this.formData = { name: '', description: '', imageUrl: '' };
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.uploadError = '';
    this.showModal = true;
  }

  editCategory(c: Category) {
    this.clearErrors();
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
    this.clearErrors();
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
    if (!this.validateAll()) {
      return;
    }

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
        this.toastService.success(this.isEditing ? 'Categoría actualizada exitosamente.' : 'Categoría creada exitosamente.');
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.isSaving = false;
        this.dialogService.alert({
          title: 'Error al Guardar',
          message: err.error?.error || 'No se pudo guardar la categoría. Por favor verifica los datos ingresados.',
          type: 'danger'
        });
      }
    });
  }

  async deleteCategory(id: string) {
    const category = this.categories.find((c) => c.id === id);
    const categoryName = category ? `"${category.name}"` : 'esta categoría';

    const confirmed = await this.dialogService.confirm({
      title: '¿Eliminar Categoría?',
      message: `¿Estás seguro de que deseas eliminar permanentemente ${categoryName}?\nEsta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'fa-solid fa-trash-can'
    });

    if (confirmed) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => {
          this.toastService.success('Categoría eliminada.');
          this.loadCategories();
        },
        error: (err) =>
          this.dialogService.alert({
            title: 'Error al Eliminar',
            message: err.error?.error || 'No se pudo eliminar la categoría. Verifica que no contenga productos asociados.',
            type: 'danger'
          })
      });
    }
  }
}
