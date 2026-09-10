import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AssetUrlPipe, ImgFallbackDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  allProducts: Product[] = [];

  loadingCategories = true;
  loadingProducts = true;
  addedProductId: string | null = null;

  // Flip 3D State
  activeIndex = 0;

  ngOnInit() {
    this.apiService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.slice(0, 3);
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false)
    });

    this.apiService.getProducts({ activeOnly: true }).subscribe({
      next: (res) => {
        this.allProducts = res;
        this.featuredProducts = res.slice(0, 4);
        this.loadingProducts = false;
      },
      error: () => (this.loadingProducts = false)
    });
  }

  // Windows Vista Flip 3D Methods
  nextProduct() {
    if (this.allProducts.length > 0) {
      this.activeIndex = (this.activeIndex + 1) % this.allProducts.length;
    }
  }

  prevProduct() {
    if (this.allProducts.length > 0) {
      this.activeIndex = (this.activeIndex - 1 + this.allProducts.length) % this.allProducts.length;
    }
  }

  selectProduct(index: number) {
    this.activeIndex = index;
  }

  getCardTransform(index: number): string {
    const total = this.allProducts.length;
    if (total === 0) return '';

    // Calculate relative distance with wrap-around
    let offset = index - this.activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    if (offset === 0) {
      // Front active card (straight, closest to camera)
      return 'translateX(0px) translateY(0px) translateZ(60px) rotateY(0deg) scale(1)';
    } else if (offset > 0) {
      // Cards behind on the right (Flip 3D cascade)
      const xOffset = offset * 48;
      const zOffset = -offset * 110;
      const scale = Math.max(0.7, 1 - offset * 0.08);
      return `translateX(${xOffset}px) translateY(${offset * 4}px) translateZ(${zOffset}px) rotateY(-32deg) scale(${scale})`;
    } else {
      // Cards behind on the left
      const xOffset = offset * 48;
      const zOffset = offset * 110; // offset is negative
      const scale = Math.max(0.7, 1 + offset * 0.08);
      return `translateX(${xOffset}px) translateY(${-offset * 4}px) translateZ(${zOffset}px) rotateY(32deg) scale(${scale})`;
    }
  }

  getCardOpacity(index: number): number {
    const total = this.allProducts.length;
    if (total === 0) return 1;

    let offset = Math.abs(index - this.activeIndex);
    if (offset > total / 2) offset = total - offset;

    if (offset === 0) return 1;
    if (offset === 1) return 0.82;
    if (offset === 2) return 0.6;
    return 0.35;
  }

  getCardZIndex(index: number): number {
    const total = this.allProducts.length;
    if (total === 0) return 10;

    let offset = Math.abs(index - this.activeIndex);
    if (offset > total / 2) offset = total - offset;

    return 30 - offset * 5;
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
