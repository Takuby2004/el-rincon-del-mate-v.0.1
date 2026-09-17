import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class AdminReportsFeatureComponent {
  private apiService = inject(ApiService);

  downloadSalesReport() {
    this.apiService.downloadSalesReportPdf().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ventas-oficial-${Date.now()}.pdf`;
      a.click();
    });
  }
}
