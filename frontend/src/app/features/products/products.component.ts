import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-products',
    imports: [CommonModule, RouterLink, FormsModule, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  products: Product[] = [];
  categories: Category[] = [];
  searchQuery = '';
  selectedCategory = '';
  loading = true;
  addedProductId: string | null = null;

  ngOnInit() {
    this.apiService.getCategories().subscribe((res) => (this.categories = res));
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.apiService
      .getProducts({
        search: this.searchQuery,
        categoryId: this.selectedCategory,
        activeOnly: true
      })
      .subscribe({
        next: (res: any) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          this.products = list.map((p: any) => ({
            ...p,
            price: Number(p.price) || 0
          }));
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  onFilterChange() {
    this.loadProducts();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.loadProducts();
  }

  addToCart(product: Product) {
    this.cartService.addItem(product, 1);
    this.addedProductId = product.id;
    setTimeout(() => {
      if (this.addedProductId === product.id) {
        this.addedProductId = null;
      }
    }, 1500);
  }
}
