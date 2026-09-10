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
  standalone: true,
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
  Math = Math;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.apiService.getProductBySlug(slug).subscribe({
        next: (res) => {
          this.product = res;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
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
