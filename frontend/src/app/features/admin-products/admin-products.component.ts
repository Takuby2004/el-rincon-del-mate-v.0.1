import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

interface LocalFilePreview {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);

  products: Product[] = [];
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  isSaving = false;
  isDragging = false;
  editingId = '';
  uploadError = '';

  formData = {
    name: '',
    categoryId: '',
    description: '',
    price: 0,
    cost: 0,
    stockInput: 0,
    active: true
  };

  existingImages: string[] = [];
  selectedFiles: LocalFilePreview[] = [];

  ngOnInit() {
    this.loadProducts();
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  loadProducts() {
    this.apiService.getProducts().subscribe((res) => (this.products = res));
  }

  openModal() {
    this.cleanPreviews();
    this.isEditing = false;
    this.editingId = '';
    this.uploadError = '';
    this.existingImages = [];
    this.selectedFiles = [];
    this.formData = {
      name: '',
      categoryId: this.categories[0]?.id || '',
      description: '',
      price: 0,
      cost: 0,
      stockInput: 10,
      active: true
    };
    this.showModal = true;
  }

  editProduct(p: Product) {
    this.cleanPreviews();
    this.isEditing = true;
    this.editingId = p.id;
    this.uploadError = '';
    this.selectedFiles = [];
    
    if (p.images && p.images.length > 0) {
      this.existingImages = [...p.images];
    } else if (p.imageUrl) {
      this.existingImages = [p.imageUrl];
    } else {
      this.existingImages = [];
    }

    this.formData = {
      name: p.name,
      categoryId: p.categoryId,
      description: p.description,
      price: p.price,
      cost: p.cost,
      stockInput: 0,
      active: p.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.cleanPreviews();
    this.showModal = false;
    this.isSaving = false;
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
    if (e.dataTransfer && e.dataTransfer.files) {
      this.addFiles(Array.from(e.dataTransfer.files));
    }
  }

  onFilesSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.addFiles(Array.from(event.target.files));
      event.target.value = '';
    }
  }

  addFiles(files: File[]) {
    this.uploadError = '';
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.uploadError = `El archivo "${file.name}" no es una imagen válida (JPG, PNG o WEBP).`;
        continue;
      }
      if (file.size > maxSizeBytes) {
        this.uploadError = `El archivo "${file.name}" excede el límite máximo de 5 MB.`;
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      this.selectedFiles.push({ file, previewUrl });
    }
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  removeSelectedFile(index: number) {
    const item = this.selectedFiles[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.selectedFiles.splice(index, 1);
  }

  setAsPrimaryExisting(index: number) {
    if (index > 0 && index < this.existingImages.length) {
      const [item] = this.existingImages.splice(index, 1);
      this.existingImages.unshift(item);
    }
  }

  setAsPrimaryNew(index: number) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const [item] = this.selectedFiles.splice(index, 1);
      this.selectedFiles.unshift(item);
    }
  }

  cleanPreviews() {
    for (const item of this.selectedFiles) {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    }
    this.selectedFiles = [];
  }

  saveProduct() {
    this.isSaving = true;
    this.uploadError = '';

    const payload = new FormData();
    payload.append('name', this.formData.name);
    payload.append('categoryId', this.formData.categoryId);
    payload.append('description', this.formData.description || '');
    payload.append('price', this.formData.price.toString());
    payload.append('cost', this.formData.cost.toString());
    payload.append('active', this.formData.active.toString());

    if (this.isEditing) {
      payload.append('stockAdjustment', this.formData.stockInput.toString());
    } else {
      payload.append('stock', this.formData.stockInput.toString());
    }

    payload.append('existingImages', JSON.stringify(this.existingImages));

    for (const item of this.selectedFiles) {
      payload.append('images', item.file);
    }

    if (this.isEditing) {
      this.apiService.updateProduct(this.editingId, payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.uploadError = err.error?.error || 'Error al actualizar el producto.';
        }
      });
    } else {
      this.apiService.createProduct(payload).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.uploadError = err.error?.error || 'Error al crear el producto.';
        }
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('¿Desea desactivar este producto?')) {
      this.apiService.deleteProduct(id).subscribe(() => this.loadProducts());
    }
  }
}
