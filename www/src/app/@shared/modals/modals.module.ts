import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ModalsContainerComponent } from './modals-container/modals-container.component'

@NgModule({
  declarations: [
    ModalsContainerComponent
  ],
  exports: [
    ModalsContainerComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ModalsModule { }
