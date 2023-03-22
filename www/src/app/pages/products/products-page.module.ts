import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProductsPageComponent } from './products-page.component'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductsModule } from 'src/app/core/components/products/products.module'

@NgModule({
  declarations: [
    ProductsPageComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    LocalizeRouterModule,
    ProductsModule,
    RouterModule.forChild([{
      path: '',
      component: ProductsPageComponent
    }])
  ]
})
export class ProductsPageModule { }
