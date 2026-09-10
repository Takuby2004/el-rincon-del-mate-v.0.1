import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, AssetUrlPipe, ImgFallbackDirective],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartFeatureComponent {
  cartService = inject(CartService);
}
