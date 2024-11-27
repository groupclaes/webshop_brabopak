import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'
import { CustomerModalComponent } from './customer-modal/customer-modal.component'
import { FormsModule } from '@angular/forms'
import { CoreComponentsModule } from '../components.module'

@NgModule({
  declarations: [
    CustomerModalComponent
  ],
  exports: [
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
