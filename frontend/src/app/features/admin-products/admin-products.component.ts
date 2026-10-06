import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DialogService } from '../../core/services/dialog.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

import { ToastService } from '../../core/services/toast.service';

interface LocalFilePreview {
  file: File;
  previewUrl: string;
}

@Component({
    selector: 'app-admin-products',
    imports: [CommonModule, FormsModule, AssetUrlPipe, ImgFallbackDirective, PaginationComponent],
    templateUrl: './admin-products.component.html',
    styleUrl: './admin-products.component.css'
})
export class AdminProductsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  showModal = false;
  isEditing = false;
  isSaving = false;
  isDragging = false;
  editingId = '';
  uploadError = '';

  // Paginación
  currentPage = 1;
  pageSize = 5;

  // Filtros de búsqueda
  searchTerm = '';
  selectedCategory = 'Todos';
  selectedStatus = 'Todos';
  selectedStock = 'Todos';
  selectedPriceRange = 'Todos';
  selectedCostRange = 'Todos';
  sortBy = 'recent';

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
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};

  ngOnInit() {
    this.loadProducts();
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
  }

  loadProducts() {
    this.loading = true;
    this.apiService.getProducts().subscribe({
      next: (res: any) => {
        const rawList = Array.isArray(res) ? res : (res?.data || []);
        this.products = rawList.map((p: any) => ({
          ...p,
          price: Number(p.price) || 0,
          cost: Number(p.cost) || 0,
          stock: Number(p.stock) || 0
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredProducts(): Product[] {
    return this.products
      .filter((p) => {
        // Filtro por texto
        if (this.searchTerm.trim()) {
          const term = this.searchTerm.toLowerCase().trim();
          const matchName = p.name?.toLowerCase().includes(term);
          const matchSlug = p.slug?.toLowerCase().includes(term);
          const matchDesc = p.description?.toLowerCase().includes(term);
          const matchCat = p.category?.name?.toLowerCase().includes(term);
          if (!matchName && !matchSlug && !matchDesc && !matchCat) return false;
        }

        // Filtro por categoría
        if (this.selectedCategory !== 'Todos') {
          if (p.categoryId !== this.selectedCategory) return false;
        }

        // Filtro por estado
        if (this.selectedStatus !== 'Todos') {
          if (this.selectedStatus === 'active' && !p.active) return false;
          if (this.selectedStatus === 'inactive' && p.active) return false;
        }

        // Filtro por stock
        if (this.selectedStock !== 'Todos') {
          if (this.selectedStock === 'in_stock' && p.stock <= 5) return false;
          if (this.selectedStock === 'low_stock' && (p.stock <= 0 || p.stock > 5)) return false;
          if (this.selectedStock === 'out_of_stock' && p.stock > 0) return false;
        }

        // Filtro por precio redondeado / rango
        if (this.selectedPriceRange !== 'Todos') {
          const price = p.price;
          switch (this.selectedPriceRange) {
            case '50':
              if (price > 50) return false;
              break;
            case '100':
              if (price > 100) return false;
              break;
            case '200':
              if (price > 200) return false;
              break;
            case '500':
              if (price > 500) return false;
              break;
            case 'over500':
              if (price <= 500) return false;
              break;
          }
        }

        // Filtro por costo redondeado / rango
        if (this.selectedCostRange !== 'Todos') {
          const cost = p.cost;
          switch (this.selectedCostRange) {
            case '30':
              if (cost > 30) return false;
              break;
            case '50':
              if (cost > 50) return false;
              break;
            case '100':
              if (cost > 100) return false;
              break;
            case '200':
              if (cost > 200) return false;
              break;
            case 'over200':
              if (cost <= 200) return false;
              break;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'cost_asc':
            return a.cost - b.cost;
          case 'cost_desc':
            return b.cost - a.cost;
          case 'stock_desc':
            return b.stock - a.stock;
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'recent':
          default:
            return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
        }
      });
  }

  get paginatedProducts(): Product[] {
    const list = this.filteredProducts;
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

  get activeProductsCount(): number {
    return this.products.filter(p => p.active && p.stock > 0).length;
  }

  get criticalStockCount(): number {
    return this.products.filter(p => p.stock <= 5).length;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'Todos';
    this.selectedStatus = 'Todos';
    this.selectedStock = 'Todos';
    this.selectedPriceRange = 'Todos';
    this.selectedCostRange = 'Todos';
    this.sortBy = 'recent';
    this.currentPage = 1;
  }

  clearErrors() {
    this.fieldErrors = {};
    this.touchedFields = {};
  }

  onFieldBlur(field: string) {
    this.touchedFields[field] = true;
    this.validateField(field);
  }

  onFieldInput(field: string) {
    if (this.touchedFields[field]) {
      this.validateField(field);
    }
  }

  validateField(field: string): boolean {
    switch (field) {
      case 'name':
        if (!this.formData.name || this.formData.name.trim().length < 3) {
          this.fieldErrors['name'] = 'El nombre es obligatorio y debe tener al menos 3 caracteres.';
          return false;
        }
        delete this.fieldErrors['name'];
        return true;

      case 'categoryId':
        if (!this.formData.categoryId || this.formData.categoryId.trim() === '') {
          this.fieldErrors['categoryId'] = 'Debes seleccionar una categoría para el producto.';
          return false;
        }
        delete this.fieldErrors['categoryId'];
        return true;

      case 'price':
        if (
          this.formData.price === null ||
          this.formData.price === undefined ||
          (this.formData.price as any) === '' ||
          isNaN(Number(this.formData.price)) ||
          Number(this.formData.price) <= 0
        ) {
          this.fieldErrors['price'] = 'El precio debe ser un número válido mayor a 0 (ej: 45.50).';
          return false;
        }
        delete this.fieldErrors['price'];
        return true;

      case 'cost':
        if (
          this.formData.cost === null ||
          this.formData.cost === undefined ||
          (this.formData.cost as any) === '' ||
          isNaN(Number(this.formData.cost)) ||
          Number(this.formData.cost) < 0
        ) {
          this.fieldErrors['cost'] = 'El costo debe ser un número mayor o igual a 0 (ej: 30.00).';
          return false;
        }
        delete this.fieldErrors['cost'];
        return true;

      case 'stockInput':
        if (
          this.formData.stockInput === null ||
          this.formData.stockInput === undefined ||
          (this.formData.stockInput as any) === '' ||
          isNaN(Number(this.formData.stockInput)) ||
          !Number.isInteger(Number(this.formData.stockInput))
        ) {
          this.fieldErrors['stockInput'] = 'El stock debe ser un número entero válido (ej: 10).';
          return false;
        }
        if (!this.isEditing && Number(this.formData.stockInput) < 0) {
          this.fieldErrors['stockInput'] = 'El stock inicial no puede ser un número negativo.';
          return false;
        }
        delete this.fieldErrors['stockInput'];
        return true;

      default:
        return true;
    }
  }

  validateAll(): boolean {
    const fields = ['name', 'categoryId', 'price', 'cost', 'stockInput'];
    let isValid = true;
    for (const field of fields) {
      this.touchedFields[field] = true;
      if (!this.validateField(field)) {
        isValid = false;
      }
    }
    return isValid;
  }

  openModal() {
    this.cleanPreviews();
    this.clearErrors();
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
    this.clearErrors();
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
      price: Number(p.price) || 0,
      cost: Number(p.cost) || 0,
      stockInput: 0,
      active: p.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.cleanPreviews();
    this.clearErrors();
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
    this.uploadError = '';
    if (!this.validateAll()) {
      return;
    }

    this.isSaving = true;

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
          this.toastService.success('Producto actualizado exitosamente.');
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.uploadError = err.error?.error || 'Error al actualizar el producto.';
          this.toastService.error(this.uploadError);
        }
      });
    } else {
      this.apiService.createProduct(payload).subscribe({
        next: () => {
          this.toastService.success('Producto creado exitosamente.');
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.uploadError = err.error?.error || 'Error al crear el producto.';
          this.toastService.error(this.uploadError);
        }
      });
    }
  }

  async deleteProduct(id: string) {
    const product = this.products.find((p) => p.id === id);
    const productName = product ? `"${product.name}"` : 'este producto';

    const confirmed = await this.dialogService.confirm({
      title: '¿Eliminar Producto?',
      message: `¿Estás seguro de que deseas eliminar permanentemente ${productName}?\nEsta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'fa-solid fa-trash-can'
    });

    if (confirmed) {
      this.apiService.deleteProduct(id).subscribe({
        next: () => {
          this.toastService.success('Producto eliminado del catálogo.');
          this.loadProducts();
        },
        error: (err) =>
          this.dialogService.alert({
            title: 'Error al Eliminar',
            message: err.error?.error || 'No se pudo eliminar el producto.',
            type: 'danger'
          })
      });
    }
  }
}
