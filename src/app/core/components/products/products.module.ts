import { NgModule } from '@angular/core'
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'
import { ProductsBlockComponent } from './products-block/products-block.component'
import { TranslateModule } from '@ngx-translate/core'
import { AtSharedModule } from 'src/app/@shared/@shared.module'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { ProductItemComponent } from './product-item/product-item.component'
import { CartComponentsModule } from '../cart/cart.module'
import { ProductPricesComponent } from './product-prices/product-prices.component'

@NgModule({
  declarations: [
    ProductsBlockComponent,
    ProductItemComponent,
    ProductPricesComponent
  ],
  imports: [
    CommonModule,
    AtSharedModule,
    RouterModule,
    CartComponentsModule,
    LocalizeRouterModule,
    TranslateModule.forChild()
  ],
  exports: [
    ProductsBlockComponent,
    ProductItemComponent,
    ProductPricesComponent
  ],
  providers: [
    CurrencyPipe,
    DatePipe
  ]
})
export class ProductComponentsModule { }
