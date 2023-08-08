import { NgModule } from '@angular/core'
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'
import { ProductPageComponent } from './product-page.component'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from 'src/app/core/components/components.module'
import { TranslateModule } from '@ngx-translate/core'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { CartComponentsModule } from 'src/app/core/components/cart/cart.module'
import { ProductComponentsModule } from 'src/app/core/components/products/products.module'
import { DirectivesModule } from 'src/app/core/directives/directives.module'
import { NgMathPipesModule } from 'ngx-pipes'
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    ProductPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    CartComponentsModule,
    DirectivesModule,
    ProductComponentsModule,
    FormsModule,
    TranslateModule.forChild(),
    NgMathPipesModule,
    LocalizeRouterModule,
    RouterModule.forChild([{
      path: '',
      component: ProductPageComponent
    }])
  ], providers: [
    CurrencyPipe,
    DatePipe
  ]
})
export class ProductPageModule { }
