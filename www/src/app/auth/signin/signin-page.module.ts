import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SigninPageComponent } from './signin-page.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [
    SigninPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path: '',
      component: SigninPageComponent
    }])
  ]
})
export class SigninPageModule { }
