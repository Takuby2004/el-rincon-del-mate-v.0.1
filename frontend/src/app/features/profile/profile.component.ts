import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
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

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.formData.email = user.email;
    }
  }

  updateProfile() {
    this.authService.updateProfile({ password: this.formData.password }).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado correctamente.';
        this.formData.password = '';
      }
    });
  }
}
