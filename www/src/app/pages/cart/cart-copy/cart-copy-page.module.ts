import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CartCopyPageComponent } from './cart-copy-page.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [
    CartCopyPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: CartCopyPageComponent
    }])
  ]
})
export class CartCopyPageModule { }