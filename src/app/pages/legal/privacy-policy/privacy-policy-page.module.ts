import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PrivacyPolicyPageComponent } from './privacy-policy-page.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [
    PrivacyPolicyPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{
      path: '',
      component: PrivacyPolicyPageComponent
    }])
  ]
})
export class PrivacyPolicyPageModule { }
