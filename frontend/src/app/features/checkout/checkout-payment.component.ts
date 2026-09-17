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
  templateUrl: './checkout-payment.component.html',
  styleUrl: './checkout-payment.component.css'
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
