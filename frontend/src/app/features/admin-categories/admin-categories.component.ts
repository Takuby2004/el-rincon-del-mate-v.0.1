import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-admin-categories',
    imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './admin-categories.component.html',
    styleUrl: './admin-categories.component.css'
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
