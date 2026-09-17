import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models/models';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.css'
})
export class AdminClientsFeatureComponent implements OnInit {
  private apiService = inject(ApiService);
  clients: Client[] = [];

  ngOnInit() {
    this.apiService.getClients().subscribe((res) => (this.clients = res));
  }
}
