import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LazyImageDirective } from './lazy-image.directive'

@NgModule({
  declarations: [
    LazyImageDirective
  ],
  exports: [
    LazyImageDirective
  ],
  imports: [
    CommonModule
  ]
})
export class AtSharedModule { }
