import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Product } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-categories',
    imports: [CommonModule, RouterLink, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})
export class CategoriesFeatureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  categories: Category[] = [];
  categoryDetail: Category | null = null;
  categoryProducts: Product[] = [];
  selectedCategorySlug: string | null = null;
  loading = true;
  addedProductId: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.selectedCategorySlug = params.get('slug');
      this.loading = true;
      if (this.selectedCategorySlug) {
        this.apiService.getCategoryBySlug(this.selectedCategorySlug).subscribe({
          next: (res: any) => {
            this.categoryDetail = res;
            this.categoryProducts = (res.products || []).map((p: any) => ({
              ...p,
              price: Number(p.price) || 0
            }));
            this.loading = false;
          },
          error: () => (this.loading = false)
        });
      } else {
        this.apiService.getCategories().subscribe({
          next: (res) => {
            this.categories = res;
            this.loading = false;
          },
          error: () => (this.loading = false)
        });
      }
    });
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
