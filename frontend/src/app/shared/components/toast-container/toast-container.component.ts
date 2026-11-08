import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService, ToastItem } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check text-emerald-400';
      case 'error':
        return 'fa-solid fa-circle-exclamation text-red-400';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation text-amber-400';
      case 'info':
      default:
        return 'fa-solid fa-circle-info text-sky-400';
    }
  }

  getBorderClass(type: string): string {
    switch (type) {
      case 'success':
        return 'border-wood-500/50 text-wood-50 shadow-wood-950/60 shadow-2xl';
      case 'error':
        return 'border-red-500/40 text-red-50 shadow-red-950/50 shadow-2xl';
      case 'warning':
        return 'border-amber-500/40 text-amber-50 shadow-amber-950/50 shadow-2xl';
      case 'info':
      default:
        return 'border-sky-500/40 text-sky-50 shadow-sky-950/50 shadow-2xl';
    }
  }

  getProgressBarClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-wood-500 to-wood-300';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-sky-500';
    }
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}
