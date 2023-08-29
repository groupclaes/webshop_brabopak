import { NgModule } from '@angular/core'
import { NoPreloading, RouterModule, Routes } from '@angular/router'
import { authGuard } from './auth/auth.guard'

const layout = 'ecommerce'

export const routes: Routes = [{
  path: '',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  canActivate: [authGuard],
  data: {
    layout
  }
}, {
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  data: {
    layout
  }
}, {
  path: 'cart',
  loadChildren: () => import('./pages/cart/cart-page.module').then(m => m.CartPageModule),
  canActivate: [authGuard],
  data: {
    layout
  }
}, {
  path: 'cart/history',
  loadChildren: () => import('./pages/cart/cart-history/cart-history-page.module').then(m => m.CartHistoryPageModule),
  canActivate: [authGuard],
  data: {
    layout
  }
}, {
  path: 'cart/history/:id',
  loadChildren: () => import('./pages/cart/cart-history/cart-detail/cart-detail-page.module').then(m => m.CartDetailPageModule),
  canActivate: [authGuard],
  data: {
    layout
  }
}, {
  path: 'cart/copy',
  loadChildren: () => import('./pages/cart/cart-copy/cart-copy-page.module').then(m => m.CartCopyPageModule),
  canActivate: [authGuard],
  data: {
    layout
  }
}, {
  path: 'products',
  loadChildren: () => import('./pages/products/products-page.module').then(m => m.ProductsPageModule),
  data: {
    layout
  }
}, {
  path: 'product/:id/:name',
  loadChildren: () => import('./pages/product/product-page.module').then(m => m.ProductPageModule),
  data: {
    layout
  }
}, {
  path: '**',
  redirectTo: '/'
}]

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: NoPreloading,
    initialNavigation: 'enabledNonBlocking',
    onSameUrlNavigation: 'reload',
    scrollPositionRestoration: 'enabled',
    // enableTracing: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
