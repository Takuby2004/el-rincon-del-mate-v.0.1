import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DialogService } from '../../core/services/dialog.service';
import { PaymentQrConfig } from '../../core/models/models';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-payment-qr-config',
    imports: [CommonModule, AssetUrlPipe, ImgFallbackDirective],
    templateUrl: './payment-qr-config.component.html',
    styleUrl: './payment-qr-config.component.css'
})
export class AdminPaymentQrConfigFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialogService = inject(DialogService);

  activeQr: PaymentQrConfig | null = null;
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  uploading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.loadActiveQr();
  }

  loadActiveQr() {
    this.apiService.getActivePaymentQr().subscribe({
      next: (res) => (this.activeQr = res),
      error: () => (this.activeQr = null)
    });
  }

  onFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      if (!validTypes.includes(file.type.toLowerCase())) {
        this.errorMessage = 'Formato no permitido. Sube una imagen PNG, JPG o WEBP.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo no debe exceder 5 MB.';
        return;
      }

      this.errorMessage = '';
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => (this.filePreviewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }

  uploadQr() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.uploadPaymentQr(this.selectedFile).subscribe({
      next: (res) => {
        this.uploading = false;
        this.successMessage = 'Código QR de pago actualizado y activado correctamente.';
        this.removeSelectedFile();
        this.loadActiveQr();
      },
      error: (err) => {
        this.uploading = false;
        this.errorMessage = err.error?.error || 'Error al subir la imagen del QR.';
      }
    });
  }

  async deactivateQr(id: string) {
    const confirmed = await this.dialogService.confirm({
      title: '¿Desactivar Código QR?',
      message: '¿Deseas desactivar este QR de pago?\nLos clientes no verán ningún QR activo durante la finalización de compra hasta que actives uno nuevo.',
      confirmText: 'Sí, desactivar',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: 'fa-solid fa-qrcode'
    });

    if (confirmed) {
      this.apiService.deactivatePaymentQr(id).subscribe(() => {
        this.loadActiveQr();
      });
    }
  }
}
