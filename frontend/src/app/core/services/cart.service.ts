import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/models';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public items = signal<CartItem[]>(this.loadCart());

  public totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  public totalPrice = computed(() => {
    return this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  constructor() {}

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('mate_cart');
    return saved ? JSON.parse(saved) : [];
  }

  private saveCart() {
    localStorage.setItem('mate_cart', JSON.stringify(this.items()));
  }

  public addItem(product: Product, quantity: number = 1) {
    const current = [...this.items()];
    const existingIndex = current.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
    } else {
      current.push({ product, quantity });
    }

    this.items.set(current);
    this.saveCart();
  }

  public updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const current = this.items().map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    this.items.set(current);
    this.saveCart();
  }

  public removeItem(productId: string) {
    const current = this.items().filter((item) => item.product.id !== productId);
    this.items.set(current);
    this.saveCart();
  }

  public clearCart() {
    this.items.set([]);
    localStorage.removeItem('mate_cart');
  }
}
