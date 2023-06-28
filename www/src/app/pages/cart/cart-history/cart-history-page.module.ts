import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartHistoryPageComponent } from './cart-history-page.component'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { CoreComponentsModule } from 'src/app/core/components/components.module'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'

@NgModule({
  declarations: [
    CartHistoryPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    LocalizeRouterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: CartHistoryPageComponent
    }])
  ]
})
export class CartHistoryPageModule { }
