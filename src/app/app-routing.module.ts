import { NgModule } from '@angular/core'
import { NoPreloading, RouterModule, Routes } from '@angular/router'
import { authGuard } from './auth/auth.guard'

const layout = 'ecommerce'

export const routes: Routes = [{
  path: '',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  canActivate: [authGuard],
  data: {
    layout,
    title: 'pages.home.title',
    description: 'pages.home.description'
  }
}, {
  path: 'auth/sign-in',
  loadChildren: () => import('./auth/signin/signin-page.module').then(m => m.SigninPageModule),
  data: {
    title: 'pages.signin.title',
    description: 'pages.signin.description'
  }
},
{
  path: 'auth/sign-on',
  loadChildren: () => import('./auth/signon/signon-page.module').then(m => m.SignonPageModule),
  data: {
    title: 'pages.signon.title',
    description: 'pages.signon.description'
  }
},
{
  path: 'auth/sign-up',
  loadChildren: () => import('./auth/signup/signup-page.module').then(m => m.SignupPageModule),
  data: {
    title: 'pages.signup.title',
    description: 'pages.signup.description'
  }
},
{
  path: 'auth/reset-password',
  loadChildren: () => import('./auth/reset-password/reset-password-page.module').then(m => m.ResetPasswordPageModule),
  data: {
    title: 'pages.reset-password.title',
    description: 'pages.reset-password.description'
  }
},
{
  path: 'auth/forgot-password',
  loadChildren: () => import('./auth/forgot-password/forgot-password-page.module').then(m => m.ForgotPasswordPageModule),
  data: {
    title: 'pages.forgot-password.title',
    description: 'pages.forgot-password.description'
  }
}, {
  path: 'cart',
  loadChildren: () => import('./pages/cart/cart-page.module').then(m => m.CartPageModule),
  canActivate: [authGuard],
  data: {
    layout,
    title: 'pages.cart.title',
    description: 'pages.cart.description'
  }
}, {
  path: 'cart/history',
  loadChildren: () => import('./pages/cart/cart-history/cart-history-page.module').then(m => m.CartHistoryPageModule),
  canActivate: [authGuard],
  data: {
    layout,
    title: 'pages.cart-history.title',
    description: 'pages.cart-history.description'
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
    layout,
    title: 'pages.leaflet.title',
    description: 'pages.leaflet.description'
  }
}, {
  path: 'products',
  loadChildren: () => import('./pages/products/products-page.module').then(m => m.ProductsPageModule),
  data: {
    layout,
    title: 'pages.products.title',
    description: 'pages.products.description'
  }
}, {
  path: 'product/:id/:name',
  loadChildren: () => import('./pages/product/product-page.module').then(m => m.ProductPageModule),
  data: {
    layout,
    // title: 'pages.products.title',
    // description: 'pages.products.description'
  }
}, {
  path: 'legal/privacy-policy',
  loadChildren: () => import('./pages/legal/privacy-policy/privacy-policy-page.module').then(m => m.PrivacyPolicyPageModule),
  data: {
    layout,
    hidePolicy: true
  }
}, {
  path: 'legal/terms-and-conditions',
  loadChildren: () => import('./pages/legal/terms-and-conditions/terms-and-conditions-page.module').then(m => m.TermsAndConditionsPageModule),
  data: {
    layout
  }
}, {
  path: 'terms-and-conditions',
  redirectTo: '/legal/terms-and-conditions'
}, {
  path: 'sales-terms',
  redirectTo: '/legal/terms-and-conditions'
}, {
  path: 'privacy-policy',
  redirectTo: '/legal/privacy-policy'
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
