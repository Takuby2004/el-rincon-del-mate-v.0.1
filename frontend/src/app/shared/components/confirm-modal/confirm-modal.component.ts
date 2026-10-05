import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  dialogService = inject(DialogService);

  get state() {
    return this.dialogService.dialogState();
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.state.isOpen) {
      this.dialogService.handleCancel();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('backdrop-container')) {
      this.dialogService.handleCancel();
    }
  }
}
