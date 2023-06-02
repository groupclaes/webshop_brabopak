import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartButtonComponent } from './cart-button/cart-button.component'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    CartButtonComponent
  ],
  exports: [
    CartButtonComponent
  ],
  imports: [
    TranslateModule.forChild(),
    CommonModule,
    FormsModule
  ]
})
export class CartComponentsModule { }