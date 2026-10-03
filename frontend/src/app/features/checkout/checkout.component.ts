import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-checkout',
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css'
})
export class CheckoutDataFeatureComponent {
  private router = inject(Router);
  cartService = inject(CartService);

  // Lista oficial de los 9 departamentos de Bolivia
  readonly boliviaDepartments = [
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija'
  ];

  clientData = {
    firstName: '',
    lastNamePaterno: '',
    lastNameMaterno: '',
    clientEmail: '',
    clientPhone: '',
    clientCiNit: '',
    clientDepartment: 'Tarija',
    clientCity: '',
    clientAddress: '',
    notes: ''
  };

  /**
   * Filtra la entrada para que únicamente acepte dígitos numéricos (0-9)
   */
  onNumericInput(field: 'clientPhone' | 'clientCiNit') {
    this.clientData[field] = this.clientData[field].replace(/\D/g, '');
  }

  isValid(): boolean {
    return !!(
      this.clientData.firstName.trim() &&
      this.clientData.lastNamePaterno.trim() &&
      this.clientData.clientEmail.trim() &&
      this.clientData.clientPhone.trim() &&
      this.clientData.clientDepartment &&
      this.clientData.clientCity.trim() &&
      this.clientData.clientAddress.trim()
    );
  }

  proceedToPayment() {
    if (this.isValid()) {
      // Unifica nombres y apellidos de forma limpia para compatibilidad con la base de datos
      const fullName = [
        this.clientData.firstName.trim(),
        this.clientData.lastNamePaterno.trim(),
        this.clientData.lastNameMaterno.trim()
      ]
        .filter(Boolean)
        .join(' ');

      const formattedCity = this.clientData.clientDepartment === this.clientData.clientCity.trim()
        ? this.clientData.clientCity.trim()
        : `${this.clientData.clientCity.trim()}, ${this.clientData.clientDepartment}`;

      const checkoutPayload = {
        ...this.clientData,
        clientName: fullName,
        clientCity: formattedCity
      };

      sessionStorage.setItem('mate_checkout_client', JSON.stringify(checkoutPayload));
      this.router.navigate(['/checkout/pago']);
    }
  }
}

