import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout.component';

import { HomeFeatureComponent } from './features/home/home.component';
import { ProductsFeatureComponent } from './features/products/products.component';
import { ProductDetailFeatureComponent } from './features/products/product-detail.component';
import { CategoriesFeatureComponent } from './features/categories/categories.component';
import { CartFeatureComponent } from './features/cart/cart.component';
import { CheckoutDataFeatureComponent } from './features/checkout/checkout.component';
import { CheckoutPaymentFeatureComponent } from './features/checkout/checkout-payment.component';
import { OrderDetailFeatureComponent } from './features/orders/order-detail.component';

import { AdminLoginFeatureComponent } from './features/auth/admin-login.component';
import { AdminDashboardFeatureComponent } from './features/dashboard/dashboard.component';
import { AdminProductsFeatureComponent } from './features/admin-products/admin-products.component';
import { AdminCategoriesFeatureComponent } from './features/admin-categories/admin-categories.component';
import { AdminClientsFeatureComponent } from './features/admin-clients/admin-clients.component';
import { AdminOrdersFeatureComponent } from './features/admin-orders/admin-orders.component';
import { AdminReportsFeatureComponent } from './features/reports/reports.component';
import { AdminPaymentQrConfigFeatureComponent } from './features/payment-qr-config/payment-qr-config.component';
import { AdminProfileFeatureComponent } from './features/profile/profile.component';

import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Store Navigation
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeFeatureComponent },
      { path: 'productos', component: ProductsFeatureComponent },
      { path: 'productos/:slug', component: ProductDetailFeatureComponent },
      { path: 'categorias', component: CategoriesFeatureComponent },
      { path: 'categorias/:slug', component: CategoriesFeatureComponent },
      { path: 'carrito', component: CartFeatureComponent },
      { path: 'checkout', component: CheckoutDataFeatureComponent },
      { path: 'checkout/pago', component: CheckoutPaymentFeatureComponent },
      { path: 'pedido/:orderNumber', component: OrderDetailFeatureComponent }
    ]
  },

  // Admin Auth
  { path: 'admin/login', component: AdminLoginFeatureComponent },

  // Admin Panel Protected Area
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardFeatureComponent },
      { path: 'productos', component: AdminProductsFeatureComponent },
      { path: 'categorias', component: AdminCategoriesFeatureComponent },
      { path: 'clientes', component: AdminClientsFeatureComponent },
      { path: 'pedidos', component: AdminOrdersFeatureComponent },
      { path: 'pedidos/:id', component: AdminOrdersFeatureComponent },
      { path: 'estadisticas', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'reportes', component: AdminReportsFeatureComponent },
      { path: 'configuracion/pago-qr', component: AdminPaymentQrConfigFeatureComponent },
      { path: 'perfil', component: AdminProfileFeatureComponent }
    ]
  },

  // Wildcard fallback
  { path: '**', redirectTo: '' }
];
