import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SigninPageComponent } from './signin-page.component'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha'
import { TranslateModule } from '@ngx-translate/core'
import { environment } from 'src/environments/environment'
import { LocalizeRouterModule } from '@gilsdav/ngx-translate-router'

@NgModule({
  declarations: [
    SigninPageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RecaptchaV3Module,
    LocalizeRouterModule,
    RouterModule.forChild([{
      path: '',
      component: SigninPageComponent
    }])
  ],
  providers: [{
    provide: RECAPTCHA_V3_SITE_KEY,
    useValue: environment.google_recaptcha,
  }]
})
export class SigninPageModule { }
