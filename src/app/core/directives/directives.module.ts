import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MagnifierDirective } from './magnifier.directive'

@NgModule({
  declarations: [
    MagnifierDirective
  ],
  exports: [
    MagnifierDirective
  ],
  imports: [
    CommonModule
  ]
})
export class DirectivesModule { }
