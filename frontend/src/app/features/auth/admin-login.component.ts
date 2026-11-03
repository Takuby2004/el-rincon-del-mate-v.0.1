import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-login.component.html',
    styleUrl: './admin-login.component.css'
})
export class AdminLoginFeatureComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  login() {
    this.loading = true;
    this.errorMessage = '';

    const cleanEmail = this.email.trim();
    const cleanPassword = this.password.trim();

    this.authService.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user?.role !== 'ADMIN') {
          this.errorMessage = 'Acceso restringido: Esta cuenta no posee privilegios de administrador.';
          return;
        }
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Error al iniciar sesión. Verifique sus credenciales.';
      }
    });
  }
}
