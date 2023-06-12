import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AlertModalComponent } from './alert-modal/alert-modal.component'
import { SuccessModalComponent } from './success-modal/success-modal.component'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    AlertModalComponent,
    SuccessModalComponent
  ],
  exports: [
    AlertModalComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild()
  ]
})
export class ModalsModule { }
