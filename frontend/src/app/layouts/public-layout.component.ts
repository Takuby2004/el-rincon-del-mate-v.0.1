import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { ImgFallbackDirective } from '../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-public-layout',
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ImgFallbackDirective],
    templateUrl: './public-layout.component.html',
    styleUrls: ['./public-layout.component.css']
})
export class PublicLayoutComponent {
  cartService = inject(CartService);
  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
