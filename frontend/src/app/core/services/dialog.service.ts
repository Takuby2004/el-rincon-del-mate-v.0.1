import { Injectable, signal } from '@angular/core';

export interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
  mode?: 'confirm' | 'alert';
}

export interface DialogState extends DialogOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogStateSignal = signal<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    mode: 'confirm'
  });

  readonly dialogState = this.dialogStateSignal.asReadonly();

  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogStateSignal.set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Confirmar',
        cancelText: options.cancelText ?? 'Cancelar',
        type: options.type ?? 'danger',
        icon: options.icon,
        mode: 'confirm',
        resolve
      });
    });
  }

  alert(options: Omit<DialogOptions, 'cancelText' | 'mode'>): Promise<void> {
    return new Promise<void>((resolve) => {
      this.dialogStateSignal.set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Entendido',
        type: options.type ?? 'info',
        icon: options.icon,
        mode: 'alert',
        resolve: () => resolve()
      });
    });
  }

  handleConfirm() {
    const current = this.dialogStateSignal();
    if (current.resolve) {
      current.resolve(true);
    }
    this.close();
  }

  handleCancel() {
    const current = this.dialogStateSignal();
    if (current.resolve) {
      current.resolve(false);
    }
    this.close();
  }

  private close() {
    this.dialogStateSignal.update((state) => ({
      ...state,
      isOpen: false,
      resolve: undefined
    }));
  }
}
