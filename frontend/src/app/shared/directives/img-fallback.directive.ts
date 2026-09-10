import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective implements OnInit {
  @Input() appImgFallback?: string;

  // SVG de alta fidelidad con mate artesanal, virola dorada y hojas de yerba para fallback sin dependencia externa
  private readonly defaultSvgFallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3424"/>
          <stop offset="50%" stop-color="#142618"/>
          <stop offset="100%" stop-color="#0a140d"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3e8c5"/>
          <stop offset="50%" stop-color="#c5a059"/>
          <stop offset="100%" stop-color="#8e6b2c"/>
        </linearGradient>
        <linearGradient id="calabazaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#452d1c"/>
          <stop offset="60%" stop-color="#2c1b10"/>
          <stop offset="100%" stop-color="#1a100a"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGrad)"/>
      <circle cx="200" cy="200" r="140" fill="#2d5036" opacity="0.25"/>
      <circle cx="200" cy="200" r="110" fill="none" stroke="#c5a059" stroke-width="2" stroke-dasharray="6,6" opacity="0.4"/>
      
      <!-- Mate Calabaza Shape -->
      <path d="M 130 170 C 120 250, 150 300, 200 300 C 250 300, 280 250, 270 170 Z" fill="url(#calabazaGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
      
      <!-- Virola Cincelada Superior -->
      <ellipse cx="200" cy="170" rx="70" ry="20" fill="url(#goldGrad)" stroke="#8e6b2c" stroke-width="2"/>
      <ellipse cx="200" cy="170" rx="52" ry="13" fill="#142618"/>
      
      <!-- Bombilla de Alpaca Inclinada -->
      <line x1="200" y1="170" x2="270" y2="85" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round"/>
      <line x1="270" y1="85" x2="285" y2="70" stroke="#f3e8c5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Yerba Mate & Espuma -->
      <ellipse cx="195" cy="170" rx="42" ry="10" fill="#3c5842"/>
      <circle cx="185" cy="168" r="4" fill="#75937c" opacity="0.8"/>
      <circle cx="205" cy="171" r="3" fill="#75937c" opacity="0.8"/>
      
      <!-- Typography -->
      <text x="200" y="345" font-family="'Outfit', Montserrat, sans-serif" font-size="14" font-weight="bold" fill="#f3e8c5" text-anchor="middle" letter-spacing="2">EL RINCÓN DEL MATE</text>
      <text x="200" y="365" font-family="'Outfit', Montserrat, sans-serif" font-size="10" font-weight="600" fill="#c5a059" text-anchor="middle" letter-spacing="1">TRADICIÓN Y CALIDAD</text>
    </svg>
  `);

  private hasFailed = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;
    img.classList.add('img-loading');
    img.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s ease';

    // Si la imagen ya terminó de cargar desde caché
    if (img.complete && img.naturalWidth > 0) {
      this.onLoad();
    }
  }

  @HostListener('load')
  onLoad(): void {
    const img = this.el.nativeElement;
    img.classList.remove('img-loading');
    img.classList.add('img-loaded');
  }

  @HostListener('error')
  onError(): void {
    if (!this.hasFailed) {
      this.hasFailed = true;
      const img = this.el.nativeElement;
      img.src = this.appImgFallback || this.defaultSvgFallback;
      img.classList.remove('img-loading');
      img.classList.add('img-loaded');
    }
  }
}
