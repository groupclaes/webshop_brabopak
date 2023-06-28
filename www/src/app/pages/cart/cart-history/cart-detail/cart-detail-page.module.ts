import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { CartDetailPageComponent } from './cart-detail-page.component'
import { TranslateModule } from '@ngx-translate/core'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'

@NgModule({
  declarations: [
    CartDetailPageComponent
  ],
  imports: [
    CommonModule,
    LocalizeRouterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: CartDetailPageComponent
    }])
  ]
})
export class CartDetailPageModule { }
