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

  email = 'admin@elrincondelmate.com';
  password = '';
  loading = false;
  errorMessage = '';

  login() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Error al iniciar sesión. Verifique sus datos.';
      }
    });
  }
}
