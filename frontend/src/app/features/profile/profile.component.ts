import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-admin-profile',
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class AdminProfileFeatureComponent implements OnInit {
  private authService = inject(AuthService);

  formData = {
    email: '',
    password: ''
  };
  successMessage = '';
  errorMessage = '';
  isSaving = false;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.formData.email = user.email;
    }
  }

  updateProfile() {
    this.successMessage = '';
    this.errorMessage = '';

    const cleanEmail = this.formData.email.trim();
    if (!cleanEmail) {
      this.errorMessage = 'El correo electrónico es obligatorio.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      this.errorMessage = 'Ingresa un formato de correo electrónico válido (ej: usuario@ejemplo.com).';
      return;
    }

    if (this.formData.password && this.formData.password.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener un mínimo de 6 caracteres.';
      return;
    }

    this.isSaving = true;
    const payload: { email: string; password?: string } = {
      email: cleanEmail
    };

    if (this.formData.password && this.formData.password.trim() !== '') {
      payload.password = this.formData.password.trim();
    }

    this.authService.updateProfile(payload).subscribe({
      next: (updatedUser: any) => {
        this.isSaving = false;
        this.successMessage = 'Perfil y credenciales actualizados exitosamente en el sistema y en Supabase.';
        this.formData.password = '';
        if (updatedUser?.email) {
          this.formData.email = updatedUser.email;
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage = err.error?.error || 'Error al actualizar el perfil. Verifique su conexión.';
      }
    });
  }
}
