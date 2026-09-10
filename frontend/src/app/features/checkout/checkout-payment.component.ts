import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentQrConfig } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, AssetUrlPipe, ImgFallbackDirective],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <!-- Steps Indicator -->
      <div class="flex items-center justify-center mb-10 text-xs font-bold text-wood-600 gap-4">
        <div class="flex items-center gap-2 text-emerald-700">
          <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">✓</span>
          <span>Datos del Cliente</span>
        </div>
        <div class="w-12 h-0.5 bg-mate-600"></div>
        <div class="flex items-center gap-2 text-mate-700">
          <span class="w-6 h-6 rounded-full bg-mate-700 text-white flex items-center justify-center">2</span>
          <span>Pago QR y Comprobante</span>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-8 border border-wood-200 shadow-sm space-y-8">
        <!-- Title & Amount -->
        <div class="text-center space-y-2 border-b border-wood-100 pb-6">
          <h1 class="text-3xl font-extrabold text-mate-900">Realizar pago</h1>
          <div class="text-sm text-wood-600 font-medium">Monto total a pagar:</div>
          <div class="text-4xl font-black text-mate-700">Bs. {{ cartService.totalPrice().toFixed(2) }}</div>
        </div>

        <!-- Instructions & Owner QR -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-wood-50/70 p-6 rounded-2xl border border-wood-200">
          <!-- QR Image -->
          <div class="flex flex-col items-center justify-center space-y-3">
            @if (activeQr) {
              <div class="w-64 h-64 bg-white p-3 rounded-2xl shadow-md border-2 border-mate-600 overflow-hidden">
                <img [src]="activeQr.imageUrl | assetUrl" alt="Código QR Bancario del Dueño" appImgFallback class="w-full h-full object-contain">
              </div>
              <span class="text-xs font-bold text-mate-800 flex items-center gap-1.5">
                <i class="fa-solid fa-qrcode text-mate-600"></i> QR Bancario Oficial del Dueño
              </span>
            } @else {
              <div class="w-64 h-64 bg-wood-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-wood-600">
                <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-mate-600"></i>
                <span class="text-xs">Cargando código QR de pago...</span>
              </div>
            }
          </div>

          <!-- Instructions Text -->
          <div class="space-y-3">
            <h3 class="font-bold text-mate-900 text-base">Instrucciones de Pago:</h3>
            <ol class="space-y-2 text-xs text-wood-800 leading-relaxed font-medium">
              <li class="flex items-start gap-2">
                <span class="font-bold text-mate-700 bg-wood-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                <span>Escanea el código QR utilizando tu aplicación bancaria.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-mate-700 bg-wood-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                <span>Realiza el pago por el monto indicado (<strong>Bs. {{ cartService.totalPrice().toFixed(2) }}</strong>).</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-mate-700 bg-wood-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                <span>Guarda o toma una captura del comprobante emitido por tu banco.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-mate-700 bg-wood-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">4</span>
                <span>Sube el comprobante utilizando el formulario inferior.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold text-mate-700 bg-wood-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">5</span>
                <span>Envía tu pedido.</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- Payment Proof Upload Area (MANDATORY) -->
        <div class="space-y-4">
          <label class="block text-sm font-bold text-mate-900">
            Comprobante de pago *
            <span class="text-xs font-normal text-wood-600 block">Formataos permitidos: PNG, JPG, JPEG, WEBP (Máx. 5MB)</span>
          </label>

          <!-- Dropzone -->
          <div
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            [ngClass]="isDragging ? 'border-mate-600 bg-mate-50' : 'border-wood-300 bg-wood-50/40'"
            class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative"
          >
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden">

            @if (!selectedFile) {
              <div (click)="fileInput.click()" class="space-y-3">
                <div class="w-14 h-14 rounded-full bg-mate-100 text-mate-700 mx-auto flex items-center justify-center text-2xl">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div class="text-sm font-bold text-mate-900">Arrastra tu comprobante aquí o haz clic para seleccionar</div>
                <p class="text-xs text-wood-500">Es obligatorio adjuntar la evidencia fotográfica del pago bancario para proceder.</p>
                <button type="button" class="px-4 py-2 bg-wood-200 hover:bg-wood-300 text-wood-800 text-xs font-bold rounded-xl transition-colors">
                  Seleccionar imagen
                </button>
              </div>
            } @else {
              <!-- Selected File Preview -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-wood-300">
                <div class="flex items-center gap-4">
                  <img [src]="filePreviewUrl" alt="Vista previa del comprobante" class="w-20 h-20 object-cover rounded-lg border border-wood-200">
                  <div class="text-left">
                    <div class="text-xs font-bold text-mate-900 truncate max-w-xs">{{ selectedFile.name }}</div>
                    <div class="text-2xs text-wood-500">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB • {{ selectedFile.type }}</div>
                    <span class="inline-block mt-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <i class="fa-solid fa-check"></i> Comprobante adjuntado listo
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button type="button" (click)="fileInput.click()" class="px-3 py-1.5 text-xs font-semibold text-mate-700 bg-mate-50 hover:bg-mate-100 rounded-lg border border-mate-200 transition-colors">
                    Cambiar
                  </button>
                  <button type="button" (click)="removeFile()" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        @if (errorMessage) {
          <div class="bg-red-50 text-red-800 p-4 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-2">
            <i class="fa-solid fa-circle-exclamation text-base"></i>
            <span>{{ errorMessage }}</span>
          </div>
        }

        <!-- Actions -->
        <div class="pt-4 flex justify-between items-center border-t border-wood-100">
          <a routerLink="/checkout" class="text-xs font-bold text-wood-700 hover:text-mate-700 flex items-center gap-1">
            <i class="fa-solid fa-arrow-left"></i> Volver a Datos
          </a>

          <button
            [disabled]="!selectedFile || submitting"
            (click)="submitOrder()"
            class="bg-mate-700 hover:bg-mate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold px-8 py-4 rounded-2xl text-base flex items-center gap-3 shadow-xl transition-all"
          >
            @if (submitting) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Procesando Pedido...</span>
            } @else {
              <i class="fa-solid fa-paper-plane"></i>
              <span>Enviar pedido</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class CheckoutPaymentFeatureComponent implements OnInit {
  private router = inject(Router);
  private apiService = inject(ApiService);
  cartService = inject(CartService);

  activeQr: PaymentQrConfig | null = null;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isDragging = false;
  submitting = false;
  errorMessage = '';

  ngOnInit() {
    this.apiService.getActivePaymentQr().subscribe((res) => (this.activeQr = res));
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      this.handleFile(e.target.files[0]);
    }
  }

  private handleFile(file: File) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      this.errorMessage = 'Formato no permitido. Por favor sube una imagen PNG, JPG o WEBP.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'El archivo supera el tamaño máximo permitido de 5 MB.';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.filePreviewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }

  submitOrder() {
    if (!this.selectedFile) {
      this.errorMessage = 'Es obligatorio adjuntar un comprobante de pago para enviar el pedido.';
      return;
    }

    const clientDataStr = sessionStorage.getItem('mate_checkout_client');
    if (!clientDataStr) {
      this.router.navigate(['/checkout']);
      return;
    }

    const clientData = JSON.parse(clientDataStr);

    const orderPayload = {
      ...clientData,
      items: this.cartService.items().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.submitting = true;
    this.errorMessage = '';

    this.apiService.createOrderWithProof(orderPayload, this.selectedFile).subscribe({
      next: (order) => {
        this.submitting = false;
        this.cartService.clearCart();
        sessionStorage.removeItem('mate_checkout_client');
        this.router.navigate(['/pedido', order.orderNumber]);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.error || 'Error al registrar el pedido. Intenta nuevamente.';
      }
    });
  }
}
