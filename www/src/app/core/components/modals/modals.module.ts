import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AlertModalComponent } from './alert-modal/alert-modal.component'
import { SuccessModalComponent } from './success-modal/success-modal.component'
import { TranslateModule } from '@ngx-translate/core'
import { ErrorModalComponent } from './error-modal/error-modal.component'
import { InfoModalComponent } from './info-modal/info-modal.component'
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component'
import { CustomerModalComponent } from './customer-modal/customer-modal.component'
import { FormsModule } from '@angular/forms'
import { CoreComponentsModule } from '../components.module'

@NgModule({
  declarations: [
    AlertModalComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    InfoModalComponent,
    ConfirmModalComponent,
    CustomerModalComponent
  ],
  exports: [
    AlertModalComponent,
    SuccessModalComponent,
    ErrorModalComponent,
    InfoModalComponent,
    ConfirmModalComponent,
    CustomerModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreComponentsModule,
    TranslateModule.forChild()
  ]
})
export class ModalsModule { }
