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
  path: 'auth/sign-in',
  loadChildren: () => import('./auth/signin/signin-page.module').then(m => m.SigninPageModule)
},
{
  path: 'auth/sign-on',
  loadChildren: () => import('./auth/signon/signon-page.module').then(m => m.SignonPageModule)
},
{
  path: 'auth/sign-up',
  loadChildren: () => import('./auth/signup/signup-page.module').then(m => m.SignupPageModule)
},
{
  path: 'auth/reset-password',
  loadChildren: () => import('./auth/reset-password/reset-password-page.module').then(m => m.ResetPasswordPageModule)
},
{
  path: 'auth/forgot-password',
  loadChildren: () => import('./auth/forgot-password/forgot-password-page.module').then(m => m.ForgotPasswordPageModule)
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
  path: 'leaflet',
  loadChildren: () => import('./pages/leaflet/leaflet-page.module').then(m => m.LeafletPageModule),
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
