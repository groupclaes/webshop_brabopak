import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TermsAndConditionsPageComponent } from './terms-and-conditions-page.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [
    TermsAndConditionsPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: TermsAndConditionsPageComponent
    }])
  ]
})
export class TermsAndConditionsPageModule { }
