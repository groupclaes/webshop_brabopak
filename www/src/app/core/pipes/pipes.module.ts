import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FilterEmptyPipe } from './filter-empty.pipe'

@NgModule({
  declarations: [
    FilterEmptyPipe
  ],
  exports: [FilterEmptyPipe],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
