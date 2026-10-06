export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  clientProfile?: Client;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  ciNit?: string;
  createdAt?: string;
  _count?: { orders: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  qrCodeUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  subtotal: number;
}

export interface PaymentProof {
  id: string;
  imageUrl: string;
  originalFileName: string;
  mimeType: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'QR';
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  paymentProof?: PaymentProof;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  client?: Client;
  subtotal: number;
  total: number;
  status: 'PENDING_PAYMENT_VERIFICATION' | 'PAID' | 'PACKING' | 'SHIPPED' | 'DELIVERED' | 'PAYMENT_REJECTED' | 'CANCELLED' | string;
  paymentStatus: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  address: string;
  city: string;
  phone: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface PaymentQrConfig {
  id: string;
  imageUrl: string;
  fileName?: string;
  mimeType?: string;
  active: boolean;
  updatedAt?: string;
}

export interface DashboardStats {
  metrics: {
    pendingVerificationCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    profitMarginPercentage?: number;
  };
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
  demandForecast: {
    averageDailyDemand: number;
    projectedDemandNextMonth: number;
  };
  orderDistribution?: { range: string; count: number; percentage: number }[];
  dailySalesHistory?: { date: string; label: string; count: number; total: number }[];
}
