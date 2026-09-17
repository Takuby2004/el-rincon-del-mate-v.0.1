import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';

@Component({
    selector: 'app-admin-statistics',
    imports: [CommonModule],
    templateUrl: './statistics.component.html',
    styleUrl: './statistics.component.css'
})
export class AdminStatisticsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  stats: DashboardStats | null = null;

  ngOnInit() {
    this.apiService.getDashboardStats().subscribe((res) => (this.stats = res));
  }
}
