import { NgModule } from '@angular/core'
import { NoPreloading, RouterModule, Routes } from '@angular/router'

const layout = 'ecommerce'

export const routes: Routes = [{
  path: '',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  data: {
    layout
  }
}, {
  path: 'material',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  data: {
    layout: 'material'
  }
}, {
  path: 'modern',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  data: {
    layout: 'modern'
  }
}, {
  path: 'centered',
  loadChildren: () => import('./pages/home/home-page.module').then(m => m.HomePageModule),
  data: {
    layout: 'centered'
  }
}, {
  path: 'products',
  loadChildren: () => import('./pages/products/products-page.module').then(m => m.ProductsPageModule),
  data: {
    layout
  }
}, {
  path: 'products/:category',
  loadChildren: () => import('./pages/products/products-page.module').then(m => m.ProductsPageModule),
  data: {
    layout
  }
}, {
  path: 'products/:category/:category2',
  loadChildren: () => import('./pages/products/products-page.module').then(m => m.ProductsPageModule),
  data: {
    layout
  }
}, {
  path: 'products/:category/:category2/:category3',
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
