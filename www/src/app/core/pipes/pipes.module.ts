import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FilterEmptyPipe } from './filter-empty.pipe';
import { ThumbSmallPipe } from './thumb-small.pipe'

@NgModule({
  declarations: [
    FilterEmptyPipe,
    ThumbSmallPipe
  ],
  exports: [
    FilterEmptyPipe,
    ThumbSmallPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
