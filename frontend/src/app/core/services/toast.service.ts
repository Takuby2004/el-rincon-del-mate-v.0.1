import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number; // en milisegundos
  image?: string;
  badge?: string;
  time?: string;
}

export interface ToastOptions {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  image?: string;
  badge?: string;
  time?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastItem[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private counter = 0;

  show(options: ToastOptions): string {
    const id = `toast-${Date.now()}-${++this.counter}`;
    const duration = options.duration ?? 4500;
    const type = options.type ?? 'info';

    const item: ToastItem = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration,
      image: options.image,
      badge: options.badge,
      time: options.time
    };

    // Agregar el nuevo toast al inicio o al final (máximo 4 concurrentes)
    this.toastsSignal.update((current) => [...current.slice(-3), item]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  cartSuccess(productName: string, image?: string, duration: number = 3800): string {
    return this.show({
      type: 'success',
      badge: 'El Rincón del Mate • Carrito',
      time: 'Ahora',
      title: '¡Agregado al Carrito!',
      message: `Producto "${productName}" agregado con éxito`,
      image,
      duration
    });
  }

  success(message: string, title: string = '¡Operación Exitosa!', duration: number = 4000): string {
    return this.show({ message, title, type: 'success', duration });
  }

  error(message: string, title: string = 'Ocurrió un Error', duration: number = 6000): string {
    return this.show({ message, title, type: 'error', duration });
  }

  warning(message: string, title: string = 'Atención', duration: number = 5000): string {
    return this.show({ message, title, type: 'warning', duration });
  }

  info(message: string, title: string = 'Información', duration: number = 4500): string {
    return this.show({ message, title, type: 'info', duration });
  }

  dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
