import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartCopyPageComponent } from './cart-copy-page.component'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from 'src/app/core/components/components.module'
import { TranslateModule } from '@ngx-translate/core'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    CartCopyPageComponent
  ],
  imports: [
    CommonModule,
    CoreComponentsModule,
    TranslateModule.forChild(),
    LocalizeRouterModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      path: '',
      component: CartCopyPageComponent
    }])
  ]
})
export class CartCopyPageModule { }