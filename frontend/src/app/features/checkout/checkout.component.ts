import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutDataFeatureComponent {
  private router = inject(Router);
  cartService = inject(CartService);

  clientData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: 'Santa Cruz',
    clientCiNit: '',
    notes: ''
  };

  isValid(): boolean {
    return !!(this.clientData.clientName && this.clientData.clientEmail && this.clientData.clientPhone && this.clientData.clientAddress);
  }

  proceedToPayment() {
    if (this.isValid()) {
      sessionStorage.setItem('mate_checkout_client', JSON.stringify(this.clientData));
      this.router.navigate(['/checkout/pago']);
    }
  }
}
