import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product, Order, PaymentQrConfig, DashboardStats, Client } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Products
  getProducts(filters?: { categoryId?: string; search?: string; activeOnly?: boolean }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.activeOnly) params = params.set('activeOnly', 'true');
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${slug}`);
  }

  createProduct(data: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: string, data: any): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${slug}`);
  }

  createCategory(data: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // Payment QR Config (Owner)
  getActivePaymentQr(): Observable<PaymentQrConfig> {
    return this.http.get<PaymentQrConfig>(`${this.apiUrl}/payment-qr`);
  }

  getAllPaymentQrs(): Observable<PaymentQrConfig[]> {
    return this.http.get<PaymentQrConfig[]>(`${this.apiUrl}/payment-qr/admin`);
  }

  uploadPaymentQr(file: File): Observable<PaymentQrConfig> {
    const formData = new FormData();
    formData.append('qrImage', file);
    return this.http.post<PaymentQrConfig>(`${this.apiUrl}/payment-qr/admin`, formData);
  }

  deactivatePaymentQr(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/payment-qr/admin/${id}`);
  }

  // Orders & Payment Proof Upload
  createOrderWithProof(orderData: any, proofFile: File): Observable<Order> {
    const formData = new FormData();
    formData.append('orderData', JSON.stringify(orderData));
    formData.append('paymentProof', proofFile);
    return this.http.post<Order>(`${this.apiUrl}/orders`, formData);
  }

  getOrders(filters?: { status?: string; paymentStatus?: string; search?: string }): Observable<Order[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { params });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  approvePayment(paymentId: string, notifyEmail: boolean = true): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/payments/${paymentId}/approve`, { notifyEmail });
  }

  rejectPayment(paymentId: string, rejectionReason: string, notifyEmail: boolean = true): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/payments/${paymentId}/reject`, { rejectionReason, notifyEmail });
  }

  sendPaymentEmailNotification(paymentId: string, status?: string, message?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/payments/${paymentId}/notify-email`, { status, message });
  }

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(data: any): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, data);
  }

  updateClient(id: string, data: any): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}`, data);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`);
  }

  // Stats & Reports
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/admin/statistics`);
  }

  downloadOrderPdf(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/reports/orders/${orderId}/pdf`, { responseType: 'blob' });
  }

  downloadSalesReportPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/reports/sales/pdf`, { responseType: 'blob' });
  }
}
