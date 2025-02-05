import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartPageComponent } from './cart-page.component'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'
import { ReactiveFormsModule } from '@angular/forms'
import { PipesModule } from 'src/app/core/pipes/pipes.module'
import { CartComponentsModule } from 'src/app/core/components/cart/cart.module'
import { CoreComponentsModule } from 'src/app/core/components/components.module'

import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatMomentDateModule } from '@angular/material-moment-adapter'

@NgModule({
  declarations: [
    CartPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatMomentDateModule,
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
