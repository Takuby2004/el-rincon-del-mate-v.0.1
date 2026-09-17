import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

export interface HeroSvgSlide {
  src: string;
  name: string;
  subtitle: string;
  badge: string;
}

@Component({
    selector: 'app-home',
    imports: [CommonModule, RouterLink, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeFeatureComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  loadingCategories = true;
  loadingProducts = true;
  addedProductId: string | null = null;

  // Hero SVGs Carousel State
  heroSvgSlides: HeroSvgSlide[] = [
    {
      src: 'assets/producto_mate_16.svg',
      name: 'Mate Imperial Premium',
      subtitle: 'Calabaza brasilera seleccionada con virola de alpaca cincelada',
      badge: 'Artesanía Premium'
    },
    {
      src: 'assets/producto_mate_18.svg',
      name: 'Mate Camionero Tradicional',
      subtitle: 'Cuero vacuno legítimo con costura reforzada a mano',
      badge: 'Tradición Gaucha'
    },
    {
      src: 'assets/producto_mate_27.svg',
      name: 'Mate Torpedo Uruguayo',
      subtitle: 'Formato estilizado con base de cuatro patas de máxima estabilidad',
      badge: 'Diseño Clásico'
    },
    {
      src: 'assets/producto_mate_31.svg',
      name: 'Mate Imperial Guarda Especial',
      subtitle: 'Detalles ornamentales cincelados con acabado en plata y bronce',
      badge: 'Edición Exclusiva'
    }
  ];

  activeHeroIndex = 0;
  slideDirection: 'next' | 'prev' = 'next';
  private autoSlideTimer: any = null;
  private autoSlideIntervalMs = 5000; // Exactamente cada 5 segundos

  ngOnInit() {
    this.startAutoSlide();

    this.apiService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.slice(0, 3);
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false)
    });

    this.apiService.getProducts({ activeOnly: true }).subscribe({
      next: (res) => {
        this.featuredProducts = res.slice(0, 4);
        this.loadingProducts = false;
      },
      error: () => (this.loadingProducts = false)
    });
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideTimer = setInterval(() => {
      this.nextHeroSlide();
    }, this.autoSlideIntervalMs);
  }

  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  pauseAutoSlide() {
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.startAutoSlide();
  }

  nextHeroSlide() {
    this.slideDirection = 'next';
    this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroSvgSlides.length;
  }

  prevHeroSlide() {
    this.slideDirection = 'prev';
    const total = this.heroSvgSlides.length;
    this.activeHeroIndex = (this.activeHeroIndex - 1 + total) % total;
  }

  goToHeroSlide(index: number) {
    this.slideDirection = index > this.activeHeroIndex ? 'next' : 'prev';
    this.activeHeroIndex = index;
    this.startAutoSlide(); // Reinicia el temporizador al interactuar
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
