import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AccordionComponent } from './accordion/accordion.component'
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component'
import { RouterModule } from '@angular/router'
import { PaginationComponent } from './pagination/pagination.component'
import { PipesModule } from '../pipes/pipes.module'
import { LoaderComponent } from './loader/loader.component'

@NgModule({
  declarations: [
    AccordionComponent,
    BreadcrumbsComponent,
    PaginationComponent,
    LoaderComponent
  ],
  exports: [
    AccordionComponent,
    BreadcrumbsComponent,
    PaginationComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule
  ]
})
export class CoreComponentsModule { }
