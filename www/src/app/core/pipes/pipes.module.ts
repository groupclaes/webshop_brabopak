import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FilterEmptyPipe } from './filter-empty.pipe';
import { ThumbSmallPipe } from './thumb-small.pipe';
import { ActivePagesPipe } from './active-pages.pipe'

@NgModule({
  declarations: [
    FilterEmptyPipe,
    ThumbSmallPipe,
    ActivePagesPipe
  ],
  exports: [
    FilterEmptyPipe,
    ThumbSmallPipe,
    ActivePagesPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
