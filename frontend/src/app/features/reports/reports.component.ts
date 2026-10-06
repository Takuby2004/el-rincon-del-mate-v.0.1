import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

export type ReportType = 'sales' | 'costs' | 'profits' | 'demand';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class AdminReportsFeatureComponent implements OnDestroy {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private sanitizer = inject(DomSanitizer);

  // Período temporal seleccionado por defecto: Todo el Histórico
  selectedDays: '7' | '30' | 'all' = 'all';

  // Estados de carga independientes por tarjeta (descarga directa)
  loadingSales = false;
  loadingCosts = false;
  loadingProfits = false;
  loadingDemand = false;

  // Estado del Modal de Previsualización
  previewModalOpen = false;
  loadingPreview: ReportType | null = null;
  previewTitle = '';
  previewSubtitle = '';
  previewPdfUrl: SafeResourceUrl | null = null;
  rawPreviewBlobUrl: string | null = null;
  currentPreviewBlob: Blob | null = null;
  currentPreviewFilename = '';

  ngOnDestroy(): void {
    this.cleanupPreview();
  }

  @HostListener('window:keydown.escape')
  handleEscapeKey(): void {
    if (this.previewModalOpen) {
      this.closePreviewModal();
    }
  }

  setPeriod(period: '7' | '30' | 'all'): void {
    this.selectedDays = period;
  }

  getPeriodLabel(): string {
    switch (this.selectedDays) {
      case '7':
        return 'Últimos 7 días';
      case '30':
        return 'Últimos 30 días';
      default:
        return 'Histórico Completo';
    }
  }

  // ==========================================
  // PREVISUALIZACIÓN EN MODAL VISOR
  // ==========================================
  previewReport(type: ReportType): void {
    if (this.loadingPreview) return;
    this.loadingPreview = type;

    let requestObservable;
    let title = '';
    let filenamePrefix = '';

    switch (type) {
      case 'sales':
        requestObservable = this.apiService.downloadSalesReportPdf(this.selectedDays);
        title = 'Reporte Oficial de Ventas (Pagos Aprobados)';
        filenamePrefix = 'reporte-ventas';
        break;
      case 'costs':
        requestObservable = this.apiService.downloadCostReportPdf(this.selectedDays);
        title = 'Reporte Oficial de Costos e Inventario';
        filenamePrefix = 'reporte-costos';
        break;
      case 'profits':
        requestObservable = this.apiService.downloadProfitReportPdf(this.selectedDays);
        title = 'Reporte Oficial de Ganancias y Rentabilidad Neta';
        filenamePrefix = 'reporte-ganancias';
        break;
      case 'demand':
        requestObservable = this.apiService.downloadDemandReportPdf(this.selectedDays);
        title = 'Reporte Oficial de Demanda y Rotación de Stock';
        filenamePrefix = 'reporte-demandas';
        break;
    }

    requestObservable.subscribe({
      next: (blob) => {
        this.cleanupPreview();
        this.currentPreviewBlob = blob;
        this.rawPreviewBlobUrl = window.URL.createObjectURL(blob);
        this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPreviewBlobUrl);
        this.previewTitle = title;
        this.previewSubtitle = `Período: ${this.getPeriodLabel()} · Formato Horizontal (A4)`;
        this.currentPreviewFilename = `${filenamePrefix}-${this.selectedDays}-${Date.now()}.pdf`;
        this.previewModalOpen = true;
        this.loadingPreview = null;
      },
      error: (err) => {
        console.error('Error al generar previsualización del reporte:', err);
        this.toastService.error('No se pudo generar la previsualización del reporte.', 'Error');
        this.loadingPreview = null;
      }
    });
  }

  closePreviewModal(): void {
    this.previewModalOpen = false;
    this.cleanupPreview();
  }

  downloadFromPreview(): void {
    if (this.currentPreviewBlob) {
      this.triggerFileDownload(this.currentPreviewBlob, this.currentPreviewFilename);
      this.toastService.success('Reporte descargado exitosamente.', 'Descarga Completa');
    }
  }

  openPreviewInNewTab(): void {
    if (this.rawPreviewBlobUrl) {
      window.open(this.rawPreviewBlobUrl, '_blank');
    }
  }

  private cleanupPreview(): void {
    if (this.rawPreviewBlobUrl) {
      window.URL.revokeObjectURL(this.rawPreviewBlobUrl);
      this.rawPreviewBlobUrl = null;
    }
    this.previewPdfUrl = null;
    this.currentPreviewBlob = null;
  }

  // ==========================================
  // DESCARGA DIRECTA (SIN PREVISUALIZAR)
  // ==========================================
  downloadSalesReport(): void {
    if (this.loadingSales) return;
    this.loadingSales = true;

    this.apiService.downloadSalesReportPdf(this.selectedDays).subscribe({
      next: (blob) => {
        this.triggerFileDownload(blob, `reporte-ventas-${this.selectedDays}-${Date.now()}.pdf`);
        this.toastService.success('Reporte de Ventas generado y descargado correctamente', 'Descarga Exitosa');
        this.loadingSales = false;
      },
      error: (err) => {
        console.error('Error al generar reporte de ventas:', err);
        this.toastService.error('No se pudo generar el reporte de ventas.', 'Error');
        this.loadingSales = false;
      }
    });
  }

  downloadCostReport(): void {
    if (this.loadingCosts) return;
    this.loadingCosts = true;

    this.apiService.downloadCostReportPdf(this.selectedDays).subscribe({
      next: (blob) => {
        this.triggerFileDownload(blob, `reporte-costos-${this.selectedDays}-${Date.now()}.pdf`);
        this.toastService.success('Reporte de Costos generado y descargado correctamente', 'Descarga Exitosa');
        this.loadingCosts = false;
      },
      error: (err) => {
        console.error('Error al generar reporte de costos:', err);
        this.toastService.error('No se pudo generar el reporte de costos.', 'Error');
        this.loadingCosts = false;
      }
    });
  }

  downloadProfitReport(): void {
    if (this.loadingProfits) return;
    this.loadingProfits = true;

    this.apiService.downloadProfitReportPdf(this.selectedDays).subscribe({
      next: (blob) => {
        this.triggerFileDownload(blob, `reporte-ganancias-${this.selectedDays}-${Date.now()}.pdf`);
        this.toastService.success('Reporte de Ganancias generado y descargado correctamente', 'Descarga Exitosa');
        this.loadingProfits = false;
      },
      error: (err) => {
        console.error('Error al generar reporte de ganancias:', err);
        this.toastService.error('No se pudo generar el reporte de ganancias.', 'Error');
        this.loadingProfits = false;
      }
    });
  }

  downloadDemandReport(): void {
    if (this.loadingDemand) return;
    this.loadingDemand = true;

    this.apiService.downloadDemandReportPdf(this.selectedDays).subscribe({
      next: (blob) => {
        this.triggerFileDownload(blob, `reporte-demandas-${this.selectedDays}-${Date.now()}.pdf`);
        this.toastService.success('Reporte de Demandas generado y descargado correctamente', 'Descarga Exitosa');
        this.loadingDemand = false;
      },
      error: (err) => {
        console.error('Error al generar reporte de demandas:', err);
        this.toastService.error('No se pudo generar el reporte de demandas.', 'Error');
        this.loadingDemand = false;
      }
    });
  }

  private triggerFileDownload(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
