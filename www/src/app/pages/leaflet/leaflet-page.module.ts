import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LeafletPageComponent } from './leaflet-page.component'
import { RouterModule } from '@angular/router'
import { PdfViewerModule } from 'ng2-pdf-viewer'
import { CoreComponentsModule } from 'src/app/core/components/components.module'

@NgModule({
  declarations: [
    LeafletPageComponent
  ],
  imports: [
    CommonModule,
    PdfViewerModule,
    CoreComponentsModule,
    RouterModule.forChild([{
      path: '',
      component: LeafletPageComponent
    }])
  ]
})
export class LeafletPageModule { }
