import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProductsPageComponent } from './products-page.component'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductComponentsModule } from 'src/app/core/components/products/products.module'
import { CoreComponentsModule } from 'src/app/core/components/components.module'

@NgModule({
  declarations: [
    ProductsPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    TranslateModule.forChild(),
    LocalizeRouterModule,
    ProductComponentsModule,
    RouterModule.forChild([{
      path: '',
      component: ProductsPageComponent
    }, {
      path: ':category',
      component: ProductsPageComponent
    }, {
      path: ':category/:category2',
      component: ProductsPageComponent
    }, {
      path: ':category/:category2/:category3',
      component: ProductsPageComponent
    }])
  ]
})
export class ProductsPageModule { }
