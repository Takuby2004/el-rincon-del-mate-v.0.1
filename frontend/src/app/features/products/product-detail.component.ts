import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-product-detail',
    imports: [CommonModule, RouterLink, FormsModule, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailFeatureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  product: Product | null = null;
  quantity = 1;
  loading = true;
  addedSuccess = false;
  selectedImageIndex = 0;
  Math = Math;

  get allImages(): string[] {
    if (!this.product) return [];
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images;
    }
    return this.product.imageUrl ? [this.product.imageUrl] : [];
  }

  get currentImageUrl(): string {
    const images = this.allImages;
    if (images.length === 0) return '';
    if (this.selectedImageIndex >= images.length) {
      this.selectedImageIndex = 0;
    }
    return images[this.selectedImageIndex];
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.apiService.getProductBySlug(slug).subscribe({
        next: (res) => {
          this.product = res;
          this.selectedImageIndex = 0;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  prevImage() {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.selectedImageIndex = (this.selectedImageIndex - 1 + total) % total;
  }

  nextImage() {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % total;
  }

  addToCart() {
    if (this.product) {
      this.cartService.addItem(this.product, this.quantity);
      this.addedSuccess = true;
      setTimeout(() => {
        this.addedSuccess = false;
      }, 1800);
    }
  }
}
