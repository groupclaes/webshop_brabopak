import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SignupPageComponent } from './signup-page.component'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    SignupPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LocalizeRouterModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: SignupPageComponent
    }])
  ]
})
export class SignupPageModule { }
