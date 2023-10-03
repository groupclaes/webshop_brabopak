import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LeafletPageComponent } from './leaflet-page.component'
import { RouterModule } from '@angular/router'
import { PdfViewerModule } from 'ng2-pdf-viewer'

@NgModule({
  declarations: [
    LeafletPageComponent
  ],
  imports: [
    CommonModule,
    PdfViewerModule,
    RouterModule.forChild([{
      path: '',
      component: LeafletPageComponent
    }])
  ]
})
export class LeafletPageModule { }
