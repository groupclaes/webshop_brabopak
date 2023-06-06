import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartPageComponent } from './cart-page.component'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'
import { ReactiveFormsModule } from '@angular/forms'
import { PipesModule } from 'src/app/core/pipes/pipes.module'
import { CartComponentsModule } from 'src/app/core/components/cart/cart.module'

@NgModule({
  declarations: [
    CartPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    LocalizeRouterModule,
    PipesModule,
    CartComponentsModule,
    RouterModule.forChild([{
      path: '',
      component: CartPageComponent
    }])
  ]
})
export class CartPageModule { }
